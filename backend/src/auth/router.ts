import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyToken } from './jwt';
import { apiResponse, apiError } from '../core/responses';
import { pool } from '../database/db';
import { memoryStore } from '../database/store';

import { ResumeParserService } from '../modules/resume/resumeService';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name required'),
  institution: z.string().min(2, 'Institution / college name required'),
  degree: z.string().min(2, 'Degree required (e.g. B.Tech CSE)'),
  year_of_study: z.number().int().min(1).max(5),
  interests: z.array(z.string()).optional().default([]),
  resume: z.object({
    filename: z.string().optional(),
    raw_text: z.string().optional(),
    parsed_skills: z.array(z.string()).optional(),
    matched_role: z.string().optional(),
    match_score: z.number().optional(),
    parsed_data: z.any().optional(),
  }).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/v1/auth/register (Student Registration)
router.post('/register', async (req: Request, res: Response) => {
  const parseResult = RegisterSchema.safeParse(req.body);
  if (!parseResult.success) {
    return apiError(res, 'Validation error', 400, 'VALIDATION_ERROR', parseResult.error.format());
  }

  const { email, password, full_name, institution, degree, year_of_study, interests, resume } = parseResult.data;

  try {
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const profileId = randomUUID();

    let userRole: 'STUDENT' = 'STUDENT';

    // Parse resume if provided
    let resumeFilename = resume?.filename || null;
    let resumeRawText = resume?.raw_text || null;
    let parsedSkills = resume?.parsed_skills || [];
    let resumeMatchedRole = resume?.matched_role || null;
    let resumeMatchScore = resume?.match_score || 0.0;
    let resumeParsedData = resume?.parsed_data || null;

    if (resumeRawText && (!resumeMatchedRole || parsedSkills.length === 0)) {
      try {
        const parsed = ResumeParserService.parse(resumeRawText, resumeFilename || 'Resume.pdf');
        resumeFilename = parsed.fileName;
        parsedSkills = parsed.extractedSkills;
        resumeMatchedRole = parsed.primaryMatch.id;
        resumeMatchScore = parsed.primaryMatch.matchPercentage;
        resumeParsedData = parsed;
      } catch (parseErr) {
        console.warn('Resume parse warning on register:', parseErr);
      }
    }

    const selectedRoleId = resumeMatchedRole || null;

    // Try PostgreSQL first
    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return apiError(res, 'An account with this email already exists', 409, 'CONFLICT');
      }

      await pool.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [userId, email, passwordHash, userRole]
      );

      await pool.query(
        `INSERT INTO student_profiles (
           id, user_id, full_name, institution, degree, year_of_study, interests,
           selected_role_id, resume_filename, resume_raw_text, parsed_skills,
           resume_matched_role, resume_match_score, resume_parsed_data
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          profileId,
          userId,
          full_name,
          institution,
          degree,
          year_of_study,
          interests,
          selectedRoleId,
          resumeFilename,
          resumeRawText,
          parsedSkills,
          resumeMatchedRole,
          resumeMatchScore,
          resumeParsedData ? JSON.stringify(resumeParsedData) : null
        ]
      );
    } catch (dbErr: any) {
      // Fallback to in-memory store for offline development
      if (memoryStore.users.has(email)) {
        return apiError(res, 'An account with this email already exists', 409, 'CONFLICT');
      }

      memoryStore.users.set(email, {
        id: userId,
        email,
        password_hash: passwordHash,
        role: userRole,
        created_at: new Date().toISOString()
      });

      memoryStore.profiles.set(userId, {
        id: profileId,
        user_id: userId,
        full_name,
        institution,
        degree,
        year_of_study,
        interests,
        selected_role_id: selectedRoleId || undefined,
        readiness_pct: 0.0,
        resume_filename: resumeFilename || undefined,
        resume_raw_text: resumeRawText || undefined,
        parsed_skills: parsedSkills,
        resume_matched_role: resumeMatchedRole || undefined,
        resume_match_score: resumeMatchScore,
        resume_parsed_data: resumeParsedData,
      });
    }

    const payload = { id: userId, email, role: userRole };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return apiResponse(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      user: {
        id: userId,
        student_profile_id: profileId,
        email,
        role: userRole,
        full_name,
        institution,
        degree,
        year_of_study,
        selected_role_id: selectedRoleId,
        resume_filename: resumeFilename,
        parsed_skills: parsedSkills,
        resume_matched_role: resumeMatchedRole,
        resume_match_score: resumeMatchScore,
        resume_parsed_data: resumeParsedData,
      }
    }, true, null, 201);
  } catch (err: any) {
    return apiError(res, 'Registration failed: ' + err.message, 500, 'SERVER_ERROR');
  }
});

// POST /api/v1/auth/login (All user roles)
router.post('/login', async (req: Request, res: Response) => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return apiError(res, 'Invalid email or password format', 400, 'VALIDATION_ERROR');
  }

  const { email, password } = parseResult.data;

  try {
    let user: any = null;

    try {
      const resDb = await pool.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
      if (resDb.rows.length > 0) {
        user = resDb.rows[0];
      }
    } catch {
      // Offline fallback
      user = memoryStore.users.get(email);
    }

    if (!user) {
      return apiError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return apiError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    let studentProfile: any = null;
    if (user.role === 'STUDENT') {
      try {
        const profRes = await pool.query(
          'SELECT id, full_name, institution, degree, year_of_study, selected_role_id, readiness_pct, resume_filename, parsed_skills, resume_matched_role, resume_match_score, resume_parsed_data FROM student_profiles WHERE user_id = $1 LIMIT 1',
          [user.id]
        );
        if (profRes.rows.length > 0) {
          studentProfile = profRes.rows[0];
        }
      } catch {
        studentProfile = memoryStore.profiles.get(user.id);
      }
      if (!studentProfile) {
        studentProfile = memoryStore.profiles.get(user.id);
      }
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return apiResponse(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      user: {
        id: user.id,
        student_profile_id: studentProfile?.id,
        email: user.email,
        role: user.role,
        full_name: studentProfile?.full_name,
        institution: studentProfile?.institution,
        degree: studentProfile?.degree,
        year_of_study: studentProfile?.year_of_study,
        selected_role_id: studentProfile?.selected_role_id,
        readiness_pct: studentProfile?.readiness_pct,
        resume_filename: studentProfile?.resume_filename,
        parsed_skills: studentProfile?.parsed_skills,
        resume_matched_role: studentProfile?.resume_matched_role,
        resume_match_score: studentProfile?.resume_match_score,
        resume_parsed_data: studentProfile?.resume_parsed_data,
      }
    });
  } catch (err: any) {
    return apiError(res, 'Login error: ' + err.message, 500, 'SERVER_ERROR');
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return apiError(res, 'Refresh token required', 400, 'MISSING_TOKEN');
  }

  try {
    const payload = verifyToken(refresh_token);
    const newAccessToken = generateAccessToken({ id: payload.id, email: payload.email, role: payload.role });
    return apiResponse(res, {
      access_token: newAccessToken,
      token_type: 'Bearer'
    });
  } catch {
    return apiError(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
});

export default router;
