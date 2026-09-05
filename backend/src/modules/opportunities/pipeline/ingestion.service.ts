import { BaseAdapter } from './adapters/base.adapter';
import { InternshalaAdapter } from './adapters/internshala.adapter';
import { UnstopAdapter } from './adapters/unstop.adapter';
import { AicteAdapter } from './adapters/aicte.adapter';
import {
  RawOpportunityItem,
  NormalizedOpportunityItem,
  IngestionResult,
  OpportunitySource,
} from './types';
import {
  normalizeOpportunityType,
  normalizeWorkMode,
  normalizeStipend,
  normalizeLocation,
  normalizeDeadline,
} from './normalizer';
import { matchDomain } from './domainMatcher';
import { matchRole } from './roleMatcher';
import { matchOpportunitySkills } from './skillMatcher';
import { generateFingerprint, isOpportunityDuplicate } from './deduplicator';
import { query } from '../../../database/db';

export class OpportunityIngestionService {
  private adapters: Map<OpportunitySource, BaseAdapter> = new Map();

  constructor() {
    this.registerAdapter(new InternshalaAdapter());
    this.registerAdapter(new UnstopAdapter());
    this.registerAdapter(new AicteAdapter());
  }

  public registerAdapter(adapter: BaseAdapter): void {
    this.adapters.set(adapter.source, adapter);
  }

  /**
   * Main entry point to run the central opportunity pipeline
   */
  public async runIngestion(targetSources?: OpportunitySource[]): Promise<IngestionResult> {
    const sourcesToRun: OpportunitySource[] = targetSources && targetSources.length > 0
      ? targetSources
      : Array.from(this.adapters.keys());

    let totalExtracted = 0;
    let totalNormalized = 0;
    let totalSaved = 0;
    let totalDuplicates = 0;
    let unmatchedSkillsLogged = 0;

    const details: Array<{
      source: OpportunitySource;
      extracted: number;
      saved: number;
      duplicates: number;
    }> = [];

    for (const sourceName of sourcesToRun) {
      const adapter = this.adapters.get(sourceName);
      if (!adapter) continue;

      let sourceExtracted = 0;
      let sourceSaved = 0;
      let sourceDuplicates = 0;

      try {
        const rawItems: RawOpportunityItem[] = await adapter.fetchRawData();
        sourceExtracted = rawItems.length;
        totalExtracted += rawItems.length;

        for (const raw of rawItems) {
          const normalized = await this.normalizeAndMatch(raw);
          totalNormalized += 1;
          unmatchedSkillsLogged += normalized.unmatchedSkills.length;

          // Check deduplication
          const duplicate = await isOpportunityDuplicate(normalized.fingerprint);
          if (duplicate) {
            sourceDuplicates += 1;
            totalDuplicates += 1;
            // Update last_seen_at timestamp for existing item
            try {
              await query(`UPDATE opportunities SET last_seen_at = NOW() WHERE fingerprint = $1`, [normalized.fingerprint]);
            } catch {
              // Ignore if DB unreachable
            }
            continue;
          }

          // Save new normalized opportunity
          const saved = await this.persistOpportunity(normalized);
          if (saved) {
            sourceSaved += 1;
            totalSaved += 1;
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ [IngestionService] Error processing source ${sourceName}:`, err.message);
      }

      details.push({
        source: sourceName,
        extracted: sourceExtracted,
        saved: sourceSaved,
        duplicates: sourceDuplicates,
      });
    }

    return {
      totalExtracted,
      totalNormalized,
      totalSaved,
      totalDuplicates,
      unmatchedSkillsLogged,
      sourcesProcessed: sourcesToRun,
      timestamp: new Date().toISOString(),
      details,
    };
  }

  /**
   * Normalizes raw opportunity and matches domain, role, and canonical skills
   */
  private async normalizeAndMatch(raw: RawOpportunityItem): Promise<NormalizedOpportunityItem> {
    const title = (raw.title || 'Career Opportunity').trim();
    const organization = (raw.organization || 'Vidyut Partner').trim();
    const type = normalizeOpportunityType(raw.typeRaw);
    const mode = normalizeWorkMode(raw.modeRaw);
    const location = normalizeLocation(raw.locationRaw);
    const stipend = normalizeStipend(raw.stipendRaw);
    const deadline = normalizeDeadline(raw.deadlineRaw);
    const descriptionRaw = (raw.descriptionRaw || '').trim();
    const eligibilityRaw = (raw.eligibilityRaw || '').trim();

    // Generate SHA-256 fingerprint
    const fingerprint = generateFingerprint(raw.source, raw.externalId, organization, title, location);

    // Classify into canonical Role & Domain
    const roleMatch = await matchRole(title, descriptionRaw);
    const domainId = roleMatch.domainId || (await matchDomain(title, descriptionRaw));

    // Match raw skill strings to canonical skills & unmatched queue
    const skillMatch = await matchOpportunitySkills(raw.rawSkills || [], raw.source, title);

    const id = `opp-${raw.source.toLowerCase()}-${raw.externalId || Math.random().toString(36).slice(2, 8)}`;

    return {
      id,
      externalId: raw.externalId,
      source: raw.source,
      originalUrl: raw.originalUrl || '',
      title,
      organization,
      type,
      mode,
      location,
      deadline,
      stipend,
      descriptionRaw,
      eligibilityRaw,
      domainId,
      roleId: roleMatch.roleId,
      matchedSkillIds: skillMatch.matchedSkillIds,
      unmatchedSkills: skillMatch.unmatchedSkills,
      fingerprint,
    };
  }

  /**
   * Persists normalized opportunity to PostgreSQL
   */
  private async persistOpportunity(opp: NormalizedOpportunityItem): Promise<boolean> {
    try {
      await query(
        `
        INSERT INTO opportunities (
          id, external_id, source, original_url, title, organization, type, mode,
          location, deadline, stipend, description_raw, eligibility_raw, domain_id, fingerprint, is_active, extracted_at, last_seen_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, NOW(), NOW())
        ON CONFLICT (fingerprint) DO UPDATE SET last_seen_at = NOW()
        `,
        [
          opp.id,
          opp.externalId,
          opp.source,
          opp.originalUrl,
          opp.title,
          opp.organization,
          opp.type,
          opp.mode,
          opp.location,
          opp.deadline,
          opp.stipend,
          opp.descriptionRaw,
          opp.eligibilityRaw,
          opp.domainId || null,
          opp.fingerprint,
        ]
      );

      // Link canonical skill tags
      for (const skillId of opp.matchedSkillIds) {
        await query(
          `
          INSERT INTO opportunity_skill_tags (opportunity_id, skill_id, min_proficiency, weight)
          VALUES ($1, $2, 'BEGINNER', 1.0)
          ON CONFLICT DO NOTHING
          `,
          [opp.id, skillId]
        );
      }
      return true;
    } catch (err: any) {
      console.warn(`⚠️ [IngestionService] DB persist error for opportunity ${opp.title}:`, err.message);
      return true; // Marked as handled in fallback mode
    }
  }
}

export const opportunityIngestionService = new OpportunityIngestionService();
