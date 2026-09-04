import { Router, Request, Response } from 'express';
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

// POST /api/v1/portfolio/evidence
router.post('/evidence', async (req: Request, res: Response) => {
  try {
    const studentId = await resolveStudentId(req);
    const { skill_id, type, title, url, description } = req.body;

    if (!skill_id) {
      return apiError(res, 'skill_id is required', 400, 'BAD_REQUEST');
    }

    if (!studentId) {
      return apiError(res, 'student_id is required via request body or Bearer token', 400, 'UNAUTHORIZED');
    }

    // Boost student skill state to at least PROFICIENT or increment accuracy
    await query(
      `
      INSERT INTO student_skill_states (student_id, skill_id, assessed_level, accuracy)
      VALUES ($1, $2, 'PROFICIENT', 85)
      ON CONFLICT (student_id, skill_id)
      DO UPDATE SET
        assessed_level = CASE
          WHEN student_skill_states.assessed_level IN ('EXPERT') THEN 'EXPERT'
          ELSE 'PROFICIENT'
        END,
        accuracy = GREATEST(student_skill_states.accuracy, 85),
        updated_at = NOW()
      `,
      [studentId, skill_id]
    );

    // Recalculate readiness
    let newReadinessPct = 0;
    const allSkillsRes = await query<{ assessed_level: string }>(
      `SELECT assessed_level FROM student_skill_states WHERE student_id = $1`,
      [studentId]
    );

    if (allSkillsRes.rows.length > 0) {
      const completed = allSkillsRes.rows.filter(r => ['PROFICIENT', 'EXPERT'].includes(r.assessed_level)).length;
      newReadinessPct = Math.round((completed / allSkillsRes.rows.length) * 100);
      await query(
        `UPDATE student_profiles SET readiness_pct = $1 WHERE id = $2`,
        [newReadinessPct, studentId]
      );
    }

    return apiSuccess(res, {
      new_readiness_pct: newReadinessPct,
      skill_id,
      title: title || 'Milestone Evidence',
      status: 'VERIFIED'
    });
  } catch (error: any) {
    console.error('[Portfolio Evidence Error]', error);
    return apiError(res, error.message || 'Failed to submit evidence', 500, 'SERVER_ERROR');
  }
});

export default router;
