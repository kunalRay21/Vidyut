import { Router, Request, Response } from 'express';
import { query } from '../../database/db';
import { apiSuccess, apiError } from '../../core/responses';

const router = Router();

// GET all career domains
router.get('/domains', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT
        id,
        name,
        description,
        demand_level
      FROM domains
      ORDER BY name
    `);

    return apiSuccess(res, result.rows);
  } catch (error: any) {
    console.error('[Career Domains Error]', error);
    return apiError(res, 'Failed to fetch career domains: ' + error.message, 500, 'SERVER_ERROR');
  }
});

// GET role details + required skills
router.get('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const roleResult = await query(`
      SELECT
        r.id,
        r.name,
        r.description,
        r.domain_id,
        d.name AS domain_name
      FROM roles r
      JOIN domains d ON d.id = r.domain_id
      WHERE r.id = $1
    `, [id]);

    if (roleResult.rows.length === 0) {
      return apiError(res, 'Role not found', 404, 'NOT_FOUND');
    }

    const skillsResult = await query(`
      SELECT
        id,
        name,
        description,
        category
      FROM skills
      WHERE role_id = $1
      ORDER BY name
    `, [id]);

    return apiSuccess(res, {
      role: roleResult.rows[0],
      skills: skillsResult.rows
    });
  } catch (error: any) {
    console.error('[Career Role Error]', error);
    return apiError(res, 'Failed to fetch career role: ' + error.message, 500, 'SERVER_ERROR');
  }
});

export default router;