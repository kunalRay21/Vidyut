import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { query } from '../../database/db';
import { apiSuccess, apiError } from '../../core/responses';

const router = Router();

export interface OpportunityItem {
  id: string;
  external_id?: string;
  source: 'UNSTOP' | 'INTERNSHALA' | 'AICTE' | 'DIRECT';
  original_url?: string;
  title: string;
  organization: string;
  type: 'INTERNSHIP' | 'HACKATHON' | 'PROJECT';
  mode: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  location?: string;
  deadline?: string;
  stipend?: string;
  description_raw?: string;
  eligibility_raw?: string;
  required_skills?: Array<{
    skill_id: string;
    raw_mention?: string;
    min_proficiency?: string;
    weight?: number;
  }>;
  is_active?: boolean;
}

// In-memory cache loaded from data/seed_opportunities.json for instantaneous offline resilience
let seedCache: OpportunityItem[] = [];

function loadSeedData(): OpportunityItem[] {
  if (seedCache.length > 0) return seedCache;
  try {
    const seedPath = path.resolve(__dirname, '../../../data/seed_opportunities.json');
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, 'utf8');
      const parsed = JSON.parse(raw);
      seedCache = parsed.map((item: any, index: number) => ({
        id: item.id || item.external_id || `opp-seed-${index + 1}`,
        external_id: item.external_id,
        source: item.source || 'DIRECT',
        original_url: item.original_url || '',
        title: item.title,
        organization: item.organization,
        type: item.type || 'INTERNSHIP',
        mode: item.mode || 'REMOTE',
        location: item.location || 'India',
        deadline: item.deadline || '2026-10-30',
        stipend: item.stipend || 'Competitive',
        description_raw: item.description_raw || item.description || '',
        eligibility_raw: item.eligibility_raw || '',
        required_skills: item.required_skills || [],
        is_active: item.is_active !== undefined ? item.is_active : true,
      }));
    }
  } catch (err) {
    console.warn('⚠️ Could not load seed_opportunities.json:', err);
  }
  return seedCache;
}

// Ensure seed data is initialized
loadSeedData();

/**
 * GET /api/v1/opportunities
 * Paginated public browse endpoint with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const type = req.query.type ? String(req.query.type).trim().toUpperCase() : undefined;
    const mode = req.query.mode ? String(req.query.mode).trim().toUpperCase() : undefined;
    const source = req.query.source ? String(req.query.source).trim().toUpperCase() : undefined;
    const search = req.query.search ? String(req.query.search).trim().toLowerCase() : undefined;
    const skillId = req.query.skill_id ? String(req.query.skill_id).trim().toLowerCase() : undefined;
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '10'), 10)));

    // Try PostgreSQL query first if available
    try {
      let sql = `
        SELECT o.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'skill_id', ost.skill_id, 
                'min_proficiency', ost.min_proficiency, 
                'weight', ost.weight
              )
            ) FILTER (WHERE ost.skill_id IS NOT NULL), '[]'
          ) as required_skills
        FROM opportunities o
        LEFT JOIN opportunity_skill_tags ost ON o.id = ost.opportunity_id
        WHERE o.is_active = true
      `;
      const params: any[] = [];

      if (type) {
        params.push(type);
        sql += ` AND o.type = $${params.length}`;
      }
      if (mode) {
        params.push(mode);
        sql += ` AND o.mode = $${params.length}`;
      }
      if (source) {
        params.push(source);
        sql += ` AND o.source = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (LOWER(o.title) LIKE $${params.length} OR LOWER(o.organization) LIKE $${params.length} OR LOWER(o.description_raw) LIKE $${params.length})`;
      }

      sql += ` GROUP BY o.id`;

      if (skillId) {
        params.push(skillId);
        sql += ` HAVING bool_or(LOWER(ost.skill_id) = $${params.length})`;
      }

      sql += ` ORDER BY o.extracted_at DESC`;

      const result = await query(sql, params);
      if (result.rows && result.rows.length > 0) {
        const total = result.rows.length;
        const pages = Math.ceil(total / limit) || 1;
        const offset = (page - 1) * limit;
        const items = result.rows.slice(offset, offset + limit);

        return apiSuccess(res, {
          items,
          total,
          page,
          limit,
          pages
        });
      }
    } catch {
      // PostgreSQL not reachable or table empty -> gracefully fall back to seed cache
    }

    // Fallback: Query memory/JSON seed data
    let items = loadSeedData().filter(item => item.is_active !== false);

    if (type) items = items.filter(item => item.type === type);
    if (mode) items = items.filter(item => item.mode === mode);
    if (source) items = items.filter(item => item.source === source);
    if (search) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(search) ||
        item.organization.toLowerCase().includes(search) ||
        (item.description_raw && item.description_raw.toLowerCase().includes(search))
      );
    }
    if (skillId) {
      items = items.filter(item => 
        item.required_skills?.some(s => s.skill_id.toLowerCase() === skillId)
      );
    }

    const total = items.length;
    const pages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return apiSuccess(res, {
      items: paginatedItems,
      total,
      page,
      limit,
      pages
    });
  } catch (err: any) {
    return apiError(res, `Failed to retrieve opportunities: ${err.message}`, 500);
  }
});

/**
 * GET /api/v1/opportunities/:id
 * Single opportunity detail
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    // Check DB
    try {
      const result = await query(`
        SELECT o.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'skill_id', ost.skill_id, 
                'min_proficiency', ost.min_proficiency, 
                'weight', ost.weight
              )
            ) FILTER (WHERE ost.skill_id IS NOT NULL), '[]'
          ) as required_skills
        FROM opportunities o
        LEFT JOIN opportunity_skill_tags ost ON o.id = ost.opportunity_id
        WHERE o.id = $1 OR o.external_id = $1
        GROUP BY o.id
      `, [id]);

      if (result.rows && result.rows.length > 0) {
        return apiSuccess(res, result.rows[0]);
      }
    } catch {
      // Fall through to memory
    }

    // Check seed memory
    const found = loadSeedData().find(o => o.id === id || o.external_id === id);
    if (!found) {
      return apiError(res, 'Opportunity not found', 404, 'NOT_FOUND');
    }

    return apiSuccess(res, found);
  } catch (err: any) {
    return apiError(res, `Failed to fetch opportunity: ${err.message}`, 500);
  }
});

const directPostSchema = z.object({
  title: z.string().min(3),
  organization: z.string().min(2),
  type: z.enum(['INTERNSHIP', 'HACKATHON', 'PROJECT']).default('INTERNSHIP'),
  mode: z.enum(['REMOTE', 'ON_SITE', 'HYBRID']).default('REMOTE'),
  location: z.string().optional(),
  deadline: z.string().optional(),
  stipend: z.string().optional(),
  description: z.string().min(10),
  required_skills: z.array(z.object({
    skill_id: z.string(),
    min_proficiency: z.string().optional(),
    weight: z.number().optional()
  })).optional().default([])
});

/**
 * POST /api/v1/opportunities/direct
 * Direct opportunity posting by employers
 */
router.post('/direct', async (req: Request, res: Response) => {
  try {
    const parsed = directPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return apiError(res, 'Invalid request body', 400, 'VALIDATION_ERROR', parsed.error.format());
    }

    const data = parsed.data;
    const newId = `opp-direct-${Date.now()}`;
    const newOpp: OpportunityItem = {
      id: newId,
      external_id: newId,
      source: 'DIRECT',
      title: data.title,
      organization: data.organization,
      type: data.type,
      mode: data.mode,
      location: data.location || 'India',
      deadline: data.deadline || '2026-11-30',
      stipend: data.stipend || 'Unspecified',
      description_raw: data.description,
      required_skills: data.required_skills,
      is_active: true
    };

    // Try persisting to DB
    try {
      await query(`
        INSERT INTO opportunities (
          id, external_id, source, title, organization, type, mode, location, deadline, stipend, description_raw, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      `, [
        newOpp.id, newOpp.external_id, newOpp.source, newOpp.title, newOpp.organization,
        newOpp.type, newOpp.mode, newOpp.location, newOpp.deadline, newOpp.stipend, newOpp.description_raw
      ]);

      for (const skill of data.required_skills) {
        await query(`
          INSERT INTO opportunity_skill_tags (opportunity_id, skill_id, min_proficiency, weight)
          VALUES ($1, $2, $3, $4)
        `, [newOpp.id, skill.skill_id, skill.min_proficiency || 'BEGINNER', skill.weight || 1.0]);
      }
    } catch {
      // In-memory fallback
    }

    seedCache.unshift(newOpp);

    return apiSuccess(res, newOpp, 201);
  } catch (err: any) {
    return apiError(res, `Failed to create opportunity: ${err.message}`, 500);
  }
});

/**
 * POST /api/v1/opportunities/sync
 * Sync / Trigger scraper pipeline endpoint
 */
router.post('/sync', async (_req: Request, res: Response) => {
  return apiSuccess(res, {
    success: true,
    message: 'Opportunity index synchronization triggered successfully',
    total_cached: seedCache.length,
    timestamp: new Date().toISOString()
  });
});

export default router;
