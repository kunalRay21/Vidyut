import { ExplanationService } from '../../src/modules/recommendation/explanation.service';
import type { AIService } from '../../src/modules/ai/ai.types';

const mockGenerateOpportunityExplanation = jest.fn();

const mockAiService: AIService = {
  generateOpportunityExplanation: mockGenerateOpportunityExplanation,
};

describe('ExplanationService', () => {
  let explanationService: ExplanationService;

  beforeEach(() => {
    jest.clearAllMocks();
    explanationService = new ExplanationService(mockAiService);
  });

  describe('generateExplanation', () => {
    const defaultArgs: [string, string, string, number, string[], string[], number, number, number] = [
      'Software Engineer', // title
      'Tech Corp',         // org
      'INTERNSHIP',        // type
      0.8,                 // compatibilityScore
      ['Node.js'],         // matchingSkills
      ['React'],           // gapSkills
      0.9,                 // careerScore
      0.9,                 // eligibilityScore
      2,                   // totalRequiredSkills
    ];

    it('returns AI response when AI service is successful', async () => {
      mockGenerateOpportunityExplanation.mockResolvedValueOnce({
        success: true,
        summary: 'AI Summary',
      });

      const result = await explanationService.generateExplanation(...defaultArgs);

      expect(mockGenerateOpportunityExplanation).toHaveBeenCalled();
      expect(result.summary).toBe('AI Summary');
      expect(result.gapSeverity).toBe('moderate');
      expect(result.careerAlignment).toBe('direct');
      expect(result.eligibilityStatus).toBe('eligible');
    });

    it('returns deterministic fallback when AI service is not provided', async () => {
      const serviceNoAi = new ExplanationService();
      
      const result = await serviceNoAi.generateExplanation(...defaultArgs);

      expect(mockGenerateOpportunityExplanation).not.toHaveBeenCalled();
      expect(result.summary).toContain('Strong match on Node.js. Strengthening React would make you a top candidate.');
    });

    it('returns deterministic fallback when AI service fails', async () => {
      mockGenerateOpportunityExplanation.mockResolvedValueOnce({ success: false });

      const result = await explanationService.generateExplanation(...defaultArgs);

      expect(mockGenerateOpportunityExplanation).toHaveBeenCalled();
      expect(result.summary).toContain('Strong match on Node.js. Strengthening React would make you a top candidate.');
    });
    
    it('returns deterministic fallback when AI service throws', async () => {
      mockGenerateOpportunityExplanation.mockRejectedValueOnce(new Error('Network issue'));

      const result = await explanationService.generateExplanation(...defaultArgs);

      expect(mockGenerateOpportunityExplanation).toHaveBeenCalled();
      expect(result.summary).toContain('Strong match on Node.js. Strengthening React would make you a top candidate.');
    });

    it('correctly categorizes gapSeverity based on gap/total ratio', async () => {
      mockGenerateOpportunityExplanation.mockResolvedValueOnce({ success: false });

      const result = await explanationService.generateExplanation(
        'Role', 'Org', 'Type', 0.8, [], ['S1', 'S2', 'S3'], 0.9, 0.9, 3
      );
      
      expect(result.gapSeverity).toBe('significant');
    });
  });
});
