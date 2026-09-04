import { Router, Request, Response } from 'express';
import {
  generateAssessmentSession,
  submitAssessment,
  saveSelfAssessment
} from './service';
import { apiSuccess, apiError } from '../../core/responses';
import { query } from '../../database/db';

const router = Router();

async function resolveStudentId(req: Request): Promise<string | undefined> {
  if (req.body && req.body.student_id) {
    return req.body.student_id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'vidyut_jwt_super_secret_signing_key_2026';
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded?.id) {
        const profileRes = await query<{ id: string }>(
          `SELECT id FROM student_profiles WHERE user_id = $1`,
          [decoded.id]
        );
        if (profileRes.rows.length > 0) {
          return profileRes.rows[0].id;
        }
      }
    } catch {
      // Fallback
    }
  }
  return undefined;
}

/**
 * POST /api/v1/assessments/self
 *
 * Body:
 * {
 *   "student_id": "optional-student-uuid",
 *   "role_id": "role-uuid",
 *   "ratings": [
 *     { "skill_id": "skill-uuid", "rating": "AVERAGE" }
 *   ]
 * }
 */
router.post('/self', async (req: Request, res: Response) => {
  try {
    const studentId = await resolveStudentId(req);
    const { role_id, ratings } = req.body;

    if (!role_id || !Array.isArray(ratings)) {
      return apiError(res, 'role_id and ratings array are required', 400, 'BAD_REQUEST');
    }

    if (!studentId) {
      return apiError(res, 'student_id is required either in request body or via Bearer token', 400, 'UNAUTHORIZED');
    }

    const result = await saveSelfAssessment(studentId, role_id, ratings);
    return apiSuccess(res, result, 201);
  } catch (error: any) {
    console.error('[Assessment Self-Rating Error]', error);
    return apiError(res, error.message || 'Failed to save self-assessment ratings', 500, 'SERVER_ERROR');
  }
});

/**
 * POST /api/v1/assessments/start
 *
 * Body:
 * {
 *   "student_id": "student-uuid",
 *   "role_id": "role-uuid"
 * }
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const studentId = await resolveStudentId(req);
    const { role_id } = req.body;

    if (!studentId || !role_id) {
      return apiError(res, 'student_id and role_id are required', 400, 'BAD_REQUEST');
    }

    const result = await generateAssessmentSession(studentId, role_id);
    return apiSuccess(res, result, 201);
  } catch (error: any) {
    console.error('[Assessment Start Error]', error);
    return apiError(res, error.message || 'Failed to start assessment', 500, 'SERVER_ERROR');
  }
});

/**
 * POST /api/v1/assessments/:session_id/submit
 *
 * Body:
 * {
 *   "answers": [
 *     {
 *       "question_id": "uuid",
 *       "selected_option": "A"
 *     }
 *   ]
 * }
 */
router.post('/:session_id/submit', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return apiError(res, 'answers must be an array', 400, 'BAD_REQUEST');
    }

    const result = await submitAssessment(session_id, answers);
    return apiSuccess(res, result, 200);
  } catch (error: any) {
    console.error('[Assessment Submit Error]', error);
    return apiError(res, error.message || 'Failed to submit assessment', 500, 'SERVER_ERROR');
  }
});

export default router;