/**
 * ai.service.ts
 * Role 5 — AI / Recommendation Engine — Step 4
 *
 * Centralized AI orchestration boundary.
 * Other modules must call this service, never the AIClient directly.
 */

import type { AIClient, AIService, ExplanationInput } from './ai.types';
import { buildExplanationPrompt } from './prompts/explanation.prompt';
import { AIExplanationSchema } from './validators/explanation.validator';

export class CentralizedAIService implements AIService {
  constructor(private client: AIClient) {}

  async generateOpportunityExplanation(
    input: ExplanationInput
  ): Promise<{ success: boolean; summary?: string }> {
    try {
      const prompt = buildExplanationPrompt(input);

      // Call the LLM with structured JSON output and low temperature
      const rawResponse = await this.client.generateText(prompt, {
        jsonOutput: true,
        temperature: 0.3,
      });

      // Parse and validate the response
      const parsed = JSON.parse(rawResponse);
      const validated = AIExplanationSchema.safeParse(parsed);

      if (!validated.success) {
        console.error('[AIService] Explanation validation failed:', validated.error.format());
        return { success: false };
      }

      return { success: true, summary: validated.data.summary };
    } catch (error) {
      console.error('[AIService] generateOpportunityExplanation failed:', error);
      // Return a controlled failure instead of throwing
      return { success: false };
    }
  }
}
