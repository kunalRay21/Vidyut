/**
 * explanation.service.ts
 * Role 5 — AI / Recommendation Engine — Step 4
 *
 * Recommendation-domain explanation service.
 * Orchestrates the creation of MatchExplanation objects by calling the AI Module
 * and providing a deterministic fallback on failure.
 */

import type { MatchExplanation } from './recommendation.types';
import type { AIService, ExplanationInput } from '../ai/ai.types';

export class ExplanationService {
  constructor(private aiService?: AIService) {}

  /**
   * Generates a complete MatchExplanation for an opportunity.
   *
   * @param opportunityTitle - Title of the opportunity.
   * @param organization - Organization offering the opportunity.
   * @param type - Type of opportunity (e.g., INTERNSHIP).
   * @param compatibilityScore - Total deterministic score (0.0 - 1.0).
   * @param matchingSkills - Array of skill names the student possesses that match tags.
   * @param gapSkills - Array of skill names required by the opportunity that the student lacks.
   * @param careerScore - Deterministic career alignment score (0.0 - 1.0).
   * @param eligibilityScore - Deterministic eligibility score (0.0 - 1.0).
   * @param totalRequiredSkills - Total number of skill tags on the opportunity.
   */
  async generateExplanation(
    opportunityTitle: string,
    organization: string,
    type: string,
    compatibilityScore: number,
    matchingSkills: string[],
    gapSkills: string[],
    careerScore: number,
    eligibilityScore: number,
    totalRequiredSkills: number
  ): Promise<MatchExplanation> {
    // 1. Derive deterministic classification fields based on existing scoring facts
    const gapSeverity = this.deriveGapSeverity(gapSkills.length, totalRequiredSkills);
    const careerAlignment = this.deriveCareerAlignment(careerScore);
    const eligibilityStatus = this.deriveEligibilityStatus(eligibilityScore);

    // 2. Construct AI input
    const aiInput: ExplanationInput = {
      opportunityTitle,
      organization,
      type,
      matchingSkills,
      gapSkills,
      gapSeverity,
      careerAlignment,
      compatibilityScore,
    };

    let summary: string | undefined = undefined;

    // 3. Attempt AI call if service is injected
    if (this.aiService) {
      try {
        const result = await this.aiService.generateOpportunityExplanation(aiInput);
        if (result.success && result.summary) {
          summary = result.summary;
        }
      } catch (err) {
        console.error('[ExplanationService] aiService threw unexpectedly:', err);
      }
    }

    // 4. Deterministic fallback if AI was unavailable, failed, or timed out
    if (!summary) {
      summary = this.buildFallbackSummary(
        compatibilityScore,
        matchingSkills,
        gapSkills,
        careerAlignment
      );
    }

    // 5. Return fully constructed MatchExplanation
    return {
      summary,
      matchingSkills,
      gapSkills,
      gapSeverity,
      careerAlignment,
      eligibilityStatus,
    };
  }

  // ── Deterministic Derivation Helpers ─────────────────────────────────────────

  private deriveGapSeverity(
    gapCount: number,
    totalRequired: number
  ): MatchExplanation['gapSeverity'] {
    if (gapCount === 0) return 'none';
    if (totalRequired === 0) return 'minor'; // Benefit of doubt if tags are missing

    const ratio = gapCount / totalRequired;
    if (ratio <= 0.33) return 'minor';
    if (ratio <= 0.66) return 'moderate';
    return 'significant';
  }

  private deriveCareerAlignment(careerScore: number): MatchExplanation['careerAlignment'] {
    if (careerScore >= 0.9) return 'direct';
    if (careerScore >= 0.5) return 'adjacent';
    return 'indirect';
  }

  private deriveEligibilityStatus(eligibilityScore: number): MatchExplanation['eligibilityStatus'] {
    if (eligibilityScore >= 0.9) return 'eligible';
    if (eligibilityScore >= 0.6) return 'likely_eligible';
    return 'check_required';
  }

  // ── Deterministic Template Fallback ────────────────────────────────────────

  /**
   * Constructs a fallback summary based purely on the given facts.
   * Never invents data.
   */
  private buildFallbackSummary(
    score: number,
    matchingSkills: string[],
    gapSkills: string[],
    careerAlignment: string
  ): string {
    const isReadyNow = score >= 0.75;
    const isAlmostReady = score >= 0.50;

    // Case 1: Perfect skill match
    if (gapSkills.length === 0) {
      if (matchingSkills.length > 0) {
        return `Strong match — your ${matchingSkills.slice(0, 3).join(', ')} skills align perfectly with this role.`;
      }
      return careerAlignment === 'direct'
        ? 'This opportunity directly aligns with your career path.'
        : 'This opportunity aligns with your profile.';
    }

    // Case 2: Complete skill mismatch or no matching skills
    if (matchingSkills.length === 0) {
      return `This opportunity would help you develop ${gapSkills.slice(0, 2).join(' and ')} skills for your career.`;
    }

    // Case 3: Mixed skills (the most common case)
    if (isReadyNow) {
      return `Strong match on ${matchingSkills.slice(0, 2).join(' and ')}. Strengthening ${gapSkills[0]} would make you a top candidate.`;
    }
    
    if (isAlmostReady) {
      return `Good alignment with your ${matchingSkills[0]} skills, but some development in ${gapSkills.slice(0, 2).join(' and ')} is needed.`;
    }

    return `Interest and domain alignment exists, but more skill development in ${gapSkills.slice(0, 2).join(', ')} is needed.`;
  }
}
