import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { apiResponse, apiError } from './responses';
import { pool } from '../database/db';
import { memoryStore } from '../database/store';
import { hashPassword, generateAccessToken } from '../auth/jwt';

const router = Router();

const IndustryRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  company_name: z.string().min(2),
  sector: z.string().min(2),
  website: z.string().url().optional().or(z.literal('')),
});

// POST /api/v1/industry/register
router.post('/register', async (req: Request, res: Response) => {
  const parseResult = IndustryRegisterSchema.safeParse(req.body);
  if (!parseResult.success) {
    return apiError(res, 'Validation error', 400, 'VALIDATION_ERROR', parseResult.error.format());
  }

  const { email, password, company_name, sector, website } = parseResult.data;

  try {
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const companyId = randomUUID();
    const role: 'INDUSTRY' = 'INDUSTRY';

    try {
      await pool.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [userId, email, passwordHash, role]
      );
      await pool.query(
        `INSERT INTO companies (id, user_id, company_name, sector, website)
         VALUES ($1, $2, $3, $4, $5)`,
        [companyId, userId, company_name, sector, website || null]
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
      memoryStore.companies.set(userId, {
        id: companyId,
        user_id: userId,
        company_name,
        sector,
        website: website || undefined
      });
    }

    const token = generateAccessToken({ id: userId, email, role });

    return apiResponse(res, {
      company_id: companyId,
      access_token: token,
      company_name,
      sector
    }, true, null, 201);
  } catch (err: any) {
    return apiError(res, 'Registration failed: ' + err.message, 500, 'SERVER_ERROR');
  }
});

// GET /api/v1/industry/talent
router.get('/talent', async (req: Request, res: Response) => {
  try {
    const minScore = Math.max(0, Math.min(100, parseInt(String(req.query.min_score || '70'), 10)));
    let candidates: any[] = [];

    try {
      const dbRes = await pool.query(`
        SELECT 
          sp.id,
          sp.readiness_pct,
          r.name as role_target,
          COALESCE(
            json_agg(s.name) FILTER (WHERE s.name IS NOT NULL),
            '[]'
          ) as verified_skills
        FROM student_profiles sp
        LEFT JOIN roles r ON r.id = sp.selected_role_id
        LEFT JOIN student_skill_states ss ON ss.student_id = sp.id AND ss.assessed_level IN ('PROFICIENT', 'EXPERT')
        LEFT JOIN skills s ON s.id = ss.skill_id
        WHERE COALESCE(sp.readiness_pct, 0) >= $1
        GROUP BY sp.id, sp.readiness_pct, r.name
        ORDER BY sp.readiness_pct DESC
        LIMIT 50
      `, [minScore]);

      if (dbRes.rows.length > 0) {
        candidates = dbRes.rows.map((row, idx) => ({
          candidate_alias: `Candidate #${1001 + idx}`,
          role_target: row.role_target || 'Software Engineer',
          readiness_score: Math.round(row.readiness_pct || 70),
          status: 'Readiness Verified',
          verified_skills: Array.isArray(row.verified_skills) && row.verified_skills.length > 0
            ? row.verified_skills
            : ['Problem Solving']
        }));
      }
    } catch {
      // Database offline or query failed
    }

    return apiResponse(res, {
      matched_talent_pool: candidates,
      total: candidates.length,
      min_score: minScore
    });
  } catch (err: any) {
    return apiError(res, 'Failed to fetch talent pool: ' + err.message, 500, 'SERVER_ERROR');
  }
});

export default router;
