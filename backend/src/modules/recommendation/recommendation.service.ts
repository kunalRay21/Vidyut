/**
 * recommendation.service.ts
 * Role 5 — AI / Recommendation Engine — Steps 2 + 3
 *
 * Step 2 responsibilities (unchanged):
 *   1. segmentResults()        — pure, deterministic: filter → segment → sort → cap
 *   2. getOpportunitySummary() — Role 2 dashboard contract: count stored segments
 *   3. assignSegment()         — helper for persistence logic
 *
 * Step 3 additions:
 *   4. generateRecommendations() — full orchestration:
 *        fetch profile → fetch skills → fetch opportunities →
 *        score each → segment+rank → persist → return results
 *
 * Database/infrastructure note:
 *   No Prisma client is generated yet (the Node backend is early-stage).
 *   All database/external interactions are injected via explicit interfaces.
 *   The interfaces are structurally compatible with PrismaClient and the
 *   real PostgreSQL schema (MASTER_DATABASE_SCHEMA.md Section 7).
 *
 * ISOLATION CONTRACT — segmentResults() and computeCompatibilityScore()
 * remain side-effect-free and never touch infrastructure.
 */

import type {
  CompatibilityScores,
  RecommendationSegment,
  OpportunitySummary,
} from './recommendation.types';

// Re-export scoring engine symbols so consumers can import from one place
// (matches the import paths used in the spec's test examples)
export {
  computeCompatibilityScore,
  parseEligibilityScore,
  computeInterestScore,
  PROFICIENCY_SCORES,
  DEFAULT_REQUIRED_PROFICIENCY_SCORE,
} from './scoring.engine';

// ---------------------------------------------------------------------------
// Segmentation thresholds (locked — do not change without updating tests)
// ---------------------------------------------------------------------------

/** Minimum score for READY_NOW segment (inclusive). */
export const READY_NOW_THRESHOLD = 0.75;

/** Minimum score for ALMOST_READY segment (inclusive). */
export const ALMOST_READY_THRESHOLD = 0.50;

/** Minimum score for ASPIRATIONAL segment (inclusive). */
export const ASPIRATIONAL_THRESHOLD = 0.20;

// ---------------------------------------------------------------------------
// Segment result caps (locked — matches spec Section 9.1 Step E)
// ---------------------------------------------------------------------------

/** Maximum results returned in the READY_NOW segment. */
export const READY_NOW_CAP = 10;

/** Maximum results returned in the ALMOST_READY segment. */
export const ALMOST_READY_CAP = 15;

/** Maximum results returned in the ASPIRATIONAL segment. */
export const ASPIRATIONAL_CAP = 10;

// ---------------------------------------------------------------------------
// Input type for segmentResults()
// ---------------------------------------------------------------------------

/**
 * A scored opportunity item — the minimal shape needed for segmentation.
 *
 * The generic `TItem extends ScoredItem` pattern lets callers carry
 * additional properties (id, title, organization, etc.) through the
 * segmentation step without losing their type information.
 *
 * The only field segmentResults() reads is `scores.total`.
 */
export interface ScoredItem {
  scores: Pick<CompatibilityScores, 'total'>;
}

// ---------------------------------------------------------------------------
// Output type for segmentResults()
// ---------------------------------------------------------------------------

/**
 * Three typed arrays, one per segment.
 * Each array is sorted by `scores.total` descending and capped.
 * Excluded items (score < ASPIRATIONAL_THRESHOLD) are absent from all arrays.
 */
export interface SegmentedResults<TItem extends ScoredItem> {
  readyNow: TItem[];
  almostReady: TItem[];
  aspirational: TItem[];
}

// ---------------------------------------------------------------------------
// segmentResults()
// ---------------------------------------------------------------------------

/**
 * Filters, segments, sorts, and caps a list of already-scored opportunity items.
 *
 * Segmentation rules (boundaries are inclusive on the lower end):
 *   score >= 0.75              → READY_NOW    (cap: 10)
 *   0.50 <= score < 0.75      → ALMOST_READY (cap: 15)
 *   0.20 <= score < 0.50      → ASPIRATIONAL (cap: 10)
 *   score < 0.20              → excluded
 *
 * The function is PURE:
 *   - Does not mutate the input array.
 *   - Does not call Prisma, Express, or any external service.
 *   - Output is fully deterministic for a given input.
 *
 * @param items - Array of scored items. May be empty.
 * @returns     - Three sorted, capped arrays.
 */
export function segmentResults<TItem extends ScoredItem>(
  items: TItem[]
): SegmentedResults<TItem> {
  // Collect into buckets without mutating the input
  const readyNowBucket: TItem[] = [];
  const almostReadyBucket: TItem[] = [];
  const aspirationalBucket: TItem[] = [];

  for (const item of items) {
    const score = item.scores.total;

    if (score >= READY_NOW_THRESHOLD) {
      readyNowBucket.push(item);
    } else if (score >= ALMOST_READY_THRESHOLD) {
      almostReadyBucket.push(item);
    } else if (score >= ASPIRATIONAL_THRESHOLD) {
      aspirationalBucket.push(item);
    }
    // score < ASPIRATIONAL_THRESHOLD → excluded (not added to any bucket)
  }

  // Sort each bucket descending by total score, then apply cap
  const sortDesc = (a: TItem, b: TItem): number =>
    b.scores.total - a.scores.total;

  return {
    readyNow:    [...readyNowBucket].sort(sortDesc).slice(0, READY_NOW_CAP),
    almostReady: [...almostReadyBucket].sort(sortDesc).slice(0, ALMOST_READY_CAP),
    aspirational: [...aspirationalBucket].sort(sortDesc).slice(0, ASPIRATIONAL_CAP),
  };
}

// ---------------------------------------------------------------------------
// getOpportunitySummary() — Role 2 dashboard contract
// ---------------------------------------------------------------------------

/**
 * Minimal Prisma-shaped client interface for the recommendation groupBy query.
 *
 * Using a structural interface rather than importing @prisma/client directly
 * keeps this file compilable before the Prisma schema/client is generated.
 * The real PrismaClient satisfies this interface automatically.
 *
 * When Role 2 wires up the database, pass `prisma` from the shared client
 * as the `db` argument. No changes to this function are needed.
 */
export interface RecommendationDbClient {
  recommendation: {
    groupBy(args: {
      by: string[];
      where: { studentId: string };
      _count: { segment: boolean };
    }): Promise<Array<{ segment: string; _count: { segment: number } }>>;
  };
}

/**
 * Returns the count of stored recommendation records per relevant segment
 * for a given student. Consumed by Role 2's dashboard aggregator.
 *
 * Contract:
 *   - Completes in < 100ms (single grouped DB query)
 *   - Never throws — returns { 0, 0 } if no records exist
 *   - Only exposes READY_NOW and ALMOST_READY counts (Role 2 contract)
 *   - ASPIRATIONAL count is intentionally omitted from the response
 *
 * @param studentId - The student's UUID from the authenticated session.
 * @param db        - A Prisma-compatible database client.
 * @returns         - Dashboard summary counts.
 */
export async function getOpportunitySummary(
  studentId: string,
  db: RecommendationDbClient
): Promise<OpportunitySummary> {
  const counts = await db.recommendation.groupBy({
    by: ['segment'],
    where: { studentId },
    _count: { segment: true },
  });

  const countMap = new Map<string, number>(
    counts.map((row) => [row.segment, row._count.segment])
  );

  return {
    readyNowCount:    countMap.get('READY_NOW')    ?? 0,
    almostReadyCount: countMap.get('ALMOST_READY') ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Segment assignment helper (exported for use by Step 3 persistence logic)
// ---------------------------------------------------------------------------

/**
 * Returns the RecommendationSegment for a given compatibility score,
 * or null if the score falls below the exclusion threshold.
 *
 * Useful when persisting individual recommendation records in Step 3.
 */
export function assignSegment(score: number): RecommendationSegment | null {
  if (score >= READY_NOW_THRESHOLD)    return 'READY_NOW';
  if (score >= ALMOST_READY_THRESHOLD) return 'ALMOST_READY';
  if (score >= ASPIRATIONAL_THRESHOLD) return 'ASPIRATIONAL';
  return null; // excluded
}

// ===========================================================================
// STEP 3 — Full Recommendation Orchestration
// ===========================================================================

import { computeCompatibilityScore } from './scoring.engine';
import type {
  StudentSkillState,
  RoleSkill,
  OpportunityWithTags,
  StudentProfileContext,
  CompatibilityScores as _CompatibilityScores,
  MatchExplanation,
} from './recommendation.types';

import type { ExplanationService } from './explanation.service';

// ---------------------------------------------------------------------------
// 3.1 Dependency-injection interfaces
// ---------------------------------------------------------------------------

/**
 * Minimal profile data the orchestrator needs from Role 2's profile table.
 * Maps directly to `student_profiles` columns (MASTER_DATABASE_SCHEMA.md §2).
 */
export interface StudentProfile {
  /** UUID from student_profiles.id  */
  id: string;
  /** student_profiles.year_of_study */
  yearOfStudy: number;
  /** student_profiles.interests (TEXT[]) */
  interests: string[];
  /**
   * Domain ID of selected_role.domain_id.
   * Null when the student hasn't completed onboarding / selected a role.
   */
  selectedDomainId: string | null;
  /**
   * Domain name (joined from domains.name through roles).
   * Null when selectedDomainId is null.
   */
  selectedDomainName: string | null;
}

/**
 * What Role 5 needs from a profile-capable service.
 * Role 2 owns the actual implementation.
 * Role 5 only declares the required surface.
 */
export interface ProfileService {
  /**
   * Fetches the student's core profile from student_profiles.
   * Throws if the student is not found.
   */
  getProfile(studentId: string): Promise<StudentProfile>;

  /**
   * Fetches all assessed skill states for a student.
   * Returns an empty array if no assessments exist yet.
   * Maps to student_skill_states table (MASTER_DATABASE_SCHEMA.md §4).
   */
  getSkillStates(studentId: string): Promise<StudentSkillState[]>;
}

/**
 * A single active opportunity as fetched for scoring.
 *
 * Extends OpportunityWithTags (consumed by scoring engine) with display fields
 * needed in the API response. Maps to `opportunities` + `opportunity_skill_tags`
 * (MASTER_DATABASE_SCHEMA.md §6).
 */
export interface ScoringOpportunity extends OpportunityWithTags {
  /** opportunities.id */
  id: string;
  /** opportunities.title */
  title: string;
  /** opportunities.organization */
  organization: string;
  /** opportunities.type — INTERNSHIP | HACKATHON | PROJECT */
  type: string;
  /** opportunities.mode — REMOTE | ON_SITE | HYBRID */
  mode: string;
  /** opportunities.original_url */
  originalUrl: string;
  /** opportunities.deadline (ISO date string or null) */
  deadline: string | null;
  /** opportunities.stipend */
  stipend: string | null;
  /** opportunities.source */
  source: string;
  /** opportunities.location */
  location: string | null;
}

/**
 * What Role 5 needs from an opportunity repository.
 * Role 5 does not own the opportunity table — it only reads from it.
 */
export interface OpportunityRepository {
  /**
   * Fetches all active opportunities that have enough data to be scored.
   * Must return opportunities with their skill tags joined.
   * Corresponds to: SELECT * FROM opportunities WHERE is_active = true
   *   LEFT JOIN opportunity_skill_tags USING (id)
   *
   * Returning all active opportunities is acceptable for the SIH prototype.
   * Production would add domain-based pre-filtering here.
   */
  findAllActive(): Promise<ScoringOpportunity[]>;
}

/**
 * A single recommendation record to persist.
 * Maps exactly to the `recommendations` table (MASTER_DATABASE_SCHEMA.md §7).
 *
 * explanation_json is a placeholder at Step 3 — AI explanations belong to Step 4.
 * A minimal deterministic placeholder is written so the NOT NULL constraint
 * in the schema is satisfied.
 */
export interface RecommendationRecord {
  studentId: string;
  opportunityId: string;
  compatibilityScore: number;
  segment: RecommendationSegment;
  /** JSONB explanation generated by AI or deterministic fallback. */
  explanationJson: MatchExplanation;
}

// Removed MinimalExplanationJson as it is replaced by MatchExplanation in Step 4

/**
 * Database client interface for recommendation persistence.
 *
 * Uses the same structural-interface pattern as Step 2's RecommendationDbClient
 * so the real PrismaClient satisfies it automatically once generated.
 *
 * UNIQUE constraint on (student_id, opportunity_id) → upsert semantics.
 */
export interface RecommendationPersistenceClient {
  recommendation: {
    /**
     * Inserts or updates a recommendation record.
     * Unique key: (studentId, opportunityId).
     * On conflict: update all scoring fields and generated_at.
     */
    upsert(args: {
      where: { studentId_opportunityId: { studentId: string; opportunityId: string } };
      create: {
        studentId: string;
        opportunityId: string;
        compatibilityScore: number;
        segment: string;
        explanationJson: object;
      };
      update: {
        compatibilityScore: number;
        segment: string;
        explanationJson: object;
        generatedAt: Date;
      };
    }): Promise<{ id: string }>;

    /**
     * Fetches previously-persisted recommendations for a student,
     * including the linked opportunity data for the response.
     */
    findMany(args: {
      where: { studentId: string };
      include: { opportunity: boolean };
      orderBy: { compatibilityScore: 'desc' };
    }): Promise<PersistedRecommendation[]>;
  };
}

/**
 * Shape returned by findMany with opportunity included.
 * Minimal fields needed for the API response.
 */
export interface PersistedRecommendation {
  id: string;
  studentId: string;
  opportunityId: string;
  compatibilityScore: number;
  segment: string;
  explanationJson: unknown;
  generatedAt: Date;
  opportunity: {
    id: string;
    title: string;
    organization: string;
    type: string;
    mode: string;
    originalUrl: string;
    deadline: string | null;
    stipend: string | null;
    source: string;
    location: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// 3.2 Output types for generateRecommendations()
// ---------------------------------------------------------------------------

/**
 * A fully scored + annotated opportunity ready for the API response.
 * This is what segmentResults() receives as TItem.
 */
export interface ScoredOpportunityBase {
  id: string;
  title: string;
  organization: string;
  type: string;
  mode: string;
  originalUrl: string;
  deadline: string | null;
  stipend: string | null;
  source: string;
  location: string | null;
  /** Full compatibility breakdown from the scoring engine. */
  scores: _CompatibilityScores;
  /** Segment assigned to this opportunity (null = excluded). */
  segment: RecommendationSegment | null;
  /** The skill tags to pass to ExplanationService. */
  skillTags: OpportunityWithTags['skillTags'];
}

/**
 * A fully scored + annotated opportunity ready for the API response.
 * Includes the generated explanation.
 */
export interface ScoredOpportunity extends ScoredOpportunityBase {
  explanation: MatchExplanation;
}

/**
 * Return value of generateRecommendations().
 *
 * The three arrays mirror the segment structure of segmentResults().
 * Each item has enough data for the frontend to render the recommendation card.
 */
export interface GenerateRecommendationsResult {
  readyNow: ScoredOpportunity[];
  almostReady: ScoredOpportunity[];
  aspirational: ScoredOpportunity[];
  /** Metadata for telemetry / debugging. */
  meta: {
    studentId: string;
    totalOpportunitiesScored: number;
    totalIncluded: number;
    computedAt: string; // ISO 8601
    fromCache: boolean;
  };
}

// ---------------------------------------------------------------------------
// 3.3 Options
// ---------------------------------------------------------------------------

export interface GenerateRecommendationsOptions {
  /**
   * When true: always recompute scores and overwrite persisted records.
   * When false: return persisted records if they exist (cache path).
   * Default: false.
   */
  refresh?: boolean;
}

// ---------------------------------------------------------------------------
// 3.4 generateRecommendations() — main orchestration function
// ---------------------------------------------------------------------------

/**
 * Orchestrates the full recommendation generation pipeline for a student.
 *
 * Pipeline:
 *   A. Fetch student profile (yearOfStudy, interests, selectedDomainId)
 *   B. Fetch student skill states
 *   C. If refresh=false AND persisted records exist → return cached results
 *   D. Fetch all active opportunities
 *   E. Score each opportunity using computeCompatibilityScore()
 *   F. Segment + rank using segmentResults()
 *   G. Persist each included recommendation (upsert — idempotent)
 *   H. Return structured results
 *
 * @param studentId      - UUID of the authenticated student.
 * @param db             - Database client (persistence layer).
 * @param profileService - Profile + skill state fetcher (Role 2 dependency).
 * @param opportunityRepo- Opportunity reader (Role 5 / Role 4 dependency).
 * @param explanationService - Explanation generation (Role 5 dependency).
 * @param options        - { refresh?: boolean }
 */
export async function generateRecommendations(
  studentId: string,
  db: RecommendationPersistenceClient,
  profileService: ProfileService,
  opportunityRepo: OpportunityRepository,
  explanationService: ExplanationService,
  options: GenerateRecommendationsOptions = {}
): Promise<GenerateRecommendationsResult> {
  const refresh = options.refresh ?? false;

  // ── C. Cache path: if not refreshing, check for existing records ──────────
  if (!refresh) {
    const cached = await db.recommendation.findMany({
      where: { studentId },
      include: { opportunity: true },
      orderBy: { compatibilityScore: 'desc' },
    });

    if (cached.length > 0) {
      return buildResultFromCached(studentId, cached);
    }
  }

  // ── A. Fetch student profile ────────────────────────────────────────────
  const profile = await profileService.getProfile(studentId);

  const profileContext: StudentProfileContext = {
    selectedDomainId: profile.selectedDomainId,
    yearOfStudy: profile.yearOfStudy,
    interests: profile.interests,
  };

  // ── B. Fetch student skill states ───────────────────────────────────────
  const skillStates = await profileService.getSkillStates(studentId);

  // ── D. Fetch all active opportunities ──────────────────────────────────
  const opportunities = await opportunityRepo.findAllActive();

  // ── E. Score every opportunity ─────────────────────────────────────────
  // roleSkills is empty at Step 3 (not used in current scoring formula).
  // Step 4+ will inject actual role skills when explanations need them.
  const roleSkills: RoleSkill[] = [];

  const scoredOpportunities: ScoredOpportunityBase[] = opportunities.map((opp) => {
    const scores = computeCompatibilityScore(skillStates, roleSkills, opp, profileContext);
    const segment = assignSegment(scores.total);

    return {
      id: opp.id,
      title: opp.title,
      organization: opp.organization,
      type: opp.type,
      mode: opp.mode,
      originalUrl: opp.originalUrl,
      deadline: opp.deadline,
      stipend: opp.stipend,
      source: opp.source,
      location: opp.location,
      scores,
      segment,
      skillTags: opp.skillTags,
    };
  });

  // ── F. Segment + rank ──────────────────────────────────────────────────
  const segmented = segmentResults<ScoredOpportunityBase>(scoredOpportunities);

  // ── F.2 Generate explanations only for included opportunities ────────────
  const studentSkillIds = new Set(skillStates.map((s) => s.skillId));

  const enrichWithExplanation = async (opp: ScoredOpportunityBase): Promise<ScoredOpportunity> => {
    const matchingSkills: string[] = [];
    const gapSkills: string[] = [];

    for (const tag of opp.skillTags) {
      if (studentSkillIds.has(tag.skillId)) {
        matchingSkills.push(tag.skill.name);
      } else {
        gapSkills.push(tag.skill.name);
      }
    }

    const explanation = await explanationService.generateExplanation(
      opp.title,
      opp.organization,
      opp.type,
      opp.scores.total,
      matchingSkills,
      gapSkills,
      opp.scores.careerAlignment,
      opp.scores.eligibility,
      opp.skillTags.length
    );

    return {
      ...opp,
      explanation,
    };
  };

  const readyNow = await Promise.all(segmented.readyNow.map(enrichWithExplanation));
  const almostReady = await Promise.all(segmented.almostReady.map(enrichWithExplanation));
  const aspirational = await Promise.all(segmented.aspirational.map(enrichWithExplanation));

  // ── G. Persist (upsert — idempotent) ──────────────────────────────────
  const allIncluded = [
    ...readyNow,
    ...almostReady,
    ...aspirational,
  ];

  // Fire upserts in parallel — each is an independent idempotent write
  await Promise.all(
    allIncluded.map((item) => {
      const segment = item.segment!; // guaranteed non-null (excluded items aren't here)
      return db.recommendation.upsert({
        where: {
          studentId_opportunityId: { studentId, opportunityId: item.id },
        },
        create: {
          studentId,
          opportunityId: item.id,
          compatibilityScore: item.scores.total,
          segment,
          explanationJson: item.explanation,
        },
        update: {
          compatibilityScore: item.scores.total,
          segment,
          explanationJson: item.explanation,
          generatedAt: new Date(),
        },
      });
    })
  );

  // ── H. Return results ──────────────────────────────────────────────────
  const totalIncluded = allIncluded.length;
  return {
    readyNow,
    almostReady,
    aspirational,
    meta: {
      studentId,
      totalOpportunitiesScored: opportunities.length,
      totalIncluded,
      computedAt: new Date().toISOString(),
      fromCache: false,
    },
  };
}

// ---------------------------------------------------------------------------
// 3.5 Build result from cached persisted records
// ---------------------------------------------------------------------------

/**
 * Reconstructs a GenerateRecommendationsResult from previously-persisted
 * recommendation records. Called when refresh=false and records exist.
 */
function buildResultFromCached(
  studentId: string,
  cached: PersistedRecommendation[]
): GenerateRecommendationsResult {
  const toScoredOpportunity = (rec: PersistedRecommendation): ScoredOpportunity => {
    const opp = rec.opportunity;
    const explanation = (rec.explanationJson as MatchExplanation | null) ?? {
      summary: '',
      matchingSkills: [],
      gapSkills: [],
      gapSeverity: 'none',
      careerAlignment: 'indirect',
      eligibilityStatus: 'check_required',
    };

    return {
      id: rec.opportunityId,
      title: opp?.title ?? '',
      organization: opp?.organization ?? '',
      type: opp?.type ?? '',
      mode: opp?.mode ?? '',
      originalUrl: opp?.originalUrl ?? '',
      deadline: opp?.deadline ?? null,
      stipend: opp?.stipend ?? null,
      source: opp?.source ?? '',
      location: opp?.location ?? null,
      scores: {
        total: rec.compatibilityScore,
        // Component scores are not stored in schema — use total as proxy
        // (Step 4 may extend schema to store them individually)
        skillMatch: rec.compatibilityScore,
        careerAlignment: rec.compatibilityScore,
        eligibility: rec.compatibilityScore,
        interest: rec.compatibilityScore,
      },
      segment: rec.segment as RecommendationSegment,
      skillTags: [], // Cached items don't have skillTags unless we include them in the DB query
      explanation,
    };
  };

  const readyNow: ScoredOpportunity[] = [];
  const almostReady: ScoredOpportunity[] = [];
  const aspirational: ScoredOpportunity[] = [];

  for (const rec of cached) {
    const item = toScoredOpportunity(rec);
    if (rec.segment === 'READY_NOW') readyNow.push(item);
    else if (rec.segment === 'ALMOST_READY') almostReady.push(item);
    else if (rec.segment === 'ASPIRATIONAL') aspirational.push(item);
  }

  return {
    readyNow,
    almostReady,
    aspirational,
    meta: {
      studentId,
      totalOpportunitiesScored: cached.length,
      totalIncluded: cached.length,
      computedAt: new Date().toISOString(),
      fromCache: true,
    },
  };
}
