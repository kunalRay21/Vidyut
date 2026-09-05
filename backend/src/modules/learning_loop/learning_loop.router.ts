/**
 * Vidyut Learning Loop Router
 * API endpoints for diagnostic evaluation, micro-curriculum drills, and reassessment loops.
 */

import { Router, Request, Response } from 'express';
import { LearningLoopService } from './learning_loop.service';
import { verifyToken } from '../../auth/jwt';

export const learningLoopRouter = Router();

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
 * GET /api/v1/learning-loop/active
 * Fetches the active remedial package for the student
 */
learningLoopRouter.get('/active', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const pkg = await LearningLoopService.getActiveRemediation(studentId);
    return res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error: any) {
    console.error('[LearningLoop API] Error fetching active loop:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve active remedial learning loop',
    });
  }
});

/**
 * POST /api/v1/learning-loop/complete-drill
 * Records that the student has completed the micro-learning drill
 * Body: { loopId: string }
 */
learningLoopRouter.post('/complete-drill', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { loopId } = req.body;

    if (!loopId) {
      return res.status(400).json({
        success: false,
        error: 'loopId is required',
      });
    }

    const updatedPkg = await LearningLoopService.completeDrill(studentId, loopId);
    return res.status(200).json({
      success: true,
      data: updatedPkg,
    });
  } catch (error: any) {
    console.error('[LearningLoop API] Error completing drill:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete micro-drill',
    });
  }
});

/**
 * POST /api/v1/learning-loop/reassess
 * Submits answers for reassessment challenge
 * Body: { loopId: string, answers: Array<{ questionId: string, selectedIndex: number }> }
 */
learningLoopRouter.post('/reassess', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { loopId, answers } = req.body;

    if (!loopId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'loopId and answers array are required',
      });
    }

    const result = await LearningLoopService.submitReassessment(studentId, loopId, answers);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[LearningLoop API] Error evaluating reassessment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate reassessment',
    });
  }
});

/**
 * POST /api/v1/learning-loop/trigger
 * Triggers a fresh remediation loop for testing or on-demand skill repair
 * Body: { skillId?: string, initialScore?: number }
 */
learningLoopRouter.post('/trigger', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { skillId, initialScore } = req.body;

    const pkg = LearningLoopService.triggerNewLoop(
      studentId,
      skillId || 'skill-sql',
      initialScore || 55
    );

    return res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error: any) {
    console.error('[LearningLoop API] Error triggering loop:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to trigger remediation loop',
    });
  }
});
