import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest, requireRole } from '../auth/middleware';
import { verifyToken } from '../auth/jwt';
import { apiResponse, apiSuccess, apiError } from './responses';
import { pool, query } from '../database/db';
import { memoryStore } from '../database/store';

const router = Router();

// GET /api/v1/profile/me (Student only)
router.get('/me', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    let profile: any = null;

    try {
      const resDb = await pool.query(
        `SELECT sp.*, u.email, ab.code as academic_branch_code, ab.name as academic_branch_name
         FROM student_profiles sp 
         JOIN users u ON sp.user_id = u.id 
         LEFT JOIN academic_branches ab ON ab.id = sp.academic_branch_id
         WHERE sp.user_id = $1`,
        [userId]
      );
      if (resDb.rows.length > 0) {
        profile = resDb.rows[0];
      }
    } catch {
      // In-memory fallback
      profile = memoryStore.profiles.get(userId);
      if (profile) {
        const user = Array.from(memoryStore.users.values()).find(u => u.id === userId);
        const branch = profile.academic_branch_id ? memoryStore.academic_branches.get(profile.academic_branch_id) : null;
        profile = {
          ...profile,
          email: user?.email,
          academic_branch_code: branch?.code,
          academic_branch_name: branch?.name,
        };
      }
    }

    if (!profile) {
      return apiError(res, 'Student profile not found', 404, 'NOT_FOUND');
    }

    return apiSuccess(res, profile);
  } catch (err: any) {
    return apiError(res, 'Failed to fetch profile: ' + err.message, 500, 'SERVER_ERROR');
  }
});

// PUT /api/v1/profile/academic-branch (Update Student Academic Branch - Phase 2)
router.put('/academic-branch', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { academic_branch_id } = req.body;

  if (!academic_branch_id) {
    return apiError(res, 'academic_branch_id is required', 400, 'BAD_REQUEST');
  }

  try {
    try {
      await pool.query(
        `UPDATE student_profiles SET academic_branch_id = $1, updated_at = NOW() WHERE user_id = $2`,
        [academic_branch_id, userId]
      );
    } catch {
      const profile = memoryStore.profiles.get(userId);
      if (profile) {
        profile.academic_branch_id = academic_branch_id;
      }
    }

    return apiSuccess(res, { message: 'Academic branch updated successfully', academic_branch_id });
  } catch (err: any) {
    return apiError(res, 'Failed to update academic branch: ' + err.message, 500, 'SERVER_ERROR');
  }
});

// GET /api/v1/profile/me/skills (Member 4 - Student Evaluated Skills & Readiness)
router.get('/me/skills', async (req: Request, res: Response) => {
  try {
    let studentId = req.query.student_id as string | undefined;
    let roleId = req.query.role_id as string | undefined;

    // Check if optional Authorization header is present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && (!studentId || !roleId)) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (decoded?.id) {
          const profileRes = await query(
            `SELECT id, selected_role_id FROM student_profiles WHERE user_id = $1`,
            [decoded.id]
          );
          if (profileRes.rows.length > 0) {
            studentId = studentId || profileRes.rows[0].id;
            roleId = roleId || profileRes.rows[0].selected_role_id;
          }
        }
      } catch {
        // Continue with query params if token check fails
      }
    }

    if (!studentId || !roleId) {
      return apiError(res, 'student_id and role_id are required (either query parameters or via authenticated profile)', 400, 'BAD_REQUEST');
    }

    let rows: any[] = [];
    try {
      const result = await query(
        `
        SELECT
          s.id AS skill_id,
          s.name AS skill_name,
          s.name AS name,
          s.category,
          COALESCE(ss.assessed_level, 'AWARENESS') AS assessed_level,
          COALESCE(ss.accuracy, 0) AS accuracy,
          COALESCE(ss.target_level, 'PROFICIENT') AS target_level
        FROM skills s
        LEFT JOIN student_skill_states ss
          ON ss.skill_id = s.id
         AND ss.student_id = $1
        WHERE s.role_id = $2
        ORDER BY s.name
        `,
        [studentId, roleId]
      );
      rows = result.rows;
    } catch {
      rows = [];
    }

    const skills = rows.map((s) => {
      let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
      if (['PROFICIENT', 'EXPERT'].includes(s.assessed_level)) {
        status = 'completed';
      } else if (s.assessed_level !== 'AWARENESS') {
        status = 'in_progress';
      }

      return {
        skill_id: s.skill_id,
        name: s.name,
        skill_name: s.skill_name,
        category: s.category,
        assessed_level: s.assessed_level,
        target_level: s.target_level,
        accuracy: Number(s.accuracy),
        status
      };
    });

    const totalSkills = skills.length;
    let totalRatio = 0;
    const levelValueMap: Record<string, number> = { AWARENESS: 1, BEGINNER: 2, INTERMEDIATE: 3, PROFICIENT: 4, EXPERT: 5 };
    for (const s of skills) {
      const cur = levelValueMap[s.assessed_level] || 1;
      const tgt = levelValueMap[s.target_level] || 4;
      totalRatio += Math.min(cur / tgt, 1.0);
    }
    const readinessPct = totalSkills === 0 ? 0 : Math.round((totalRatio / totalSkills) * 100);
    const completedSkills = skills.filter((s) => s.status === 'completed').length;

    // Synchronize student_profiles DB
    try {
      await query(`UPDATE student_profiles SET readiness_pct = $1 WHERE id = $2`, [readinessPct, studentId]);
    } catch {
      // Non-blocking fallback
    }

    return apiSuccess(res, {
      student_id: studentId,
      role_id: roleId,
      readiness_pct: readinessPct,
      total_skills: totalSkills,
      completed_skills: completedSkills,
      skills
    });
  } catch (error: any) {
    console.error('Profile skills API error:', error);
    return apiError(res, 'Failed to fetch student skills: ' + error.message, 500, 'SERVER_ERROR');
  }
});

// PUT /api/v1/profile/me (Update profile fields)
router.put('/me', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { full_name, degree, year_of_study, interests } = req.body;

  try {
    try {
      const resDb = await pool.query(
        `UPDATE student_profiles 
         SET full_name = COALESCE($1, full_name),
             degree = COALESCE($2, degree),
             year_of_study = COALESCE($3, year_of_study),
             interests = COALESCE($4, interests),
             updated_at = NOW()
         WHERE user_id = $5 
         RETURNING *`,
        [full_name, degree, year_of_study, interests, userId]
      );

      if (resDb.rows.length > 0) {
        return apiSuccess(res, resDb.rows[0]);
      }
    } catch {
      const profile = memoryStore.profiles.get(userId);
      if (profile) {
        if (full_name) profile.full_name = full_name;
        if (degree) profile.degree = degree;
        if (year_of_study) profile.year_of_study = year_of_study;
        if (interests) profile.interests = interests;
        return apiSuccess(res, profile);
      }
    }

    return apiError(res, 'Profile update failed', 400, 'UPDATE_FAILED');
  } catch (err: any) {
    return apiError(res, err.message, 500, 'SERVER_ERROR');
  }
});

export default router;
