import { z } from 'zod';

export const AIAssessmentQuestionSchema = z.object({
  questions: z.array(
    z.object({
      questionText: z.string().min(5),
      options: z.array(z.string().min(1)).length(4, 'Must provide exactly 4 options'),
      correctOptionIndex: z.number().int().min(0).max(3),
      explanation: z.string().min(5),
    })
  ).min(1).max(50),
});
