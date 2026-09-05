import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest, requireRole } from '../auth/middleware';
import { verifyToken } from '../auth/jwt';
import { apiResponse, apiSuccess, apiError } from './responses';
import { pool, query } from '../database/db';
import { memoryStore, inMemorySkillStates } from '../database/store';

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

    // Fallback: If studentId or roleId missing, attempt resolution from database
    if (!studentId || !roleId) {
      try {
        const defaultProfile = await query(
          `SELECT id, selected_role_id FROM student_profiles ORDER BY updated_at DESC LIMIT 1`
        );
        if (defaultProfile.rows.length > 0) {
          studentId = studentId || defaultProfile.rows[0].id;
          roleId = roleId || defaultProfile.rows[0].selected_role_id;
        }
      } catch {}
    }

    if (!roleId) {
      try {
        const defaultRole = await query(
          `SELECT id FROM roles ORDER BY created_at ASC LIMIT 1`
        );
        if (defaultRole.rows.length > 0) {
          roleId = defaultRole.rows[0].id;
        }
      } catch {}
    }

    studentId = studentId || 'default-student';
    roleId = roleId || 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208';

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

    // Fallback if role skills were not joined
    if (rows.length === 0) {
      try {
        const fallbackSkills = await query(
          `SELECT id AS skill_id, name AS skill_name, name, category FROM skills WHERE role_id = $1 ORDER BY name`,
          [roleId]
        );
        rows = fallbackSkills.rows.map(r => ({
          ...r,
          assessed_level: 'AWARENESS',
          accuracy: 0,
          target_level: 'PROFICIENT',
        }));
      } catch {}
    }

    const skills = rows.map((s) => {
      let assessedLevel = s.assessed_level;
      let accuracy = Number(s.accuracy);

      // Check in-memory store for newly evaluated skills from diagnostic tests
      const memKey = `${studentId}:${s.skill_id}`;
      const inMem = inMemorySkillStates.get(memKey);
      if (inMem && (accuracy === 0 || assessedLevel === 'AWARENESS')) {
        assessedLevel = inMem.assessed_level;
        accuracy = inMem.accuracy;
      }

      let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
      if (['PROFICIENT', 'EXPERT'].includes(assessedLevel)) {
        status = 'completed';
      } else if (assessedLevel !== 'AWARENESS') {
        status = 'in_progress';
      }

      return {
        skill_id: s.skill_id,
        name: s.name,
        skill_name: s.skill_name,
        category: s.category,
        assessed_level: assessedLevel,
        target_level: s.target_level,
        accuracy: accuracy,
        status
      };
    });

    const totalSkills = skills.length;
    const completedSkills = skills.filter((s) => s.status === 'completed').length;
    const readinessPct = totalSkills === 0 ? 0 : Math.round((completedSkills / totalSkills) * 100);

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
  const { full_name, institution, degree, year_of_study, interests, selected_role_id } = req.body;

  try {
    try {
      const resDb = await pool.query(
        `UPDATE student_profiles 
         SET full_name = COALESCE($1, full_name),
             institution = COALESCE($2, institution),
             degree = COALESCE($3, degree),
             year_of_study = COALESCE($4, year_of_study),
             interests = COALESCE($5, interests),
             selected_role_id = COALESCE($6, selected_role_id),
             updated_at = NOW()
         WHERE user_id = $7 
         RETURNING *`,
        [full_name, institution, degree, year_of_study, interests, selected_role_id, userId]
      );

      if (resDb.rows.length > 0) {
        return apiSuccess(res, resDb.rows[0]);
      }
    } catch {
      const profile = memoryStore.profiles.get(userId);
      if (profile) {
        if (full_name) profile.full_name = full_name;
        if (institution) profile.institution = institution;
        if (degree) profile.degree = degree;
        if (year_of_study) profile.year_of_study = year_of_study;
        if (interests) profile.interests = interests;
        if (selected_role_id) profile.selected_role_id = selected_role_id;
        return apiSuccess(res, profile);
      }
    }

    return apiError(res, 'Profile update failed', 400, 'UPDATE_FAILED');
  } catch (err: any) {
    return apiError(res, err.message, 500, 'SERVER_ERROR');
  }
});

// POST /api/v1/profile/me/resume (Upload, parse & match resume)
router.post('/me/resume', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { filename, raw_text, parsed_skills, matched_role, match_score, parsed_data } = req.body;

  try {
    const { ResumeParserService } = await import('../modules/resume/resumeService');

    let resumeFilename = filename || 'Resume.pdf';
    let resumeRawText = raw_text || '';
    let skillsList: string[] = Array.isArray(parsed_skills) ? parsed_skills : [];
    let roleMatched = matched_role || null;
    let score = typeof match_score === 'number' ? match_score : 0.0;
    let fullParsedData = parsed_data || null;

    // If raw text provided or skills/role missing, parse through ResumeParserService
    if (resumeRawText && (!roleMatched || skillsList.length === 0 || !fullParsedData)) {
      try {
        const parsed = ResumeParserService.parse(resumeRawText, resumeFilename);
        resumeFilename = parsed.fileName;
        skillsList = parsed.extractedSkills;
        roleMatched = parsed.primaryMatch.id;
        score = parsed.primaryMatch.matchPercentage;
        fullParsedData = parsed;
      } catch (e: any) {
        console.warn('Backend resume parse error:', e);
      }
    }

    try {
      const resDb = await pool.query(
        `UPDATE student_profiles
         SET resume_filename = $1,
             resume_raw_text = $2,
             parsed_skills = $3,
             resume_matched_role = $4,
             resume_match_score = $5,
             resume_parsed_data = $6,
             selected_role_id = COALESCE($4, selected_role_id),
             updated_at = NOW()
         WHERE user_id = $7
         RETURNING *`,
        [
          resumeFilename,
          resumeRawText,
          skillsList,
          roleMatched,
          score,
          fullParsedData ? JSON.stringify(fullParsedData) : null,
          userId
        ]
      );

      if (resDb.rows.length > 0) {
        return apiSuccess(res, {
          profile: resDb.rows[0],
          resume: {
            filename: resumeFilename,
            parsed_skills: skillsList,
            matched_role: roleMatched,
            match_score: score,
            parsed_data: fullParsedData
          }
        });
      }
    } catch {
      // In-memory fallback
      const profile = memoryStore.profiles.get(userId);
      if (profile) {
        profile.resume_filename = resumeFilename;
        profile.resume_raw_text = resumeRawText;
        profile.parsed_skills = skillsList;
        profile.resume_matched_role = roleMatched || undefined;
        profile.resume_match_score = score;
        profile.resume_parsed_data = fullParsedData;
        if (roleMatched) profile.selected_role_id = roleMatched;

        return apiSuccess(res, {
          profile,
          resume: {
            filename: resumeFilename,
            parsed_skills: skillsList,
            matched_role: roleMatched,
            match_score: score,
            parsed_data: fullParsedData
          }
        });
      }
    }

    return apiError(res, 'Student profile not found to attach resume', 404, 'NOT_FOUND');
  } catch (err: any) {
    return apiError(res, 'Failed to save resume: ' + err.message, 500, 'SERVER_ERROR');
  }
});

// DELETE /api/v1/profile/me/resume (Remove resume)
router.delete('/me/resume', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    try {
      await pool.query(
        `UPDATE student_profiles
         SET resume_filename = NULL,
             resume_raw_text = NULL,
             parsed_skills = '{}',
             resume_matched_role = NULL,
             resume_match_score = 0.0,
             resume_parsed_data = NULL,
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );
    } catch {
      const profile = memoryStore.profiles.get(userId);
      if (profile) {
        delete profile.resume_filename;
        delete profile.resume_raw_text;
        profile.parsed_skills = [];
        delete profile.resume_matched_role;
        profile.resume_match_score = 0.0;
        delete profile.resume_parsed_data;
      }
    }

    return apiSuccess(res, { message: 'Resume cleared successfully' });
  } catch (err: any) {
    return apiError(res, 'Failed to clear resume: ' + err.message, 500, 'SERVER_ERROR');
  }
});

export default router;
