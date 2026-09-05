import { Router, Request, Response } from 'express';
import { generatePersonalizedRoadmap, recordBranchChoice } from './service';
import { apiSuccess, apiError } from '../../core/responses';
import { query } from '../../database/db';
import { verifyToken } from '../../auth/jwt';

const router = Router();

const isUUID = (s?: string) =>
  typeof s === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());

async function resolveStudentAndRole(req: Request): Promise<{ studentId: string; roleId: string }> {
  let studentId = (req.query.student_id || req.body?.student_id || req.headers['x-student-id']) as string | undefined;
  let roleId = (req.query.role_id || req.body?.role_id || req.headers['x-role-id']) as string | undefined;

  // 1. Check Bearer JWT token if available
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded?.id && decoded?.role === 'STUDENT') {
        const profileRes = await query<{ id: string; selected_role_id: string }>(
          `SELECT id, selected_role_id FROM student_profiles WHERE user_id = $1 OR id = $1`,
          [decoded.id]
        );
        if (profileRes.rows.length > 0) {
          studentId = profileRes.rows[0].id; // Enforce own profile ID for non-admin student
          if (!roleId && profileRes.rows[0].selected_role_id) roleId = profileRes.rows[0].selected_role_id;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. If studentId is not a valid UUID, look up student_profiles or fallback to first active student
  if (!studentId || !isUUID(studentId)) {
    if (studentId) {
      const matched = await query<{ id: string; selected_role_id: string }>(
        `SELECT id, selected_role_id FROM student_profiles WHERE user_id::text = $1 OR id::text = $1 LIMIT 1`,
        [studentId]
      ).catch(() => ({ rows: [] as any[] }));
      if (matched.rows.length > 0) {
        studentId = matched.rows[0].id;
        if (!roleId && matched.rows[0].selected_role_id) {
          roleId = matched.rows[0].selected_role_id;
        }
      }
    }

    if (!studentId || !isUUID(studentId)) {
      const firstStudent = await query<{ id: string; selected_role_id: string }>(
        `SELECT id, selected_role_id FROM student_profiles ORDER BY created_at ASC LIMIT 1`
      ).catch(() => ({ rows: [] as any[] }));
      if (firstStudent.rows.length > 0) {
        studentId = firstStudent.rows[0].id;
        if (!roleId && firstStudent.rows[0].selected_role_id) {
          roleId = firstStudent.rows[0].selected_role_id;
        }
      } else {
        studentId = '3f89fe2a-829a-435d-ad79-d7205f4aa5fa';
      }
    }
  }

  // 3. Resolve roleId to a valid database UUID
  if (!roleId || !isUUID(roleId)) {
    if (studentId && isUUID(studentId)) {
      const studentRole = await query<{ selected_role_id: string }>(
        `SELECT selected_role_id FROM student_profiles WHERE id = $1`,
        [studentId]
      ).catch(() => ({ rows: [] as any[] }));
      if (studentRole.rows.length > 0 && studentRole.rows[0].selected_role_id) {
        roleId = studentRole.rows[0].selected_role_id;
      }
    }

    if (!roleId || !isUUID(roleId)) {
      const slug = (roleId || '').toLowerCase();
      const isML = slug.includes('ml') || slug.includes('machine') || slug.includes('ai');
      const roleSearch = isML ? '%machine%' : '%backend%';
      const foundRole = await query<{ id: string }>(
        `SELECT id FROM roles WHERE LOWER(name) LIKE $1 ORDER BY created_at ASC LIMIT 1`,
        [roleSearch]
      ).catch(() => ({ rows: [] as any[] }));

      if (foundRole.rows.length > 0) {
        roleId = foundRole.rows[0].id;
      } else {
        const anyRole = await query<{ id: string }>(
          `SELECT id FROM roles ORDER BY created_at ASC LIMIT 1`
        ).catch(() => ({ rows: [] as any[] }));
        roleId = anyRole.rows[0]?.id || 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208';
      }
    }
  }

  return {
    studentId: studentId || '3f89fe2a-829a-435d-ad79-d7205f4aa5fa',
    roleId: roleId || 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208'
  };
}

// GET /api/v1/roadmap
router.get('/', async (req: Request, res: Response) => {
  try {
    const { studentId, roleId } = await resolveStudentAndRole(req);

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

// POST /api/v1/roadmap/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { studentId, roleId } = await resolveStudentAndRole(req);

    const roadmap = await generatePersonalizedRoadmap(studentId, roleId);
    return apiSuccess(res, roadmap);
  } catch (error: any) {
    console.error('[Roadmap Generate Error]', error);
    return apiError(
      res,
      error.message || 'Failed to regenerate roadmap',
      500,
      'SERVER_ERROR'
    );
  }
});

// GET /api/v1/roadmap/gaps
router.get('/gaps', async (req: Request, res: Response) => {
  try {
    const { studentId, roleId } = await resolveStudentAndRole(req);
    const { analyzeSkillGaps } = await import('./service');
    const gaps = await analyzeSkillGaps(studentId, roleId);

    return apiSuccess(res, gaps);
  } catch (error: any) {
    console.error('[Roadmap Gaps Error]', error);
    return apiError(
      res,
      error.message || 'Failed to analyze skill gaps',
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