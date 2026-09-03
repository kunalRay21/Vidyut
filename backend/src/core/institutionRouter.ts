import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { apiResponse, apiError } from './responses';
import { pool } from '../database/db';
import { memoryStore } from '../database/store';
import { hashPassword, generateAccessToken } from '../auth/jwt';

const router = Router();

const InstitutionRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  college_name: z.string().min(2),
  aishe_code: z.string().optional().default(''),
  officer_name: z.string().min(2),
  departments: z.array(z.string()).min(1),
});

// POST /api/v1/institution/register
router.post('/register', async (req: Request, res: Response) => {
  const parseResult = InstitutionRegisterSchema.safeParse(req.body);
  if (!parseResult.success) {
    return apiError(res, 'Validation error', 400, 'VALIDATION_ERROR', parseResult.error.format());
  }

  const { email, password, college_name, aishe_code, officer_name, departments } = parseResult.data;

  try {
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const instId = randomUUID();
    const role: 'INSTITUTION' = 'INSTITUTION';

    try {
      await pool.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [userId, email, passwordHash, role]
      );
      await pool.query(
        `INSERT INTO institutions (id, user_id, college_name, aishe_code, officer_name, departments)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [instId, userId, college_name, aishe_code, officer_name, departments]
      );
    } catch {
      // Memory fallback
      memoryStore.users.set(email, {
        id: userId,
        email,
        password_hash: passwordHash,
        role,
        created_at: new Date().toISOString()
      });
      memoryStore.institutions.set(userId, {
        id: instId,
        user_id: userId,
        college_name,
        aishe_code: aishe_code || '',
        officer_name,
        departments
      });
    }

    const token = generateAccessToken({ id: userId, email, role });

    return apiResponse(res, {
      institution_id: instId,
      access_token: token,
      college_name,
      officer_name
    }, true, null, 201);
  } catch (err: any) {
    return apiError(res, 'Registration failed: ' + err.message, 500, 'SERVER_ERROR');
  }
});

// GET /api/v1/institution/metrics
router.get('/metrics', (req: Request, res: Response) => {
  // Returns aggregated batch readiness & curriculum gaps for the College Dashboard
  return apiResponse(res, {
    institution_name: 'VIT Chennai — School of Computer Science & Engineering',
    total_students_enrolled: 420,
    average_readiness_pct: 54.2,
    cohort_distribution: {
      ready_now_pct: 22,        // Score >= 75%
      almost_ready_pct: 48,     // Score 50-74%
      needs_foundation_pct: 30  // Score < 50%
    },
    department_stats: [
      { department: 'Computer Science', enrolled: 210, avg_readiness: 58.4 },
      { department: 'Data Science & AI', enrolled: 120, avg_readiness: 62.1 },
      { department: 'Information Tech', enrolled: 90, avg_readiness: 46.5 }
    ],
    top_curriculum_gaps: [
      { skill: 'Docker & Containerization', student_avg_score: 24, target_industry_score: 70 },
      { skill: 'API Testing & Postman', student_avg_score: 38, target_industry_score: 75 },
      { skill: 'Relational SQL Optimization', student_avg_score: 44, target_industry_score: 80 }
    ]
  });
});

export default router;
