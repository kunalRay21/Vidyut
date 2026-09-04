/**
 * explanation.validator.ts
 * Role 5 — AI / Recommendation Engine — Step 4
 *
 * Validates the raw JSON output from the LLM for explanations.
 */

import { z } from 'zod';
import type { MatchExplanation } from '../../recommendation/recommendation.types';

// The AI only generates the 'summary' field.
// The rest of the MatchExplanation is populated deterministically by the Explanation Service.
export const AIExplanationSchema = z.object({
  summary: z
    .string()
    .min(1, 'Summary must not be empty')
    .refine((val) => val.split(/\s+/).length <= 40, { // Enforce word limit (allow slight leeway over 30)
      message: 'Summary must be concise (approx 30 words)',
    }),
});

export type AIExplanationResult = z.infer<typeof AIExplanationSchema>;

// Ensure MatchExplanation exactly matches the shared type
export const MatchExplanationSchema = z.object({
  summary: z.string(),
  matchingSkills: z.array(z.string()),
  gapSkills: z.array(z.string()),
  gapSeverity: z.enum(['none', 'minor', 'moderate', 'significant']),
  careerAlignment: z.enum(['direct', 'adjacent', 'indirect']),
  eligibilityStatus: z.enum(['eligible', 'likely_eligible', 'check_required']),
});

export type ValidatedMatchExplanation = z.infer<typeof MatchExplanationSchema>;
