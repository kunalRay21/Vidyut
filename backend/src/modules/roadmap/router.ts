import { Router, Request, Response } from 'express';
import { generatePersonalizedRoadmap, recordBranchChoice } from './service';
import { apiSuccess, apiError } from '../../core/responses';
import { query } from '../../database/db';
import { verifyToken } from '../../auth/jwt';
import { memoryStore } from '../../database/store';

const router = Router();

const isUUID = (s?: string) =>
  typeof s === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());

async function resolveStudentAndRole(req: Request): Promise<{ studentId: string; roleId: string }> {
  let studentId = (req.query.student_id || req.query.studentId || req.body?.student_id || req.body?.studentId || req.headers['x-student-id']) as string | undefined;
  let roleId = (req.query.role_id || req.query.roleId || req.body?.role_id || req.body?.roleId || req.headers['x-role-id']) as string | undefined;

  // 1. Check Bearer JWT token if available
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded?.id) {
        if (!studentId) studentId = decoded.id;
      }
    } catch {
      // Fallback
    }
  }

  // 2. Check memoryStore if present
  if (studentId) {
    const mem = memoryStore.profiles.get(studentId) || Array.from(memoryStore.profiles.values()).find(p => p.id === studentId || p.user_id === studentId);
    if (mem) {
      if (!roleId && mem.resume_matched_role) roleId = mem.resume_matched_role;
      else if (!roleId && mem.selected_role_id) roleId = mem.selected_role_id;
    }
  }

  // 3. If studentId is in database
  if (studentId) {
    const matched = await query<{ id: string; selected_role_id: string; resume_matched_role: string }>(
      `SELECT id, selected_role_id, resume_matched_role FROM student_profiles WHERE user_id::text = $1 OR id::text = $1 LIMIT 1`,
      [studentId]
    ).catch(() => ({ rows: [] as any[] }));
    if (matched.rows.length > 0) {
      studentId = matched.rows[0].id;
      if (!roleId) {
        roleId = matched.rows[0].resume_matched_role || matched.rows[0].selected_role_id;
      }
    }
  }

  // 4. Default fallbacks for studentId
  if (!studentId) {
    const memFirst = Array.from(memoryStore.profiles.values())[0];
    if (memFirst) {
      studentId = memFirst.id;
      if (!roleId) roleId = memFirst.resume_matched_role || memFirst.selected_role_id;
    }
  }

  if (!studentId) {
    const firstStudent = await query<{ id: string; selected_role_id: string; resume_matched_role: string }>(
      `SELECT id, selected_role_id, resume_matched_role FROM student_profiles ORDER BY created_at ASC LIMIT 1`
    ).catch(() => ({ rows: [] as any[] }));
    if (firstStudent.rows.length > 0) {
      studentId = firstStudent.rows[0].id;
      if (!roleId) roleId = firstStudent.rows[0].resume_matched_role || firstStudent.rows[0].selected_role_id;
    }
  }

  // 5. If roleId is missing or needs resolving to DB UUID
  if (!roleId || !isUUID(roleId)) {
    const slug = (roleId || '').toLowerCase();
    let roleSearch = '%backend%';
    let defaultFallbackId = 'role-backend';

    if (slug.includes('ml') || slug.includes('machine') || slug.includes('ai')) {
      roleSearch = '%machine%';
      defaultFallbackId = 'role-ml';
    } else if (slug.includes('cloud') || slug.includes('devops')) {
      roleSearch = '%cloud%';
      defaultFallbackId = 'role-cloud';
    } else if (slug.includes('data')) {
      roleSearch = '%data%';
      defaultFallbackId = 'role-data';
    } else if (slug.includes('fullstack') || slug.includes('full-stack')) {
      roleSearch = '%full-stack%';
      defaultFallbackId = 'role-fullstack';
    } else if (slug.includes('security') || slug.includes('cyber')) {
      roleSearch = '%cybersecurity%';
      defaultFallbackId = 'role-security';
    } else if (slug.startsWith('role-')) {
      defaultFallbackId = slug;
    }

    const foundRole = await query<{ id: string }>(
      `SELECT id FROM roles WHERE LOWER(name) LIKE $1 ORDER BY created_at ASC LIMIT 1`,
      [roleSearch]
    ).catch(() => ({ rows: [] as any[] }));

    if (foundRole.rows.length > 0) {
      roleId = foundRole.rows[0].id;
    } else {
      roleId = defaultFallbackId;
    }
  }

  return {
    studentId: studentId || 'student-demo',
    roleId: roleId || 'role-backend'
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