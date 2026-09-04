import { Router, Request, Response } from 'express';
import { query } from '../../database/db';
import { apiSuccess, apiError } from '../../core/responses';

const router = Router();

const FALLBACK_GRAPHS: Record<string, any> = {
  'role-backend': {
    role: { id: 'role-backend', name: 'Backend Developer', description: 'Develops scalable APIs, databases and server-side applications.' },
    skills: [
      { id: 'skill-prog-fund', name: 'Programming Fundamentals', category: 'FOUNDATION', description: 'Variables, functions, control flow' },
      { id: 'skill-git', name: 'Git & GitHub', category: 'TOOLS', description: 'Version control and collaborative development' },
      { id: 'skill-http', name: 'HTTP', category: 'WEB', description: 'HTTP methods, status codes, headers' },
      { id: 'skill-rest', name: 'REST API', category: 'WEB', description: 'RESTful API design and implementation' },
      { id: 'skill-sql', name: 'SQL', category: 'DATABASE', description: 'Relational database querying and modeling' },
      { id: 'skill-db-design', name: 'Database Design', category: 'DATABASE', description: 'Schemas, normalization, indexes' },
      { id: 'skill-auth', name: 'Authentication', category: 'SECURITY', description: 'JWT, sessions, OAuth' },
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', description: 'Python backend scripting and development' },
      { id: 'skill-docker', name: 'Docker', category: 'DEVOPS', description: 'Containerization and packaging' }
    ],
    prerequisites: [
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-prog-fund', skill_name: 'Git & GitHub', prerequisite_name: 'Programming Fundamentals' },
      { skill_id: 'skill-http', prerequisite_skill_id: 'skill-prog-fund', skill_name: 'HTTP', prerequisite_name: 'Programming Fundamentals' },
      { skill_id: 'skill-rest', prerequisite_skill_id: 'skill-http', skill_name: 'REST API', prerequisite_name: 'HTTP' },
      { skill_id: 'skill-sql', prerequisite_skill_id: 'skill-prog-fund', skill_name: 'SQL', prerequisite_name: 'Programming Fundamentals' },
      { skill_id: 'skill-db-design', prerequisite_skill_id: 'skill-sql', skill_name: 'Database Design', prerequisite_name: 'SQL' },
      { skill_id: 'skill-auth', prerequisite_skill_id: 'skill-rest', skill_name: 'Authentication', prerequisite_name: 'REST API' },
      { skill_id: 'skill-docker', prerequisite_skill_id: 'skill-rest', skill_name: 'Docker', prerequisite_name: 'REST API' }
    ],
    technology_branches: [
      {
        id: 'branch-backend-framework',
        name: 'Python Web Framework',
        description: 'Choose between FastAPI and Django.',
        options: [
          { id: 'skill-fastapi', name: 'FastAPI', category: 'FRAMEWORK' },
          { id: 'skill-django', name: 'Django', category: 'FRAMEWORK' }
        ]
      }
    ]
  },
  'role-ml': {
    role: { id: 'role-ml', name: 'Machine Learning Engineer', description: 'Builds, evaluates and deploys machine learning systems.' },
    skills: [
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', description: 'Python programming for ML' },
      { id: 'skill-git', name: 'Git', category: 'TOOLS', description: 'Version control' },
      { id: 'skill-numpy', name: 'NumPy', category: 'DATA', description: 'Numerical computing with Python' },
      { id: 'skill-pandas', name: 'Pandas', category: 'DATA', description: 'Data manipulation and analysis' },
      { id: 'skill-stats', name: 'Statistics', category: 'MATHEMATICS', description: 'Probability, distributions, hypothesis tests' },
      { id: 'skill-linalg', name: 'Linear Algebra', category: 'MATHEMATICS', description: 'Vectors, matrices, linear transformations' },
      { id: 'skill-ml-fund', name: 'Machine Learning Fundamentals', category: 'MACHINE_LEARNING', description: 'Supervised and unsupervised learning' }
    ],
    prerequisites: [
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-python', skill_name: 'Git', prerequisite_name: 'Python' },
      { skill_id: 'skill-numpy', prerequisite_skill_id: 'skill-python', skill_name: 'NumPy', prerequisite_name: 'Python' },
      { skill_id: 'skill-pandas', prerequisite_skill_id: 'skill-numpy', skill_name: 'Pandas', prerequisite_name: 'NumPy' },
      { skill_id: 'skill-stats', prerequisite_skill_id: 'skill-python', skill_name: 'Statistics', prerequisite_name: 'Python' },
      { skill_id: 'skill-linalg', prerequisite_skill_id: 'skill-python', skill_name: 'Linear Algebra', prerequisite_name: 'Python' },
      { skill_id: 'skill-ml-fund', prerequisite_skill_id: 'skill-pandas', skill_name: 'Machine Learning Fundamentals', prerequisite_name: 'Pandas' }
    ],
    technology_branches: [
      {
        id: 'branch-dl-framework',
        name: 'Deep Learning Framework',
        description: 'Choose between TensorFlow and PyTorch.',
        options: [
          { id: 'skill-tf', name: 'TensorFlow', category: 'FRAMEWORK' },
          { id: 'skill-pytorch', name: 'PyTorch', category: 'FRAMEWORK' }
        ]
      }
    ]
  }
};

async function handleGetSkillGraph(roleId: string, res: Response) {
  try {
    const role = await query(
      `SELECT id, name, description
       FROM roles
       WHERE id = $1`,
      [roleId]
    );

    if (role.rows.length > 0) {
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
  } catch {
    // Database offline or query failed, try fallback
  }

  // Check fallback by role ID or default to backend/ML
  if (FALLBACK_GRAPHS[roleId]) {
    return apiSuccess(res, FALLBACK_GRAPHS[roleId]);
  }

  // If generic ID requested, provide the golden backend demo
  if (roleId.includes('backend') || roleId === '00000000-0000-0000-0000-000000000000') {
    return apiSuccess(res, FALLBACK_GRAPHS['role-backend']);
  }
  if (roleId.includes('ml')) {
    return apiSuccess(res, FALLBACK_GRAPHS['role-ml']);
  }

  return apiError(res, 'Role not found', 404, 'NOT_FOUND');
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