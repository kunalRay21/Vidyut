import { Router, Request, Response } from 'express';
import { query } from '../../database/db';
import { apiSuccess, apiError } from '../../core/responses';

const router = Router();

const FALLBACK_DOMAINS = [
  {
    id: 'domain-backend',
    name: 'Backend Development',
    description: 'Designing, developing and deploying server-side applications and APIs.',
    demand_level: 'HIGH'
  },
  {
    id: 'domain-ml',
    name: 'Machine Learning',
    description: 'Building, training and deploying machine learning systems.',
    demand_level: 'HIGH'
  }
];

const FALLBACK_ROLES: Record<string, { role: any; skills: any[] }> = {
  'role-backend': {
    role: {
      id: 'role-backend',
      name: 'Backend Developer',
      description: 'Develops scalable APIs, databases and server-side applications.',
      domain_id: 'domain-backend',
      domain_name: 'Backend Development'
    },
    skills: [
      { id: 'skill-prog-fund', name: 'Programming Fundamentals', category: 'FOUNDATION', description: 'Variables, functions, control flow' },
      { id: 'skill-git', name: 'Git & GitHub', category: 'TOOLS', description: 'Version control and collaborative development' },
      { id: 'skill-http', name: 'HTTP', category: 'WEB', description: 'HTTP methods, status codes, headers' },
      { id: 'skill-rest', name: 'REST API', category: 'WEB', description: 'RESTful API design and implementation' },
      { id: 'skill-sql', name: 'SQL', category: 'DATABASE', description: 'Relational database querying and modeling' },
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', description: 'Python backend scripting and development' },
      { id: 'skill-docker', name: 'Docker', category: 'DEVOPS', description: 'Containerization and packaging' }
    ]
  },
  'role-ml': {
    role: {
      id: 'role-ml',
      name: 'Machine Learning Engineer',
      description: 'Builds, evaluates and deploys machine learning systems.',
      domain_id: 'domain-ml',
      domain_name: 'Machine Learning'
    },
    skills: [
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', description: 'Python programming for ML' },
      { id: 'skill-git', name: 'Git', category: 'TOOLS', description: 'Version control' },
      { id: 'skill-numpy', name: 'NumPy', category: 'DATA', description: 'Numerical computing with Python' },
      { id: 'skill-pandas', name: 'Pandas', category: 'DATA', description: 'Data manipulation and analysis' },
      { id: 'skill-linalg', name: 'Linear Algebra', category: 'MATHEMATICS', description: 'Vectors, matrices, linear transformations' },
      { id: 'skill-ml-fund', name: 'Machine Learning Fundamentals', category: 'MACHINE_LEARNING', description: 'Supervised and unsupervised learning' }
    ]
  }
};

// GET all career domains
router.get('/domains', async (req: Request, res: Response) => {
  try {
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

      if (result.rows.length > 0) {
        return apiSuccess(res, result.rows);
      }
    } catch {
      // Fallback for offline development
    }

    return apiSuccess(res, FALLBACK_DOMAINS);
  } catch (error: any) {
    console.error('[Career Domains Error]', error);
    return apiError(res, 'Failed to fetch career domains: ' + error.message, 500, 'SERVER_ERROR');
  }
});

// GET role details + required skills
router.get('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    try {
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

      if (roleResult.rows.length > 0) {
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
      }
    } catch {
      // Fallback
    }

    if (FALLBACK_ROLES[id]) {
      return apiSuccess(res, FALLBACK_ROLES[id]);
    }

    return apiError(res, 'Role not found', 404, 'NOT_FOUND');
  } catch (error: any) {
    console.error('[Career Role Error]', error);
    return apiError(res, 'Failed to fetch career role: ' + error.message, 500, 'SERVER_ERROR');
  }
});

export default router;