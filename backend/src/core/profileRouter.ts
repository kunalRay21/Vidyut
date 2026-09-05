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
        `SELECT sp.*, u.email 
         FROM student_profiles sp 
         JOIN users u ON sp.user_id = u.id 
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
        profile = { ...profile, email: user?.email };
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

// GET /api/v1/profile/me/skills (Member 4 - Student Evaluated Skills & Readiness)
router.get('/me/skills', async (req: Request, res: Response) => {
  try {
    let studentId = (req.query.student_id || req.headers['x-student-id']) as string | undefined;
    let roleId = (req.query.role_id || req.headers['x-role-id']) as string | undefined;

    // 1. Resolve studentId & roleId via Bearer JWT token or memoryStore if not passed
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && (!studentId || !roleId)) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (decoded?.id) {
          studentId = studentId || decoded.id;
          // Try DB first
          try {
            const profileRes = await query(
              `SELECT id, selected_role_id FROM student_profiles WHERE user_id = $1 OR id = $1 LIMIT 1`,
              [decoded.id]
            );
            if (profileRes.rows.length > 0) {
              studentId = profileRes.rows[0].id;
              if (!roleId) roleId = profileRes.rows[0].selected_role_id;
            }
          } catch {
            // DB offline - check memoryStore
            const memProf = memoryStore.profiles.get(decoded.id) || 
              Array.from(memoryStore.profiles.values()).find(p => p.user_id === decoded.id);
            if (memProf) {
              studentId = memProf.id;
              if (!roleId) roleId = memProf.selected_role_id;
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    // Fallbacks if still missing
    if (!studentId) {
      const firstProf = Array.from(memoryStore.profiles.values())[0];
      studentId = firstProf?.id || 'student-demo';
      if (!roleId) roleId = firstProf?.selected_role_id;
    }

    if (!roleId) {
      const memProf = memoryStore.profiles.get(studentId) ||
        Array.from(memoryStore.profiles.values()).find(p => p.user_id === studentId);
      roleId = memProf?.selected_role_id || 'role-backend';
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

    // In-memory fallback if database returned no skills
    let skills: any[] = [];
    if (rows.length > 0) {
      skills = rows.map((s) => {
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
    } else {
      const { FALLBACK_GRAPHS } = require('../modules/skill_graph/router');
      const roleGraph = FALLBACK_GRAPHS[roleId] || FALLBACK_GRAPHS['role-backend'];
      const rawSkills = roleGraph?.skills || [];

      skills = rawSkills.map((s: any) => {
        const memKey = `${studentId}:${s.id}`;
        const mem = memoryStore.skill_states.get(memKey);
        const assessed_level = mem?.assessed_level || 'AWARENESS';
        const accuracy = mem?.accuracy !== undefined ? Number(mem.accuracy) : 0;

        let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
        if (['PROFICIENT', 'EXPERT'].includes(assessed_level)) {
          status = 'completed';
        } else if (assessed_level !== 'AWARENESS') {
          status = 'in_progress';
        }

        return {
          skill_id: s.id,
          name: s.name,
          skill_name: s.name,
          category: s.category || 'GENERAL',
          assessed_level,
          target_level: mem?.target_level || 'PROFICIENT',
          accuracy,
          status
        };
      });
    }

    const totalSkills = skills.length;
    const completedSkills = skills.filter((s) => s.status === 'completed').length;
    let readinessPct = totalSkills === 0 ? 0 : Math.round((completedSkills / totalSkills) * 100);

    // If profile has an assessed readiness_pct from an assessment, reflect that
    const memProf = memoryStore.profiles.get(studentId) ||
      Array.from(memoryStore.profiles.values()).find(p => p.user_id === studentId);
    if (memProf?.readiness_pct && memProf.readiness_pct > 0) {
      readinessPct = Math.max(readinessPct, Math.round(memProf.readiness_pct));
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
