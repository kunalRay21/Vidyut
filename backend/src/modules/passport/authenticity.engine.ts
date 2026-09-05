/**
 * Vidyut Evidence Authenticity & Skill Decay Engine
 * Computes deterministic confidence ratings and decay states based on multi-source proof.
 */

import { 
  EvidenceItem, 
  AuthenticityLevel, 
  DecayStatus,
  SkillProficiency 
} from './skillPassport.types';

// Weights for evidence sources (0.0 to 1.0 scale)
export const EVIDENCE_WEIGHTS: Record<EvidenceItem['type'], number> = {
  RESUME_PARSED: 0.15,
  CERTIFICATE: 0.35,
  GITHUB_REPOSITORY: 0.55,
  DIAGNOSTIC_ASSESSMENT: 0.80,
  PRACTICAL_SIMULATION: 0.95,
  EMPLOYER_VERIFICATION: 1.00,
};

// Half-life decay parameters (decay starts after 90 days without activity)
const GRACE_PERIOD_DAYS = 90;
const MONTHLY_DECAY_RATE = 0.035; // 3.5% decay per month after grace period
const MAX_DECAY_PERCENTAGE = 0.35; // Maximum 35% decay (never completely zeroes out knowledge)

export class AuthenticityEngine {
  /**
   * Calculates compound confidence score (0 - 100%) from multiple evidence items.
   * Uses diminishing returns formula so a student cannot reach 100% simply from 10 resume claims.
   */
  public static calculateCompoundConfidence(evidenceItems: EvidenceItem[]): {
    confidence: number;
    level: AuthenticityLevel;
    breakdown: {
      assessmentPct: number;
      practicalProjectsPct: number;
      credentialsPct: number;
      industryEndorsementPct: number;
    };
  } {
    if (!evidenceItems || evidenceItems.length === 0) {
      return {
        confidence: 10,
        level: 'UNVERIFIED_CLAIM',
        breakdown: { assessmentPct: 0, practicalProjectsPct: 0, credentialsPct: 0, industryEndorsementPct: 0 },
      };
    }

    let rawScoreSum = 0;
    let maxWeight = 0;
    let hasAssessment = false;
    let hasSimulation = false;
    let hasEmployer = false;
    let hasGitHub = false;
    let hasCert = false;

    // Component contribution buckets
    let assessmentPoints = 0;
    let projectPoints = 0;
    let credentialPoints = 0;
    let employerPoints = 0;

    for (const item of evidenceItems) {
      const weight = EVIDENCE_WEIGHTS[item.type] || 0.15;
      if (weight > maxWeight) maxWeight = weight;

      // Quality modifier based on evidence score (e.g. 85% on diagnostic test)
      const qualityFactor = item.score !== undefined ? Math.max(0.4, item.score / 100) : 0.75;
      const points = weight * 100 * qualityFactor;

      rawScoreSum += points;

      if (item.type === 'DIAGNOSTIC_ASSESSMENT') {
        hasAssessment = true;
        assessmentPoints += points;
      } else if (item.type === 'PRACTICAL_SIMULATION') {
        hasSimulation = true;
        assessmentPoints += points * 1.1;
      } else if (item.type === 'GITHUB_REPOSITORY') {
        hasGitHub = true;
        projectPoints += points;
      } else if (item.type === 'CERTIFICATE') {
        hasCert = true;
        credentialPoints += points;
      } else if (item.type === 'EMPLOYER_VERIFICATION') {
        hasEmployer = true;
        employerPoints += points;
      }
    }

    // Compound saturation formula: base from highest tier evidence + log-scaling bonus from other evidence
    // Highest single tier anchor
    const anchorScore = maxWeight * 78;
    const additionalBreadth = Math.log10(1 + (rawScoreSum / 60)) * 22;

    const baseConfidence = Math.min(100, Math.round(anchorScore + additionalBreadth));

    // Determine Authenticity Level
    let level: AuthenticityLevel = 'UNVERIFIED_CLAIM';
    if (hasEmployer) {
      level = 'INDUSTRY_ENDORSED';
    } else if (hasSimulation) {
      level = 'SIMULATION_VALIDATED';
    } else if (hasAssessment) {
      level = 'ASSESSMENT_VERIFIED';
    } else if (hasGitHub) {
      level = 'PROJECT_PROVEN';
    } else if (hasCert) {
      level = 'CREDENTIAL_BACKED';
    } else if (baseConfidence >= 25) {
      level = 'SELF_ATTESTED';
    }

    // Normalize breakdown percentages (0 - 100% of total confidence)
    const totalPoints = assessmentPoints + projectPoints + credentialPoints + employerPoints || 1;
    const breakdown = {
      assessmentPct: Math.round((assessmentPoints / totalPoints) * baseConfidence),
      practicalProjectsPct: Math.round((projectPoints / totalPoints) * baseConfidence),
      credentialsPct: Math.round((credentialPoints / totalPoints) * baseConfidence),
      industryEndorsementPct: Math.round((employerPoints / totalPoints) * baseConfidence),
    };

    return {
      confidence: Math.max(12, Math.min(100, baseConfidence)),
      level,
      breakdown,
    };
  }

  /**
   * Calculates skill decay based on time elapsed since last verified demonstration.
   */
  public static calculateDecay(
    originalConfidence: number,
    lastVerifiedDateStr: string
  ): DecayStatus {
    const lastDate = new Date(lastVerifiedDateStr);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= GRACE_PERIOD_DAYS) {
      return {
        isDecayed: false,
        monthsSinceLastVerification: Math.round(diffDays / 30),
        originalConfidence,
        currentConfidence: originalConfidence,
        decayPercentage: 0,
        refresherRecommended: false,
        recommendedRefresherTimeMinutes: 0,
        lastActiveDate: lastVerifiedDateStr,
      };
    }

    // Days past grace period
    const overdueDays = diffDays - GRACE_PERIOD_DAYS;
    const overdueMonths = overdueDays / 30;

    // Decay formula with max ceiling
    const rawDecay = Math.min(MAX_DECAY_PERCENTAGE, overdueMonths * MONTHLY_DECAY_RATE);
    const currentConfidence = Math.max(15, Math.round(originalConfidence * (1 - rawDecay)));
    const decayPercentage = Math.round(rawDecay * 100);

    const refresherRecommended = decayPercentage >= 5;
    // Micro-refresher time estimated dynamically: 15 to 35 mins
    const recommendedRefresherTimeMinutes = Math.min(35, Math.max(15, Math.round(decayPercentage * 1.5)));

    return {
      isDecayed: decayPercentage > 0,
      monthsSinceLastVerification: Math.round(diffDays / 30),
      originalConfidence,
      currentConfidence,
      decayPercentage,
      refresherRecommended,
      recommendedRefresherTimeMinutes,
      lastActiveDate: lastVerifiedDateStr,
    };
  }

  /**
   * Derives proficiency level from confidence score and assessment performance.
   */
  public static deriveProficiency(confidenceScore: number): SkillProficiency {
    if (confidenceScore >= 85) return 'EXPERT';
    if (confidenceScore >= 70) return 'PROFICIENT';
    if (confidenceScore >= 50) return 'COMPETENT';
    if (confidenceScore >= 25) return 'NOVICE';
    return 'AWARENESS';
  }
}
