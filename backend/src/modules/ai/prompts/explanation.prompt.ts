/**
 * explanation.prompt.ts
 * Role 5 — AI / Recommendation Engine — Step 4
 *
 * Prompt template for explaining a recommendation match.
 */

import type { ExplanationInput } from '../ai.types';

export function buildExplanationPrompt(input: ExplanationInput): string {
  return `You are a helpful career advisor for students.
The compatibility scores for an opportunity have already been calculated by a deterministic engine.
Do not recalculate, modify, or override them.
Generate only a concise explanation based on the supplied facts.
Do not invent skills, qualifications, eligibility information, or experience.

Return ONLY a JSON object with a single field "summary".
The summary MUST be 30 words or fewer.
It should explain to the student why this opportunity matches them and what skills they might need to improve.

Facts:
- Opportunity: ${input.opportunityTitle} at ${input.organization} (${input.type})
- Compatibility Score: ${(input.compatibilityScore * 100).toFixed(1)}%
- Matching Skills: ${input.matchingSkills.length > 0 ? input.matchingSkills.join(', ') : 'None'}
- Gap Skills (Missing): ${input.gapSkills.length > 0 ? input.gapSkills.join(', ') : 'None'}
- Gap Severity: ${input.gapSeverity}
- Career Alignment: ${input.careerAlignment}

Example Output Format:
{
  "summary": "Strong match — your Python and Git skills align well with this role. Strengthening SQL will make you a top candidate."
}`;
}
