import { z } from 'zod';

export const AICareerExplanationSchema = z.object({
  explanation: z.string().min(50).max(600),
});
