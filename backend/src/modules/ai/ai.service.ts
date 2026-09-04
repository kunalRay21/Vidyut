/**
 * ai.service.ts
 * Role 5 — AI / Recommendation Engine — Step 4
 *
 * Centralized AI orchestration boundary.
 * Other modules must call this service, never the AIClient directly.
 */

import type { 
  AIClient, 
  AIService, 
  ExplanationInput,
  AssessmentQuestionInput,
  AssessmentQuestion,
  SkillExtractionInput,
  ExtractedSkill,
  CareerExplanationInput
} from './ai.types';

import { buildExplanationPrompt } from './prompts/explanation.prompt';
import { AIExplanationSchema } from './validators/explanation.validator';

import { buildQuestionsPrompt } from './prompts/questions.prompt';
import { AIAssessmentQuestionSchema } from './validators/questions.validator';

import { buildSkillsPrompt } from './prompts/skills.prompt';
import { AISkillExtractionSchema } from './validators/skills.validator';

import { buildCareerPrompt } from './prompts/career.prompt';
import { AICareerExplanationSchema } from './validators/career.validator';

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

  async generateAssessmentQuestions(
    input: AssessmentQuestionInput
  ): Promise<{ success: boolean; questions?: AssessmentQuestion[] }> {
    try {
      const prompt = buildQuestionsPrompt(input);
      const rawResponse = await this.client.generateText(prompt, {
        jsonOutput: true,
        temperature: 0.7, // slightly higher temperature for creative questions
      });

      const parsed = JSON.parse(rawResponse);
      const validated = AIAssessmentQuestionSchema.safeParse(parsed);

      if (!validated.success) {
        console.error('[AIService] Assessment validation failed:', validated.error.format());
        return { success: false };
      }

      return { success: true, questions: validated.data.questions };
    } catch (error) {
      console.error('[AIService] generateAssessmentQuestions failed:', error);
      return { success: false };
    }
  }

  async extractSkillsFromText(
    input: SkillExtractionInput
  ): Promise<{ success: boolean; skills?: ExtractedSkill[] }> {
    try {
      const prompt = buildSkillsPrompt(input);
      const rawResponse = await this.client.generateText(prompt, {
        jsonOutput: true,
        temperature: 0.1, // very low temperature for extraction
      });

      const parsed = JSON.parse(rawResponse);
      const validated = AISkillExtractionSchema.safeParse(parsed);

      if (!validated.success) {
        console.error('[AIService] Skill extraction validation failed:', validated.error.format());
        return { success: false };
      }

      return { success: true, skills: validated.data.skills };
    } catch (error) {
      console.error('[AIService] extractSkillsFromText failed:', error);
      return { success: false };
    }
  }

  async generateCareerExplanation(
    input: CareerExplanationInput
  ): Promise<{ success: boolean; explanation?: string }> {
    try {
      const prompt = buildCareerPrompt(input);
      const rawResponse = await this.client.generateText(prompt, {
        jsonOutput: true,
        temperature: 0.3, 
      });

      const parsed = JSON.parse(rawResponse);
      const validated = AICareerExplanationSchema.safeParse(parsed);

      if (!validated.success) {
        console.error('[AIService] Career explanation validation failed:', validated.error.format());
        return { success: false };
      }

      return { success: true, explanation: validated.data.explanation };
    } catch (error) {
      console.error('[AIService] generateCareerExplanation failed:', error);
      return { success: false };
    }
  }
}
