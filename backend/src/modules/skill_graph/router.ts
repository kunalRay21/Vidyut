import { Router, Request, Response } from 'express';
import { query } from '../../database/db';
import { apiSuccess, apiError } from '../../core/responses';

const router = Router();

async function handleGetSkillGraph(roleId: string, res: Response) {
  const role = await query(
    `SELECT id, name, description
     FROM roles
     WHERE id = $1`,
    [roleId]
  );

  if (role.rows.length === 0) {
    return apiError(res, 'Role not found', 404, 'NOT_FOUND');
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

  return apiSuccess(res, {
    role: role.rows[0],
    skills: skills.rows,
    prerequisites: prerequisites.rows,
    technology_branches: branches.rows
  });
}

// Get complete skill graph for a role by path param
router.get('/roles/:roleId/graph', async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    return await handleGetSkillGraph(roleId, res);
  } catch (error: any) {
    console.error('Skill Graph API error:', error);
    return apiError(res, 'Failed to fetch skill graph: ' + error.message, 500, 'SERVER_ERROR');
  }
});

// Get complete skill graph for a role by query param (/api/v1/skills/graph?role_id=...)
router.get('/graph', async (req: Request, res: Response) => {
  try {
    const roleId = (req.query.role_id || req.query.roleId) as string;
    if (!roleId) {
      return apiError(res, 'role_id query parameter is required', 400, 'BAD_REQUEST');
    }
    return await handleGetSkillGraph(roleId, res);
  } catch (error: any) {
    console.error('Skill Graph API error:', error);
    return apiError(res, 'Failed to fetch skill graph: ' + error.message, 500, 'SERVER_ERROR');
  }
});

export default router;