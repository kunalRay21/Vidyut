import { Router, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest, requireRole } from '../auth/middleware';
import { apiResponse, apiError } from './responses';
import { pool } from '../database/db';
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

    return apiResponse(res, profile);
  } catch (err: any) {
    return apiError(res, 'Failed to fetch profile: ' + err.message, 500, 'SERVER_ERROR');
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
        return apiResponse(res, resDb.rows[0]);
      }
    } catch {
      const profile = memoryStore.profiles.get(userId);
      if (profile) {
        if (full_name) profile.full_name = full_name;
        if (degree) profile.degree = degree;
        if (year_of_study) profile.year_of_study = year_of_study;
        if (interests) profile.interests = interests;
        return apiResponse(res, profile);
      }
    }

    return apiError(res, 'Profile update failed', 400, 'UPDATE_FAILED');
  } catch (err: any) {
    return apiError(res, err.message, 500, 'SERVER_ERROR');
  }
});

export default router;
