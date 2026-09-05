import { query } from '../../../database/db';
import { memoryStore, StoredUnmatchedSkill, StoredSkillAlias } from '../../../database/store';

export interface SkillMatchResult {
  matchedSkillIds: string[];
  unmatchedSkills: string[];
}

interface SkillRecord {
  id: string;
  name: string;
}

interface AliasRecord {
  id: string;
  alias: string;
  skill_id: string;
}

export async function matchOpportunitySkills(
  rawSkillStrings: string[],
  source: string,
  opportunityTitle: string
): Promise<SkillMatchResult> {
  const matchedSkillIds: Set<string> = new Set();
  const unmatchedSkills: string[] = [];

  // 1. Fetch canonical skills and aliases from PostgreSQL (or fallback memory)
  let dbSkills: SkillRecord[] = [];
  let dbAliases: AliasRecord[] = [];

  try {
    const skillsRes = await query<SkillRecord>(`SELECT id, name FROM skills`);
    dbSkills = skillsRes.rows || [];

    const aliasesRes = await query<AliasRecord>(`SELECT id, alias, skill_id FROM skill_aliases`);
    dbAliases = aliasesRes.rows || [];
  } catch {
    // In-memory fallback
  }

  // Build lookup maps
  const canonicalMap = new Map<string, string>(); // lowercase name -> skill_id
  for (const s of dbSkills) {
    canonicalMap.set(s.name.trim().toLowerCase(), s.id);
  }

  const aliasMap = new Map<string, string>(); // lowercase alias -> skill_id
  for (const a of dbAliases) {
    aliasMap.set(a.alias.trim().toLowerCase(), a.skill_id);
  }

  // Populate fallback memory aliases
  for (const [, a] of memoryStore.skill_aliases) {
    aliasMap.set(a.alias.trim().toLowerCase(), a.skill_id);
  }

  // Known default alias fallbacks for clean matching
  const defaultAliases: Record<string, string> = {
    'reactjs': 'react',
    'react.js': 'react',
    'nodejs': 'node.js',
    'expressjs': 'express',
    'golang': 'go',
    'postgres': 'postgresql',
    'py': 'python',
    'js': 'javascript',
    'ts': 'typescript',
  };

  for (const raw of rawSkillStrings) {
    if (!raw || !raw.trim()) continue;
    const cleanRaw = raw.trim();
    const lowerRaw = cleanRaw.toLowerCase();

    // Check 1: Direct canonical name match
    if (canonicalMap.has(lowerRaw)) {
      matchedSkillIds.add(canonicalMap.get(lowerRaw)!);
      continue;
    }

    // Check 2: Registered DB/Memory Alias match
    if (aliasMap.has(lowerRaw)) {
      matchedSkillIds.add(aliasMap.get(lowerRaw)!);
      continue;
    }

    // Check 3: Built-in default alias map
    if (defaultAliases[lowerRaw] && canonicalMap.has(defaultAliases[lowerRaw])) {
      matchedSkillIds.add(canonicalMap.get(defaultAliases[lowerRaw])!);
      continue;
    }

    // Check 4: Partial substring match against canonical skills if exact match missed
    let foundSub = false;
    for (const [cName, cId] of canonicalMap.entries()) {
      if (lowerRaw === cName || (lowerRaw.length > 3 && cName.includes(lowerRaw))) {
        matchedSkillIds.add(cId);
        foundSub = true;
        break;
      }
    }

    if (foundSub) continue;

    // UNMATCHED SKILL DETECTED
    // DO NOT insert into `skills` table! Log to `unmatched_skills` queue instead.
    unmatchedSkills.push(cleanRaw);
    await recordUnmatchedSkill(cleanRaw, source, opportunityTitle);
  }

  return {
    matchedSkillIds: Array.from(matchedSkillIds),
    unmatchedSkills,
  };
}

/**
 * Records an unmatched skill string in PostgreSQL and memory queue
 */
export async function recordUnmatchedSkill(
  rawSkillString: string,
  source: string,
  opportunityTitle: string
): Promise<void> {
  // 1. Try PostgreSQL upsert
  try {
    await query(
      `
      INSERT INTO unmatched_skills (raw_skill_string, source, opportunity_title, occurrence_count, updated_at)
      VALUES ($1, $2, $3, 1, NOW())
      ON CONFLICT (raw_skill_string, source)
      DO UPDATE SET 
        occurrence_count = unmatched_skills.occurrence_count + 1,
        opportunity_title = $3,
        updated_at = NOW()
      `,
      [rawSkillString, source, opportunityTitle]
    );
    return;
  } catch {
    // In-memory fallback
  }

  // 2. In-memory store fallback
  const key = `${rawSkillString.toLowerCase()}:${source.toLowerCase()}`;
  const existing = memoryStore.unmatched_skills.get(key);

  if (existing) {
    existing.occurrence_count += 1;
    existing.opportunity_title = opportunityTitle;
    existing.updated_at = new Date().toISOString();
  } else {
    const newItem: StoredUnmatchedSkill = {
      id: `unmatched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      raw_skill_string: rawSkillString,
      source,
      opportunity_title: opportunityTitle,
      occurrence_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.unmatched_skills.set(key, newItem);
  }
}
