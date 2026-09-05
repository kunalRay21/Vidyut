/**
 * scoring.engine.ts
 * Role 5 — AI / Recommendation Engine
 *
 * Pure TypeScript business-logic component implementing the deterministic
 * Compatibility Scoring Engine as documented in Section 18 of the Role 5 spec.
 *
 * ISOLATION CONTRACT — this module must never import from:
 *   - Prisma / database
 *   - Express / HTTP layer
 *   - Authentication middleware
 *   - AI services (Gemini, OpenAI)
 *   - Redis or any external service
 *
 * It receives structured plain-object inputs and returns structured outputs.
 * All computation is deterministic and synchronous.
 */

import type {
  StudentSkillState,
  RoleSkill,
  OpportunityWithTags,
  StudentProfileContext,
  CompatibilityScores,
} from './recommendation.types';

// ---------------------------------------------------------------------------
// 18.1 Proficiency level numerical scores
// ---------------------------------------------------------------------------

/**
 * Maps each proficiency level to its numeric score.
 * UNASSESSED = 0 so a student with no data for a skill contributes nothing.
 */
export const PROFICIENCY_SCORES: Readonly<Record<string, number>> = {
  UNASSESSED: 0,
  AWARENESS: 1,
  BEGINNER: 2,
  INTERMEDIATE: 3,
  PROFICIENT: 4,
  EXPERT: 5,
};

/**
 * Default required proficiency score when an opportunity tag does not
 * specify a level. Documented simplification for the SIH prototype.
 * Value: INTERMEDIATE = 3.
 */
export const DEFAULT_REQUIRED_PROFICIENCY_SCORE: number =
  PROFICIENCY_SCORES['INTERMEDIATE']!;

// ---------------------------------------------------------------------------
// 18.3 Eligibility parsing
// ---------------------------------------------------------------------------

/**
 * Parses a free-text eligibility string and derives a score based on the
 * student's year of study.
 *
 * Rules (from Section 18.3):
 *   - Null / empty text              → 0.8  (unknown — benefit of doubt)
 *   - No year-of-study pattern found → 0.8  (cannot determine — benefit of doubt)
 *   - Student year matches a mention → 1.0  (exact match)
 *   - Student year is adjacent (±1)  → 0.5  (adjacent year)
 *   - Otherwise                      → 0.0  (clearly ineligible)
 */
export function parseEligibilityScore(
  eligibilityRaw: string | null,
  studentYear: number
): number {
  if (!eligibilityRaw || eligibilityRaw.trim() === '') return 0.8;

  const text = eligibilityRaw.toLowerCase();

  // Patterns and the year values they map to
  const patterns: Array<{ regex: RegExp; year: number }> = [
    { regex: /\b1st\s+year\b|\bfirst\s+year\b/i, year: 1 },
    { regex: /\b2nd\s+year\b|\bsecond\s+year\b/i, year: 2 },
    { regex: /\b3rd\s+year\b|\bthird\s+year\b/i, year: 3 },
    { regex: /\bfinal\s+year\b|\b4th\s+year\b/i, year: 4 },
    { regex: /\bpre[\s-]?final\b/i, year: 3 },
    { regex: /\bpenultimate\b/i, year: 3 },
  ];

  const yearMentions: number[] = [];
  for (const { regex, year } of patterns) {
    if (regex.test(text)) yearMentions.push(year);
  }

  // No recognisable year mentioned → benefit of doubt
  if (yearMentions.length === 0) return 0.8;

  // Exact match
  if (yearMentions.includes(studentYear)) return 1.0;

  // Adjacent year (±1)
  if (yearMentions.some((y) => Math.abs(y - studentYear) === 1)) return 0.5;

  // Clearly ineligible
  return 0.0;
}

// ---------------------------------------------------------------------------
// Interest scoring
// ---------------------------------------------------------------------------

/**
 * Computes the interest score by comparing the opportunity's domain name
 * against the student's declared interest strings.
 *
 * Rules (from Section 9.2 / 18.2):
 *   - Opportunity domain in student interests (exact, case-insensitive) → 1.0
 *   - Any partial substring match                                        → 0.6
 *   - No match                                                           → 0.3
 */
export function computeInterestScore(
  opportunityDomainName: string | null,
  studentInterests: string[]
): number {
  if (!opportunityDomainName) return 0.3;

  const domainLower = opportunityDomainName.toLowerCase();

  // Exact match (case-insensitive)
  for (const interest of studentInterests) {
    if (interest.toLowerCase() === domainLower) return 1.0;
  }

  // Partial match: domain contains interest string, or interest contains domain
  for (const interest of studentInterests) {
    const interestLower = interest.toLowerCase();
    if (
      domainLower.includes(interestLower) ||
      interestLower.includes(domainLower)
    ) {
      return 0.6;
    }
  }

  return 0.3;
}

// ---------------------------------------------------------------------------
// 18.2 Full compatibility score implementation
// ---------------------------------------------------------------------------

/**
 * Computes the four-component compatibility score between a student and an
 * opportunity.
 *
 * Formula (locked weights per Section 18.2):
 *   total = (skillMatch   × 0.50)
 *         + (careerAlignment × 0.25)
 *         + (eligibility  × 0.15)
 *         + (interest     × 0.10)
 *
 * All component scores are in [0.0, 1.0]. The total is rounded to 3 dp.
 *
 * @param skillStates   - The student's assessed skill states.
 * @param _roleSkills   - Role skills (accepted for API compatibility with future steps;
 *                        not used in the per-tag scoring path — tags carry their own weight).
 * @param opportunity   - The opportunity to score.
 * @param profile       - The student's profile context (domain, year, interests).
 * @returns             - CompatibilityScores with individual components and total.
 */
export function computeCompatibilityScore(
  skillStates: StudentSkillState[],
  _roleSkills: RoleSkill[],
  opportunity: OpportunityWithTags,
  profile: StudentProfileContext
): CompatibilityScores {
  // ── Build student level map ────────────────────────────────────────────
  const studentLevelMap = new Map<string, string>(
    skillStates.map((s) => [s.skillId, s.assessedLevel ?? 'UNASSESSED'])
  );

  // ── Skill Match Score ──────────────────────────────────────────────────
  let weightedSkillSum = 0;
  let totalTagWeight = 0;

  if (opportunity.skillTags.length === 0) {
    // No skill tags: neutral score — we don't know requirements
    weightedSkillSum = 0.5;
    totalTagWeight = 1;
  } else {
    for (const tag of opportunity.skillTags) {
      const tagName = tag.skill?.name;
      const tagNameLower = tagName?.toLowerCase().trim();
      const tagSlug = tagNameLower ? `skill-${tagNameLower.replace(/[^a-z0-9]/g, '-')}` : null;

      const studentLevelStr =
        studentLevelMap.get(tag.skillId) ??
        (tagName ? studentLevelMap.get(tagName) : undefined) ??
        (tagNameLower ? studentLevelMap.get(tagNameLower) : undefined) ??
        (tagSlug ? studentLevelMap.get(tagSlug) : undefined) ??
        'UNASSESSED';
      const studentScore =
        PROFICIENCY_SCORES[studentLevelStr] ?? PROFICIENCY_SCORES['UNASSESSED']!;

      // Required level: use tag's requiredLevel if present, else INTERMEDIATE
      const requiredScore =
        tag.requiredLevel !== undefined
          ? (PROFICIENCY_SCORES[tag.requiredLevel] ?? DEFAULT_REQUIRED_PROFICIENCY_SCORE)
          : DEFAULT_REQUIRED_PROFICIENCY_SCORE;

      // Cap: exceeding required does not help further (never > 1.0 contribution)
      const skillContribution = Math.min(studentScore, requiredScore) / requiredScore;

      weightedSkillSum += skillContribution * tag.confidence;
      totalTagWeight += tag.confidence;
    }
  }

  // Guard: if somehow totalTagWeight is 0, fall back to neutral
  const skillMatchScore: number =
    totalTagWeight > 0 ? weightedSkillSum / totalTagWeight : 0.5;

  // Clamp to [0, 1] as a safety measure (should not be needed by math, but
  // prevents floating-point edge cases from yielding > 1.0)
  const clampedSkillMatch = Math.min(1.0, Math.max(0.0, skillMatchScore));

  // ── Career Alignment Score ─────────────────────────────────────────────
  let careerAlignmentScore: number;

  if (opportunity.domainId === null || opportunity.domainId === undefined) {
    // Unknown domain: benefit of doubt (documented value: 0.6)
    careerAlignmentScore = 0.6;
  } else if (
    profile.selectedDomainId !== null &&
    opportunity.domainId === profile.selectedDomainId
  ) {
    // Exact domain match
    careerAlignmentScore = 1.0;
  } else {
    // Domain mismatch (documented value: 0.2)
    careerAlignmentScore = 0.2;
  }

  // ── Eligibility Score ──────────────────────────────────────────────────
  const eligibilityScore = parseEligibilityScore(
    opportunity.eligibilityRaw,
    profile.yearOfStudy
  );

  // ── Interest Score ─────────────────────────────────────────────────────
  const interestScore = computeInterestScore(
    opportunity.domain?.name ?? null,
    profile.interests
  );

  // ── Composite ──────────────────────────────────────────────────────────
  const total =
    clampedSkillMatch     * 0.50 +
    careerAlignmentScore  * 0.25 +
    eligibilityScore      * 0.15 +
    interestScore         * 0.10;

  // Round each component to 3 decimal places (as documented in Section 18.2)
  const round3 = (n: number): number => Math.round(n * 1000) / 1000;

  return {
    total:          round3(total),
    skillMatch:     round3(clampedSkillMatch),
    careerAlignment: round3(careerAlignmentScore),
    eligibility:    round3(eligibilityScore),
    interest:       round3(interestScore),
  };
}
