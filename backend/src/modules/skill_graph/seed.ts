import { query } from '../../database/db';

type SkillSeed = [string, string, string];

async function seedSkillGraph() {
  console.log('🌱 Seeding Skill Graph...');

  // 1. DOMAINS

  const backendDomain = await query<{ id: string }>(
    `
    INSERT INTO domains (name, description, demand_level)
    VALUES ($1, $2, $3)
    ON CONFLICT (name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      'Backend Development',
      'Designing, developing and deploying server-side applications and APIs.',
      'HIGH'
    ]
  );

  const mlDomain = await query<{ id: string }>(
    `
    INSERT INTO domains (name, description, demand_level)
    VALUES ($1, $2, $3)
    ON CONFLICT (name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      'Machine Learning',
      'Building, training and deploying machine learning systems.',
      'HIGH'
    ]
  );

  const backendDomainId = backendDomain.rows[0].id;
  const mlDomainId = mlDomain.rows[0].id;

// 2. ROLES

  const backendRole = await query<{ id: string }>(
    `
    INSERT INTO roles (domain_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (domain_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      backendDomainId,
      'Backend Developer',
      'Develops scalable APIs, databases and server-side applications.'
    ]
  );

  const mlRole = await query<{ id: string }>(
    `
    INSERT INTO roles (domain_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (domain_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      mlDomainId,
      'Machine Learning Engineer',
      'Builds, evaluates and deploys machine learning systems.'
    ]
  );

  const backendRoleId = backendRole.rows[0].id;
  const mlRoleId = mlRole.rows[0].id;

 // 3. BACKEND SKILLS

  const backendSkills: SkillSeed[] = [
    ['Programming Fundamentals', 'Variables, functions, control flow and basic programming concepts.', 'FOUNDATION'],
    ['Git & GitHub', 'Version control and collaborative software development.', 'TOOLS'],
    ['HTTP', 'HTTP methods, status codes, headers and request-response lifecycle.', 'WEB'],
    ['REST API', 'Design and development of RESTful APIs.', 'WEB'],
    ['SQL', 'Relational database querying and data manipulation.', 'DATABASE'],
    ['Database Design', 'Tables, relationships, keys, normalization and schema design.', 'DATABASE'],
    ['Authentication', 'User authentication using sessions, tokens and JWT.', 'SECURITY'],
    ['API Security', 'Authorization, validation and secure API practices.', 'SECURITY'],
    ['Testing', 'Unit, integration and API testing.', 'QUALITY'],
    ['Python', 'Python programming for backend development.', 'PROGRAMMING'],
    ['FastAPI', 'Modern Python framework for building APIs.', 'FRAMEWORK'],
    ['Django', 'Python web framework for backend applications.', 'FRAMEWORK'],
    ['Docker', 'Containerization and application packaging.', 'DEVOPS'],
    ['CI/CD', 'Automated build, test and deployment pipelines.', 'DEVOPS'],
    ['Backend Deployment', 'Deploying backend applications to production environments.', 'DEPLOYMENT']
  ];

  const backendIds = new Map<string, string>();

  for (const [name, description, category] of backendSkills) {
    const result = await query<{ id: string }>(
      `
      INSERT INTO skills (role_id, name, description, category)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (role_id, name)
      DO UPDATE SET description = EXCLUDED.description,
                    category = EXCLUDED.category
      RETURNING id
      `,
      [backendRoleId, name, description, category]
    );

    backendIds.set(name, result.rows[0].id);
  }

  // 4. BACKEND PREREQUISITES

  const backendEdges: [string, string][] = [
    ['Git & GitHub', 'Programming Fundamentals'],
    ['HTTP', 'Programming Fundamentals'],
    ['REST API', 'HTTP'],
    ['SQL', 'Programming Fundamentals'],
    ['Database Design', 'SQL'],
    ['Authentication', 'REST API'],
    ['Authentication', 'Database Design'],
    ['API Security', 'Authentication'],
    ['Testing', 'REST API'],
    ['Python', 'Programming Fundamentals'],
    ['FastAPI', 'Python'],
    ['FastAPI', 'REST API'],
    ['Django', 'Python'],
    ['Django', 'REST API'],
    ['Docker', 'REST API'],
    ['Docker', 'Testing'],
    ['CI/CD', 'Docker'],
    ['Backend Deployment', 'Docker'],
    ['Backend Deployment', 'CI/CD']
  ];

  for (const [skill, prerequisite] of backendEdges) {
    await query(
      `
      INSERT INTO skill_prerequisites
        (skill_id, prerequisite_skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [backendIds.get(skill), backendIds.get(prerequisite)]
    );
  }

    // 5. BACKEND TECHNOLOGY BRANCH

  const backendBranch = await query<{ id: string }>(
    `
    INSERT INTO technology_branches
      (role_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (role_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      backendRoleId,
      'Python Web Framework',
      'Choose between FastAPI and Django.'
    ]
  );

  const backendBranchId = backendBranch.rows[0].id;

  for (const skill of ['FastAPI', 'Django']) {
    await query(
      `
      INSERT INTO technology_branch_options
        (branch_id, skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [backendBranchId, backendIds.get(skill)]
    );
  }

 // 6. ML SKILLS

  const mlSkills: SkillSeed[] = [
    ['Python', 'Python programming for machine learning.', 'PROGRAMMING'],
    ['Git', 'Version control and collaborative development.', 'TOOLS'],
    ['NumPy', 'Numerical computing with Python arrays and operations.', 'DATA'],
    ['Pandas', 'Data manipulation and analysis using DataFrames.', 'DATA'],
    ['Statistics', 'Probability, distributions, statistics and hypothesis concepts.', 'MATHEMATICS'],
    ['Linear Algebra', 'Vectors, matrices and mathematical operations.', 'MATHEMATICS'],
    ['SQL', 'Querying and managing structured datasets.', 'DATABASE'],
    ['Data Preprocessing', 'Cleaning, transforming and preparing datasets.', 'DATA'],
    ['Machine Learning Fundamentals', 'Supervised, unsupervised and basic ML algorithms.', 'MACHINE_LEARNING'],
    ['Model Evaluation', 'Metrics and techniques for evaluating ML models.', 'MACHINE_LEARNING'],
    ['Feature Engineering', 'Creating and selecting useful features.', 'MACHINE_LEARNING'],
    ['Deep Learning', 'Neural networks and deep learning fundamentals.', 'DEEP_LEARNING'],
    ['TensorFlow', 'Deep learning development using TensorFlow.', 'FRAMEWORK'],
    ['PyTorch', 'Deep learning development using PyTorch.', 'FRAMEWORK'],
    ['Model Deployment', 'Serving machine learning models in production.', 'DEPLOYMENT'],
    ['MLOps', 'Operational practices for machine learning systems.', 'MLOPS'],
    ['Data Visualization', 'Visual exploration and communication of datasets.', 'DATA'],
    ['Experiment Tracking', 'Tracking ML experiments, parameters and results.', 'MLOPS']
  ];

  const mlIds = new Map<string, string>();

  for (const [name, description, category] of mlSkills) {
    const result = await query<{ id: string }>(
      `
      INSERT INTO skills (role_id, name, description, category)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (role_id, name)
      DO UPDATE SET description = EXCLUDED.description,
                    category = EXCLUDED.category
      RETURNING id
      `,
      [mlRoleId, name, description, category]
    );

    mlIds.set(name, result.rows[0].id);
  }

    // 7. ML PREREQUISITES

  const mlEdges: [string, string][] = [
    ['Git', 'Python'],
    ['NumPy', 'Python'],
    ['Pandas', 'NumPy'],
    ['Statistics', 'Python'],
    ['Linear Algebra', 'Python'],
    ['SQL', 'Python'],
    ['Data Preprocessing', 'Pandas'],
    ['Data Preprocessing', 'Statistics'],
    ['Data Preprocessing', 'SQL'],
    ['Machine Learning Fundamentals', 'Data Preprocessing'],
    ['Machine Learning Fundamentals', 'Statistics'],
    ['Machine Learning Fundamentals', 'Linear Algebra'],
    ['Model Evaluation', 'Machine Learning Fundamentals'],
    ['Feature Engineering', 'Machine Learning Fundamentals'],
    ['Feature Engineering', 'Pandas'],
    ['Deep Learning', 'Machine Learning Fundamentals'],
    ['TensorFlow', 'Deep Learning'],
    ['PyTorch', 'Deep Learning'],
    ['Model Deployment', 'TensorFlow'],
    ['Model Deployment', 'PyTorch'],
    ['MLOps', 'Model Deployment'],
    ['Experiment Tracking', 'Machine Learning Fundamentals'],
    ['MLOps', 'Experiment Tracking'],
    ['Data Visualization', 'Pandas']
  ];

  for (const [skill, prerequisite] of mlEdges) {
    await query(
      `
      INSERT INTO skill_prerequisites
        (skill_id, prerequisite_skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [mlIds.get(skill), mlIds.get(prerequisite)]
    );
  }

// 8. ML TECHNOLOGY BRANCH

  const mlBranch = await query<{ id: string }>(
    `
    INSERT INTO technology_branches
      (role_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (role_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      mlRoleId,
      'Deep Learning Framework',
      'Choose between TensorFlow and PyTorch.'
    ]
  );

  const mlBranchId = mlBranch.rows[0].id;

  for (const skill of ['TensorFlow', 'PyTorch']) {
    await query(
      `
      INSERT INTO technology_branch_options
        (branch_id, skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [mlBranchId, mlIds.get(skill)]
    );
  }

  console.log('Machine Learning Engineer:', mlRoleId);
}

export { seedSkillGraph };

if (require.main === module) {
  seedSkillGraph().catch((error) => {
    console.error('❌ Skill Graph seed failed:', error);
    process.exit(1);
  });
}