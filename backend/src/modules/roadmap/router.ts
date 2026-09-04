import { Router, Request, Response } from 'express';
import { generatePersonalizedRoadmap, recordBranchChoice } from './service';
import { apiSuccess, apiError } from '../../core/responses';
import { query } from '../../database/db';

const router = Router();

async function resolveStudentAndRole(req: Request): Promise<{ studentId?: string; roleId?: string }> {
  let studentId = (req.query.student_id || req.body?.student_id) as string | undefined;
  let roleId = (req.query.role_id || req.body?.role_id) as string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ') && (!studentId || !roleId)) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'vidyut_jwt_super_secret_signing_key_2026';
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded?.id) {
        const profileRes = await query<{ id: string; selected_role_id: string }>(
          `SELECT id, selected_role_id FROM student_profiles WHERE user_id = $1`,
          [decoded.id]
        );
        if (profileRes.rows.length > 0) {
          studentId = studentId || profileRes.rows[0].id;
          roleId = roleId || profileRes.rows[0].selected_role_id;
        }
      }
    } catch {
      // Fallback
    }
  }

  return { studentId, roleId };
}

// GET /api/v1/roadmap
router.get('/', async (req: Request, res: Response) => {
  try {
    const { studentId, roleId } = await resolveStudentAndRole(req);

    if (!studentId || !roleId) {
      return apiError(
        res,
        'student_id and role_id are required (via query params or student profile)',
        400,
        'BAD_REQUEST'
      );
    }

    const roadmap = await generatePersonalizedRoadmap(studentId, roleId);
    return apiSuccess(res, roadmap);
  } catch (error: any) {
    console.error('[Roadmap Error]', error);
    return apiError(
      res,
      error.message || 'Failed to generate roadmap',
      500,
      'SERVER_ERROR'
    );
  }
});

// POST /api/v1/roadmap/branch
router.post('/branch', async (req: Request, res: Response) => {
  try {
    const { studentId } = await resolveStudentAndRole(req);
    const { branch_id, option_id } = req.body;

    if (!studentId || !branch_id) {
      return apiError(
        res,
        'student_id and branch_id are required',
        400,
        'BAD_REQUEST'
      );
    }

    const result = await recordBranchChoice(studentId, branch_id, option_id);
    return apiSuccess(res, result);
  } catch (error: any) {
    console.error('[Roadmap Branch Error]', error);
    return apiError(
      res,
      error.message || 'Failed to select branch',
      500,
      'SERVER_ERROR'
    );
  }
});

export default router;