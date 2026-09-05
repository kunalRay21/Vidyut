/**
 * Vidyut AI Fluency Router
 * API endpoints for AI code audit challenges and augmented engineering evaluations.
 */

import { Router, Request, Response } from 'express';
import { AIFluencyService } from './ai_fluency.service';
import { verifyToken } from '../../auth/jwt';

export const aiFluencyRouter = Router();

function resolveStudentId(req: Request): string {
  const directId = (req.headers['x-student-id'] as string) || (req.query['studentId'] as string);
  if (directId && directId.trim()) return directId.trim();

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) return decoded.id;
    } catch {
      // ignore
    }
  }

  return 'student-demo';
}

/**
 * GET /api/v1/ai-fluency/challenges
 * Returns all active AI fluency audit challenges
 */
aiFluencyRouter.get('/challenges', (req: Request, res: Response) => {
  try {
    const challenges = AIFluencyService.getChallenges();
    return res.status(200).json({
      success: true,
      data: challenges,
    });
  } catch (error: any) {
    console.error('[AIFluency API] Error fetching challenges:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI fluency challenges',
    });
  }
});

/**
 * POST /api/v1/ai-fluency/audit
 * Evaluates candidate critique and prompt refinement
 * Body: AIFluencyAuditSubmission
 */
aiFluencyRouter.post('/audit', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const submission = req.body;

    if (!submission || !submission.challengeId || !Array.isArray(submission.identifiedTrapIds)) {
      return res.status(400).json({
        success: false,
        error: 'challengeId and identifiedTrapIds array are required.',
      });
    }

    const evaluation = await AIFluencyService.evaluateAndRecord(studentId, submission);
    return res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error('[AIFluency API] Error evaluating audit:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate AI fluency audit',
    });
  }
});
