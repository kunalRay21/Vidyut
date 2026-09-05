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
  },
  {
    id: 'domain-cloud',
    name: 'Cloud Native & DevOps',
    description: 'Deploying containerized workloads, CI/CD pipelines, and managing cloud infrastructure.',
    demand_level: 'CRITICAL'
  },
  {
    id: 'domain-data',
    name: 'Data Science & Big Data',
    description: 'Extracting business intelligence, automated ETL pipelines, and data analytics.',
    demand_level: 'HIGH'
  },
  {
    id: 'domain-fullstack',
    name: 'Full-Stack Web Architecture',
    description: 'Building rich frontend interfaces and connecting them to distributed backend APIs.',
    demand_level: 'HIGH'
  },
  {
    id: 'domain-security',
    name: 'Cybersecurity & Defensive Systems',
    description: 'Analyzing vulnerabilities, zero-trust authentication, and hardening enterprise systems.',
    demand_level: 'CRITICAL'
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
  },
  'role-cloud': {
    role: {
      id: 'role-cloud',
      name: 'Cloud Native & DevOps Engineer',
      description: 'Deploy resilient containerized workloads, configure automated CI/CD pipelines, and maintain cloud infrastructure.',
      domain_id: 'domain-cloud',
      domain_name: 'Cloud Native & DevOps'
    },
    skills: [
      { id: 'skill-linux', name: 'Linux Administration & Shell Scripting', category: 'SYSADMIN', description: 'File systems, permissions, process management, and Bash automation' },
      { id: 'skill-networking', name: 'Computer Networking & DNS Basics', category: 'NETWORKING', description: 'OSI model, TCP/UDP, TLS/SSL, reverse proxies, and firewalls' },
      { id: 'skill-docker', name: 'Container Orchestration with Docker', category: 'CONTAINERS', description: 'Microservice isolation, persistent volumes, and registries' },
      { id: 'skill-cicd', name: 'Automated CI/CD Pipelines', category: 'CI_CD', description: 'Automated test runners, build pipelines, and artifact publishing' },
      { id: 'skill-k8s', name: 'Kubernetes Cluster Management', category: 'ORCHESTRATION', description: 'Pods, Deployments, Services, and auto-scaling policies' },
      { id: 'skill-terraform', name: 'Infrastructure as Code (Terraform)', category: 'IAC', description: 'Declarative cloud provisioning and state management' }
    ]
  },
  'role-data': {
    role: {
      id: 'role-data',
      name: 'Data Science & Big Data Engineer',
      description: 'Extract transformative business intelligence, orchestrate reliable ETL data pipelines, and architect data analytics.',
      domain_id: 'domain-data',
      domain_name: 'Data Science & Big Data'
    },
    skills: [
      { id: 'skill-prob-stats', name: 'Probability & Descriptive Statistics', category: 'STATISTICS', description: 'Distributions, hypothesis testing, and confidence intervals' },
      { id: 'skill-adv-sql', name: 'Advanced SQL & Window Functions', category: 'DATABASE', description: 'PARTITION BY, RANK, CTEs, and query performance tuning' },
      { id: 'skill-etl', name: 'Automated ETL Pipeline Engineering', category: 'DATA_PIPELINES', description: 'Data extraction, schema validation, and transformation logic' },
      { id: 'skill-data-viz', name: 'Data Visualization & Storytelling', category: 'ANALYTICS', description: 'Constructing interactive dashboards and KPI monitoring' },
      { id: 'skill-spark', name: 'Distributed Processing with PySpark', category: 'BIG_DATA', description: 'RDDs, DataFrames, and parallel cluster execution' },
      { id: 'skill-kafka-stream', name: 'Real-Time Event Streaming (Kafka)', category: 'STREAMING', description: 'Pub/sub streaming architecture and consumer groups' }
    ]
  },
  'role-fullstack': {
    role: {
      id: 'role-fullstack',
      name: 'Full-Stack Web Architect',
      description: 'Build rich user interfaces with React and connect them to performant distributed backend services.',
      domain_id: 'domain-fullstack',
      domain_name: 'Full-Stack Web Architecture'
    },
    skills: [
      { id: 'skill-html-css', name: 'Semantic HTML5 & Modern CSS3', category: 'WEB', description: 'Document hierarchy, Flexbox, Grid layouts, and responsive queries' },
      { id: 'skill-ts', name: 'TypeScript & Type Safety', category: 'PROGRAMMING', description: 'Interfaces, generics, union types, and compiler configuration' },
      { id: 'skill-react', name: 'React Component Architecture & Hooks', category: 'FRONTEND', description: 'Custom hooks, state management, and virtual DOM efficiency' },
      { id: 'skill-node-api', name: 'Backend API Integration (Node/Express)', category: 'BACKEND', description: 'Route controllers, middleware chains, and validation' },
      { id: 'skill-nextjs', name: 'Server-Side Rendering (Next.js)', category: 'FULLSTACK', description: 'Server components, static site generation, and SEO' },
      { id: 'skill-testing', name: 'Automated Testing & End-to-End', category: 'TESTING', description: 'Unit testing with Jest/Vitest and React Testing Library' }
    ]
  },
  'role-security': {
    role: {
      id: 'role-security',
      name: 'Cybersecurity & Defensive Specialist',
      description: 'Analyze network vulnerabilities, implement zero-trust authentication protocols, and harden enterprise applications.',
      domain_id: 'domain-security',
      domain_name: 'Cybersecurity & Defensive Systems'
    },
    skills: [
      { id: 'skill-sec-net', name: 'Network Protocol & Packet Analysis', category: 'NETWORKING', description: 'Packet sniffing with Wireshark, TCP handshakes, and port scanning' },
      { id: 'skill-crypto', name: 'Applied Cryptography Fundamentals', category: 'CRYPTOGRAPHY', description: 'Symmetric/asymmetric encryption, hashing, and PKI infrastructure' },
      { id: 'skill-owasp', name: 'Web Application Security (OWASP Top 10)', category: 'APPSEC', description: 'Remediating SQL injections, XSS vulnerabilities, and CSRF' },
      { id: 'skill-iam', name: 'Identity & Access Management (OAuth/JWT)', category: 'AUTH', description: 'Token validation, refresh rotation, and OAuth flows' },
      { id: 'skill-siem', name: 'Defensive SIEM & Threat Monitoring', category: 'OPERATIONS', description: 'Log ingestion, alert triage, and intrusion detection' },
      { id: 'skill-zero-trust', name: 'Zero-Trust Architecture & Hardening', category: 'ENTERPRISE', description: 'Least privilege enforcement, kernel hardening, and compliance' }
    ]
  }
};

import { getAllAcademicBranches, getPersonalizedDomainsForStudent, seedAcademicBranches, migrateExistingStudentProfiles } from './academicBranch.service';

// Auto-seed academic branches on load
seedAcademicBranches().then(() => migrateExistingStudentProfiles()).catch(() => {});

// GET all canonical academic branches (Phase 2)
router.get('/academic-branches', async (req: Request, res: Response) => {
  try {
    const branches = await getAllAcademicBranches();
    return apiSuccess(res, branches);
  } catch (error: any) {
    console.error('[Academic Branches Error]', error);
    return apiError(res, 'Failed to fetch academic branches: ' + error.message, 500, 'SERVER_ERROR');
  }
});

// GET personalized domains ranked by student's academic branch relevance (Phase 2)
router.get('/personalized-domains', async (req: Request, res: Response) => {
  try {
    const studentId = (req.query.student_id || req.headers['x-student-id']) as string | undefined;
    const authHeader = req.headers.authorization;
    let userIdOrStudentId = studentId;

    if (!userIdOrStudentId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { verifyToken } = require('../../auth/jwt');
        const decoded = verifyToken(token);
        if (decoded?.id) userIdOrStudentId = decoded.id;
      } catch {
        // ignore
      }
    }

    const domains = await getPersonalizedDomainsForStudent(userIdOrStudentId || '');
    return apiSuccess(res, domains);
  } catch (error: any) {
    console.error('[Personalized Domains Error]', error);
    return apiError(res, 'Failed to fetch personalized domains: ' + error.message, 500, 'SERVER_ERROR');
  }
});

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