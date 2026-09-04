/**
 * recommendation.types.ts
 * Role 5 — AI / Recommendation Engine
 *
 * All TypeScript interfaces and types for the recommendation module.
 * Matches the data contracts documented in Section 12 of the Role 5 spec.
 *
 * NOTE: This file must not import from Prisma, Express, or any external service.
 * It is a pure-type module usable in unit tests without any infrastructure.
 */

// ---------------------------------------------------------------------------
// Proficiency scale — mirrors the Prisma enum in the project schema
// ---------------------------------------------------------------------------

/** Canonical proficiency level string literals used throughout the system. */
export type ProficiencyLevel =
  | 'UNASSESSED'
  | 'AWARENESS'
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'PROFICIENT'
  | 'EXPERT';

// ---------------------------------------------------------------------------
// Scoring input types
// ---------------------------------------------------------------------------

/**
 * A single student skill state as provided by Role 2 / the database.
 * `assessedLevel` may be null if the student was assessed but the level
 * was not set — treated as UNASSESSED.
 */
export interface StudentSkillState {
  skillId: string;
  assessedLevel: ProficiencyLevel | null;
}

/**
 * A skill that belongs to the student's selected career role.
 * Supplied by Role 3's skill graph data.
 * `weight` is used in future steps; present here to keep the type stable.
 */
export interface RoleSkill {
  id: string;
  name: string;
  targetProficiency: ProficiencyLevel;
  weight: number;
}

/**
 * A skill tag on an opportunity.
 * `confidence` is the tag-level confidence score (0.0–1.0).
 * `requiredLevel` is optional; defaults to INTERMEDIATE when absent.
 */
export interface OpportunitySkillTag {
  skillId: string;
  skill: {
    name: string;
  };
  confidence: number;
  requiredLevel?: ProficiencyLevel;
}

/**
 * The minimal opportunity shape consumed by the scoring engine.
 * Role 4 populates these fields; Role 5 reads them.
 */
export interface OpportunityWithTags {
  /** Null means domain is unknown — scorer gives benefit of the doubt (0.6). */
  domainId: string | null;
  /** May be null if the opportunity has no domain assigned. */
  domain: { name: string } | null;
  /** Raw eligibility string from the opportunity record. Null = unknown. */
  eligibilityRaw: string | null;
  /** Skill tags required by this opportunity. Empty array = no requirements known. */
  skillTags: OpportunitySkillTag[];
}

/**
 * The minimal student profile context consumed by the scoring engine.
 * Sourced from Role 2's profile service / database.
 */
export interface StudentProfileContext {
  /** The domain ID of the student's selected career role. May be null if not yet selected. */
  selectedDomainId: string | null;
  /** Current year of study (1–4 for a 4-year degree). */
  yearOfStudy: number;
  /** Student's declared interest domain/area names (from onboarding). */
  interests: string[];
}

// ---------------------------------------------------------------------------
// Scoring output types
// ---------------------------------------------------------------------------

/**
 * The four component scores plus composite total returned by the scoring engine.
 * All values are in the range 0.0–1.0. `total` is rounded to 3 decimal places.
 */
export interface CompatibilityScores {
  /** Composite weighted score: 0.50×skill + 0.25×career + 0.15×eligibility + 0.10×interest */
  total: number;
  /** Weighted skill proficiency match: 0.0–1.0 */
  skillMatch: number;
  /** Domain alignment between opportunity and student career: 0.0–1.0 */
  careerAlignment: number;
  /** Year-of-study eligibility match: 0.0–1.0 */
  eligibility: number;
  /** Interest/domain overlap: 0.0–1.0 */
  interest: number;
}

// ---------------------------------------------------------------------------
// Recommendation segment (used in later steps — defined here for type stability)
// ---------------------------------------------------------------------------

export type RecommendationSegment = 'READY_NOW' | 'ALMOST_READY' | 'ASPIRATIONAL';

// ---------------------------------------------------------------------------
// Explanation types (used in later steps — defined here for type stability)
// ---------------------------------------------------------------------------

export interface MatchExplanation {
  summary: string;
  matchingSkills: string[];
  gapSkills: string[];
  gapSeverity: 'none' | 'minor' | 'moderate' | 'significant';
  careerAlignment: 'direct' | 'adjacent' | 'indirect';
  eligibilityStatus: 'eligible' | 'likely_eligible' | 'check_required';
}

export interface OpportunitySummary {
  readyNowCount: number;
  almostReadyCount: number;
}

// ---------------------------------------------------------------------------
// Resource Recommendation types (Step 5)
// ---------------------------------------------------------------------------

export type RoadmapSkillStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface RoadmapSkillState {
  skillId: string;
  skillName: string;
  status: RoadmapSkillStatus;
  sequence: number;
  currentProficiency: ProficiencyLevel | null;
  targetProficiency: ProficiencyLevel;
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: string;
  isFree: boolean;
  provider: string | null;
}

export interface ResourceRecommendation {
  skillId: string;
  skillName: string;
  currentProficiency: ProficiencyLevel | null;
  targetProficiency: ProficiencyLevel;
  resources: ResourceItem[];
}

export interface ResourceRecommendationResponse {
  skillResources: ResourceRecommendation[];
}

