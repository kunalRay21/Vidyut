import { Router, Request, Response } from 'express';
import { demoService } from './demoService';
import { apiSuccess, apiError } from '../../core/responses';
import { logger } from '../../core/logger';

const router = Router();

function checkAdminOrDemoAccess(req: Request): boolean {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey === 'vidyut_admin_secret_key' || adminKey === process.env.ADMIN_KEY) return true;
  const authHeader = req.headers.authorization;
  if (!authHeader) return true; // Allowed in dev / demonstration mode
  try {
    const { verifyToken } = require('../../auth/jwt');
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    return Boolean(decoded);
  } catch {
    return false;
  }
}

/**
 * POST /api/v1/demo/reset
 * Resets the deterministic judge demonstration scenario (Ananya Sharma, CSE, Backend Developer, FastAPI)
 */
router.post('/reset', async (req: Request, res: Response) => {
  if (!checkAdminOrDemoAccess(req)) {
    return apiError(res, 'Unauthorized access to demo reset', 403, 'FORBIDDEN');
  }

  try {
    const state = await demoService.resetDemoEnvironment();
    logger.info('DemoRouter', 'Demo scenario successfully reset', { student: state.fullName });
    return apiSuccess(res, state, 200);
  } catch (err: any) {
    logger.error('DemoRouter', 'Failed to reset demo scenario', { error: err.message });
    return apiError(res, `Failed to reset demo scenario: ${err.message}`, 500, 'SERVER_ERROR');
  }
});

/**
 * POST /api/v1/demo/advance-skill
 * Advances a skill for the demo student to demonstrate the adaptive roadmap feedback loop
 */
router.post('/advance-skill', async (req: Request, res: Response) => {
  if (!checkAdminOrDemoAccess(req)) {
    return apiError(res, 'Unauthorized access to demo advance-skill', 403, 'FORBIDDEN');
  }

  try {
    const { skillName = 'Python', newLevel = 'PROFICIENT', accuracy = 0.95 } = req.body || {};
    await demoService.advanceDemoStudentSkill(skillName, newLevel, accuracy);
    logger.info('DemoRouter', `Demo skill advanced: ${skillName} -> ${newLevel}`);
    return apiSuccess(res, {
      message: `Skill ${skillName} advanced to ${newLevel}`,
      skill: skillName,
      assessed_level: newLevel,
      accuracy,
    }, 200);
  } catch (err: any) {
    logger.error('DemoRouter', 'Failed to advance demo skill', { error: err.message });
    return apiError(res, `Failed to advance demo skill: ${err.message}`, 500, 'SERVER_ERROR');
  }
});

/**
 * GET /api/v1/demo/status
 * Returns current information about the demo scenario
 */
router.get('/status', async (_req: Request, res: Response) => {
  return apiSuccess(res, {
    demo_student: DemoServiceInfo,
    description: 'Deterministic SIH 2026 Judge Demonstration Suite',
    ready: true,
  });
});

const DemoServiceInfo = {
  name: 'Ananya Sharma',
  email: 'ananya.sharma@vidyut.ac.in',
  academic_branch: 'CSE (Computer Science & Engineering)',
  domain: 'Backend Development',
  role: 'Backend Developer',
  technology_branch: 'FastAPI',
  initial_skills: [
    { name: 'Programming Fundamentals', level: 'PROFICIENT (Mastered / Skipped)' },
    { name: 'Python', level: 'BEGINNER (Active Focus)' },
    { name: 'SQL', level: 'BEGINNER (Active Focus)' },
    { name: 'HTTP', level: 'NOT_ASSESSED (Eligible next)' },
    { name: 'REST API', level: 'NOT_ASSESSED (Blocked by HTTP)' },
    { name: 'Docker', level: 'NOT_ASSESSED (Blocked by REST API)' },
  ],
};

export default router;
