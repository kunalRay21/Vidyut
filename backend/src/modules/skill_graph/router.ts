import { Router } from 'express';
import { query } from '../../database/db';

const router = Router();

// Get complete skill graph for a role
router.get('/roles/:roleId/graph', async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await query(
      `SELECT id, name, description
       FROM roles
       WHERE id = $1`,
      [roleId]
    );

    if (role.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const skills = await query(
      `SELECT id, name, description, category
       FROM skills
       WHERE role_id = $1
       ORDER BY name`,
      [roleId]
    );

    const prerequisites = await query(
      `SELECT
         sp.skill_id,
         sp.prerequisite_skill_id,
         s.name AS skill_name,
         ps.name AS prerequisite_name
       FROM skill_prerequisites sp
       JOIN skills s ON s.id = sp.skill_id
       JOIN skills ps ON ps.id = sp.prerequisite_skill_id
       WHERE s.role_id = $1
       ORDER BY s.name`,
      [roleId]
    );

    const branches = await query(
      `SELECT
         tb.id,
         tb.name,
         tb.description,
         COALESCE(
           json_agg(
             json_build_object(
               'id', s.id,
               'name', s.name,
               'category', s.category
             )
           ) FILTER (WHERE s.id IS NOT NULL),
           '[]'
         ) AS options
       FROM technology_branches tb
       LEFT JOIN technology_branch_options tbo
         ON tbo.branch_id = tb.id
       LEFT JOIN skills s
         ON s.id = tbo.skill_id
       WHERE tb.role_id = $1
       GROUP BY tb.id
       ORDER BY tb.name`,
      [roleId]
    );

    res.json({
      success: true,
      data: {
        role: role.rows[0],
        skills: skills.rows,
        prerequisites: prerequisites.rows,
        technology_branches: branches.rows
      }
    });
  } catch (error) {
    console.error('Skill Graph API error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill graph'
    });
  }
});

export default router;