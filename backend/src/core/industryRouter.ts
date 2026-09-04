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

export default router;
