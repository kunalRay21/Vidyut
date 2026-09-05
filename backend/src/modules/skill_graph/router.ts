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
  },
  'role-cloud': {
    role: { id: 'role-cloud', name: 'Cloud Native & DevOps Engineer', description: 'Deploy resilient containerized workloads, configure automated CI/CD pipelines, and maintain cloud infrastructure.' },
    skills: [
      { id: 'skill-linux', name: 'Linux Administration & Shell Scripting', category: 'SYSADMIN', description: 'File systems, permissions, process management, and Bash automation' },
      { id: 'skill-networking', name: 'Computer Networking & DNS Basics', category: 'NETWORKING', description: 'OSI model, TCP/UDP, TLS/SSL, reverse proxies, and firewalls' },
      { id: 'skill-docker', name: 'Container Orchestration with Docker', category: 'CONTAINERS', description: 'Microservice isolation, persistent volumes, and registries' },
      { id: 'skill-cicd', name: 'Automated CI/CD Pipelines', category: 'CI_CD', description: 'Automated test runners, build pipelines, and artifact publishing' },
      { id: 'skill-k8s', name: 'Kubernetes Cluster Management', category: 'ORCHESTRATION', description: 'Pods, Deployments, Services, and auto-scaling policies' },
      { id: 'skill-terraform', name: 'Infrastructure as Code (Terraform)', category: 'IAC', description: 'Declarative cloud provisioning and state management' }
    ],
    prerequisites: [
      { skill_id: 'skill-networking', prerequisite_skill_id: 'skill-linux', skill_name: 'Computer Networking & DNS Basics', prerequisite_name: 'Linux Administration & Shell Scripting' },
      { skill_id: 'skill-docker', prerequisite_skill_id: 'skill-linux', skill_name: 'Container Orchestration with Docker', prerequisite_name: 'Linux Administration & Shell Scripting' },
      { skill_id: 'skill-cicd', prerequisite_skill_id: 'skill-docker', skill_name: 'Automated CI/CD Pipelines', prerequisite_name: 'Container Orchestration with Docker' },
      { skill_id: 'skill-k8s', prerequisite_skill_id: 'skill-docker', skill_name: 'Kubernetes Cluster Management', prerequisite_name: 'Container Orchestration with Docker' },
      { skill_id: 'skill-terraform', prerequisite_skill_id: 'skill-k8s', skill_name: 'Infrastructure as Code (Terraform)', prerequisite_name: 'Kubernetes Cluster Management' }
    ],
    technology_branches: [
      {
        id: 'branch-cloud-provider',
        name: 'Cloud Infrastructure Provider',
        description: 'Choose between AWS and Azure architectures.',
        options: [
          { id: 'skill-aws', name: 'AWS Cloud Services', category: 'CLOUD' },
          { id: 'skill-azure', name: 'Microsoft Azure', category: 'CLOUD' }
        ]
      }
    ]
  },
  'role-data': {
    role: { id: 'role-data', name: 'Data Science & Big Data Engineer', description: 'Extract transformative business intelligence, orchestrate reliable ETL data pipelines, and architect data analytics.' },
    skills: [
      { id: 'skill-prob-stats', name: 'Probability & Descriptive Statistics', category: 'STATISTICS', description: 'Distributions, hypothesis testing, and confidence intervals' },
      { id: 'skill-adv-sql', name: 'Advanced SQL & Window Functions', category: 'DATABASE', description: 'PARTITION BY, RANK, CTEs, and query performance tuning' },
      { id: 'skill-etl', name: 'Automated ETL Pipeline Engineering', category: 'DATA_PIPELINES', description: 'Data extraction, schema validation, and transformation logic' },
      { id: 'skill-data-viz', name: 'Data Visualization & Storytelling', category: 'ANALYTICS', description: 'Constructing interactive dashboards and KPI monitoring' },
      { id: 'skill-spark', name: 'Distributed Processing with PySpark', category: 'BIG_DATA', description: 'RDDs, DataFrames, and parallel cluster execution' },
      { id: 'skill-kafka-stream', name: 'Real-Time Event Streaming (Kafka)', category: 'STREAMING', description: 'Pub/sub streaming architecture and consumer groups' }
    ],
    prerequisites: [
      { skill_id: 'skill-adv-sql', prerequisite_skill_id: 'skill-prob-stats', skill_name: 'Advanced SQL & Window Functions', prerequisite_name: 'Probability & Descriptive Statistics' },
      { skill_id: 'skill-etl', prerequisite_skill_id: 'skill-adv-sql', skill_name: 'Automated ETL Pipeline Engineering', prerequisite_name: 'Advanced SQL & Window Functions' },
      { skill_id: 'skill-data-viz', prerequisite_skill_id: 'skill-adv-sql', skill_name: 'Data Visualization & Storytelling', prerequisite_name: 'Advanced SQL & Window Functions' },
      { skill_id: 'skill-spark', prerequisite_skill_id: 'skill-etl', skill_name: 'Distributed Processing with PySpark', prerequisite_name: 'Automated ETL Pipeline Engineering' },
      { skill_id: 'skill-kafka-stream', prerequisite_skill_id: 'skill-spark', skill_name: 'Real-Time Event Streaming (Kafka)', prerequisite_name: 'Distributed Processing with PySpark' }
    ],
    technology_branches: [
      {
        id: 'branch-data-warehouse',
        name: 'Modern Data Warehouse Platform',
        description: 'Choose between Snowflake and Databricks.',
        options: [
          { id: 'skill-snowflake', name: 'Snowflake Analytics', category: 'DATABASE' },
          { id: 'skill-databricks', name: 'Databricks Lakehouse', category: 'BIG_DATA' }
        ]
      }
    ]
  },
  'role-fullstack': {
    role: { id: 'role-fullstack', name: 'Full-Stack Web Architect', description: 'Build rich user interfaces with React and connect them to performant distributed backend services.' },
    skills: [
      { id: 'skill-html-css', name: 'Semantic HTML5 & Modern CSS3', category: 'WEB', description: 'Document hierarchy, Flexbox, Grid layouts, and responsive queries' },
      { id: 'skill-ts', name: 'TypeScript & Type Safety', category: 'PROGRAMMING', description: 'Interfaces, generics, union types, and compiler configuration' },
      { id: 'skill-react', name: 'React Component Architecture & Hooks', category: 'FRONTEND', description: 'Custom hooks, state management, and virtual DOM efficiency' },
      { id: 'skill-node-api', name: 'Backend API Integration (Node/Express)', category: 'BACKEND', description: 'Route controllers, middleware chains, and validation' },
      { id: 'skill-nextjs', name: 'Server-Side Rendering (Next.js)', category: 'FULLSTACK', description: 'Server components, static site generation, and SEO' },
      { id: 'skill-testing', name: 'Automated Testing & End-to-End', category: 'TESTING', description: 'Unit testing with Jest/Vitest and React Testing Library' }
    ],
    prerequisites: [
      { skill_id: 'skill-ts', prerequisite_skill_id: 'skill-html-css', skill_name: 'TypeScript & Type Safety', prerequisite_name: 'Semantic HTML5 & Modern CSS3' },
      { skill_id: 'skill-react', prerequisite_skill_id: 'skill-ts', skill_name: 'React Component Architecture & Hooks', prerequisite_name: 'TypeScript & Type Safety' },
      { skill_id: 'skill-node-api', prerequisite_skill_id: 'skill-ts', skill_name: 'Backend API Integration (Node/Express)', prerequisite_name: 'TypeScript & Type Safety' },
      { skill_id: 'skill-nextjs', prerequisite_skill_id: 'skill-react', skill_name: 'Server-Side Rendering (Next.js)', prerequisite_name: 'React Component Architecture & Hooks' },
      { skill_id: 'skill-testing', prerequisite_skill_id: 'skill-nextjs', skill_name: 'Automated Testing & End-to-End', prerequisite_name: 'Server-Side Rendering (Next.js)' }
    ],
    technology_branches: [
      {
        id: 'branch-state-management',
        name: 'Client State Architecture',
        description: 'Choose between Zustand and Redux Toolkit.',
        options: [
          { id: 'skill-zustand', name: 'Zustand Minimal State', category: 'FRONTEND' },
          { id: 'skill-redux', name: 'Redux Toolkit Enterprise', category: 'FRONTEND' }
        ]
      }
    ]
  },
  'role-security': {
    role: { id: 'role-security', name: 'Cybersecurity & Defensive Specialist', description: 'Analyze network vulnerabilities, implement zero-trust authentication protocols, and harden enterprise applications.' },
    skills: [
      { id: 'skill-sec-net', name: 'Network Protocol & Packet Analysis', category: 'NETWORKING', description: 'Packet sniffing with Wireshark, TCP handshakes, and port scanning' },
      { id: 'skill-crypto', name: 'Applied Cryptography Fundamentals', category: 'CRYPTOGRAPHY', description: 'Symmetric/asymmetric encryption, hashing, and PKI infrastructure' },
      { id: 'skill-owasp', name: 'Web Application Security (OWASP Top 10)', category: 'APPSEC', description: 'Remediating SQL injections, XSS vulnerabilities, and CSRF' },
      { id: 'skill-iam', name: 'Identity & Access Management (OAuth/JWT)', category: 'AUTH', description: 'Token validation, refresh rotation, and OAuth flows' },
      { id: 'skill-siem', name: 'Defensive SIEM & Threat Monitoring', category: 'OPERATIONS', description: 'Log ingestion, alert triage, and intrusion detection' },
      { id: 'skill-zero-trust', name: 'Zero-Trust Architecture & Hardening', category: 'ENTERPRISE', description: 'Least privilege enforcement, kernel hardening, and compliance' }
    ],
    prerequisites: [
      { skill_id: 'skill-crypto', prerequisite_skill_id: 'skill-sec-net', skill_name: 'Applied Cryptography Fundamentals', prerequisite_name: 'Network Protocol & Packet Analysis' },
      { skill_id: 'skill-owasp', prerequisite_skill_id: 'skill-sec-net', skill_name: 'Web Application Security (OWASP Top 10)', prerequisite_name: 'Network Protocol & Packet Analysis' },
      { skill_id: 'skill-iam', prerequisite_skill_id: 'skill-crypto', skill_name: 'Identity & Access Management (OAuth/JWT)', prerequisite_name: 'Applied Cryptography Fundamentals' },
      { skill_id: 'skill-siem', prerequisite_skill_id: 'skill-owasp', skill_name: 'Defensive SIEM & Threat Monitoring', prerequisite_name: 'Web Application Security (OWASP Top 10)' },
      { skill_id: 'skill-zero-trust', prerequisite_skill_id: 'skill-iam', skill_name: 'Zero-Trust Architecture & Hardening', prerequisite_name: 'Identity & Access Management (OAuth/JWT)' }
    ],
    technology_branches: [
      {
        id: 'branch-security-ops',
        name: 'Defensive Security Specialization',
        description: 'Choose between Cloud Security Posture and Incident Response.',
        options: [
          { id: 'skill-cloudsec', name: 'Cloud Security Posture (CSPM)', category: 'SECURITY' },
          { id: 'skill-forensics', name: 'Digital Forensics & Incident Response', category: 'SECURITY' }
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
  if (roleId.includes('backend')) {
    return apiSuccess(res, FALLBACK_GRAPHS['role-backend']);
  }
  if (roleId.includes('ml')) {
    return apiSuccess(res, FALLBACK_GRAPHS['role-ml']);
  }
  if (roleId.includes('cloud') || roleId.includes('devops')) {
    return apiSuccess(res, FALLBACK_GRAPHS['role-cloud']);
  }
  if (roleId.includes('data')) {
    return apiSuccess(res, FALLBACK_GRAPHS['role-data']);
  }
  if (roleId.includes('fullstack') || roleId.includes('full-stack')) {
    return apiSuccess(res, FALLBACK_GRAPHS['role-fullstack']);
  }
  if (roleId.includes('security') || roleId.includes('cyber')) {
    return apiSuccess(res, FALLBACK_GRAPHS['role-security']);
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