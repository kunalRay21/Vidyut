/**
 * ai.client.ts
 * Role 5 — AI / Recommendation Engine — Step 4
 *
 * The ONLY file allowed to import from `@google/generative-ai`.
 * Wraps the Gemini SDK so the rest of the application remains isolated.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIClient } from './ai.types';

export class GeminiClient implements AIClient {
  private genAI: GoogleGenerativeAI;
  // Default to the prototype model
  private modelName = 'gemini-1.5-flash';

  constructor(apiKey: string | undefined) {
    // If no key is provided, GoogleGenerativeAI throws an error.
    // We catch it or let it fail, but we never hardcode keys.
    this.genAI = new GoogleGenerativeAI(apiKey || 'MISSING_KEY');
  }

  async generateText(
    prompt: string,
    options?: { jsonOutput?: boolean; temperature?: number }
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.3, // low temp for deterministic tone
        responseMimeType: options?.jsonOutput ? 'application/json' : 'text/plain',
      } as any,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) {
      throw new Error('Gemini returned empty response text');
    }
    return text;
  }
}
