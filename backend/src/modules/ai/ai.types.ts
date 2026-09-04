/**
 * ai.types.ts
 * Role 5 — AI / Recommendation Engine — Step 4
 *
 * Types for the centralized AI boundary.
 */

// ---------------------------------------------------------------------------
// 1. Explanation input (facts provided to the AI)
// ---------------------------------------------------------------------------

/**
 * Deterministic facts sent to the AI to generate an explanation.
 * No PII or authentication info is included.
 */
export interface ExplanationInput {
  opportunityTitle: string;
  organization: string;
  type: string;
  matchingSkills: string[];
  gapSkills: string[];
  gapSeverity: 'none' | 'minor' | 'moderate' | 'significant';
  careerAlignment: 'direct' | 'adjacent' | 'indirect';
  compatibilityScore: number;
}

// ---------------------------------------------------------------------------
// 2. Client & Service Interfaces
// ---------------------------------------------------------------------------

export interface AIClient {
  /**
   * Generates a raw string response from the LLM based on the prompt.
   * Expects JSON if configured by the caller.
   */
  generateText(prompt: string, options?: { jsonOutput?: boolean; temperature?: number }): Promise<string>;
}

export interface AIService {
  /**
   * Calls the LLM to generate an explanation, validates the JSON output,
   * and returns the summary string if successful.
   */
  generateOpportunityExplanation(input: ExplanationInput): Promise<{ success: boolean; summary?: string }>;
}
