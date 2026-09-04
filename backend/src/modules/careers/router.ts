import { Router } from 'express';
import { query } from '../../database/db';

const router = Router();

// GET all career domains
router.get('/domains', async (req, res) => {
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

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[Career Domains Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch career domains'
    });
  }
});


// GET role details + required skills
router.get('/roles/:id', async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
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

    return res.status(200).json({
      success: true,
      data: {
        role: roleResult.rows[0],
        skills: skillsResult.rows
      }
    });

  } catch (error) {
    console.error('[Career Role Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch career role'
    });
  }
});

export default router;