import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyToken } from './jwt';
import { apiResponse, apiError } from '../core/responses';
import { pool } from '../database/db';
import { memoryStore } from '../database/store';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name required'),
  institution: z.string().min(2, 'Institution / college name required'),
  degree: z.string().min(2, 'Degree required (e.g. B.Tech CSE)'),
  year_of_study: z.number().int().min(1).max(5),
  interests: z.array(z.string()).optional().default([]),
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

  const { email, password, full_name, institution, degree, year_of_study, interests } = parseResult.data;

  try {
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const profileId = randomUUID();

    let userRole: 'STUDENT' = 'STUDENT';

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
        `INSERT INTO student_profiles (id, user_id, full_name, institution, degree, year_of_study, interests)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [profileId, userId, full_name, institution, degree, year_of_study, interests]
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
        readiness_pct: 0.0
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
        email,
        role: userRole,
        full_name,
        institution,
        degree,
        year_of_study
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

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return apiResponse(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
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
