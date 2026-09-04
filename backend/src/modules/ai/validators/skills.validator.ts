import { z } from 'zod';

export const AISkillExtractionSchema = z.object({
  skills: z.array(
    z.object({
      mention: z.string().min(1).max(100),
      skillName: z.string().min(1).max(100),
    })
  ).max(10),
});
