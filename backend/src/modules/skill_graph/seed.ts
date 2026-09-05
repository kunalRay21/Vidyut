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

  // 9. CLOUD DOMAIN & ROLE
  const cloudDomain = await query<{ id: string }>(
    `
    INSERT INTO domains (name, description, demand_level)
    VALUES ($1, $2, $3)
    ON CONFLICT (name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      'Cloud Native & DevOps',
      'Deploying containerized workloads, CI/CD pipelines, and managing cloud infrastructure.',
      'CRITICAL'
    ]
  );
  const cloudDomainId = cloudDomain.rows[0].id;

  const cloudRole = await query<{ id: string }>(
    `
    INSERT INTO roles (domain_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (domain_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      cloudDomainId,
      'Cloud Native & DevOps Engineer',
      'Deploy resilient containerized workloads, configure automated CI/CD pipelines, and maintain cloud infrastructure.'
    ]
  );
  const cloudRoleId = cloudRole.rows[0].id;

  const cloudSkills: SkillSeed[] = [
    ['Linux Administration & Shell Scripting', 'File systems, permissions, process management, and Bash automation.', 'SYSADMIN'],
    ['Computer Networking & DNS Basics', 'OSI model, TCP/UDP, TLS/SSL, reverse proxies, and firewalls.', 'NETWORKING'],
    ['Container Orchestration with Docker', 'Microservice isolation, persistent volumes, and registries.', 'CONTAINERS'],
    ['Automated CI/CD Pipelines', 'Automated test runners, build pipelines, and artifact publishing.', 'CI_CD'],
    ['Kubernetes Cluster Management', 'Pods, Deployments, Services, and auto-scaling policies.', 'ORCHESTRATION'],
    ['Infrastructure as Code (Terraform)', 'Declarative cloud provisioning and state management.', 'IAC'],
    ['AWS Cloud Services', 'Deploying and operating AWS compute and storage architectures.', 'CLOUD'],
    ['Microsoft Azure', 'Operating enterprise workloads on Azure cloud resources.', 'CLOUD']
  ];

  const cloudIds = new Map<string, string>();
  for (const [name, description, category] of cloudSkills) {
    const result = await query<{ id: string }>(
      `
      INSERT INTO skills (role_id, name, description, category)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (role_id, name)
      DO UPDATE SET description = EXCLUDED.description,
                    category = EXCLUDED.category
      RETURNING id
      `,
      [cloudRoleId, name, description, category]
    );
    cloudIds.set(name, result.rows[0].id);
  }

  const cloudEdges: [string, string][] = [
    ['Computer Networking & DNS Basics', 'Linux Administration & Shell Scripting'],
    ['Container Orchestration with Docker', 'Linux Administration & Shell Scripting'],
    ['Automated CI/CD Pipelines', 'Container Orchestration with Docker'],
    ['Kubernetes Cluster Management', 'Container Orchestration with Docker'],
    ['Kubernetes Cluster Management', 'Computer Networking & DNS Basics'],
    ['Infrastructure as Code (Terraform)', 'Automated CI/CD Pipelines']
  ];

  for (const [skill, prerequisite] of cloudEdges) {
    await query(
      `
      INSERT INTO skill_prerequisites (skill_id, prerequisite_skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [cloudIds.get(skill), cloudIds.get(prerequisite)]
    );
  }

  const cloudBranch = await query<{ id: string }>(
    `
    INSERT INTO technology_branches (role_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (role_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      cloudRoleId,
      'Primary Cloud Provider',
      'Choose between AWS Cloud Services and Microsoft Azure.'
    ]
  );
  const cloudBranchId = cloudBranch.rows[0].id;
  for (const skill of ['AWS Cloud Services', 'Microsoft Azure']) {
    await query(
      `
      INSERT INTO technology_branch_options (branch_id, skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [cloudBranchId, cloudIds.get(skill)]
    );
  }

  // 10. DATA SCIENCE DOMAIN & ROLE
  const dataDomain = await query<{ id: string }>(
    `
    INSERT INTO domains (name, description, demand_level)
    VALUES ($1, $2, $3)
    ON CONFLICT (name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      'Data Science & Big Data',
      'Extracting business intelligence, automated ETL pipelines, and data analytics.',
      'HIGH'
    ]
  );
  const dataDomainId = dataDomain.rows[0].id;

  const dataRole = await query<{ id: string }>(
    `
    INSERT INTO roles (domain_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (domain_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      dataDomainId,
      'Data Science & Big Data Engineer',
      'Extract transformative business intelligence, orchestrate reliable ETL data pipelines, and architect data analytics.'
    ]
  );
  const dataRoleId = dataRole.rows[0].id;

  const dataSkills: SkillSeed[] = [
    ['Probability & Descriptive Statistics', 'Distributions, hypothesis testing, and confidence intervals.', 'STATISTICS'],
    ['Advanced SQL & Window Functions', 'PARTITION BY, RANK, CTEs, and query performance tuning.', 'DATABASE'],
    ['Automated ETL Pipeline Engineering', 'Data extraction, schema validation, and transformation logic.', 'DATA_PIPELINES'],
    ['Data Visualization & Storytelling', 'Constructing interactive dashboards and KPI monitoring.', 'ANALYTICS'],
    ['Distributed Processing with PySpark', 'RDDs, DataFrames, and parallel cluster execution.', 'BIG_DATA'],
    ['Real-Time Event Streaming (Kafka)', 'Pub/sub streaming architecture and consumer groups.', 'STREAMING'],
    ['Snowflake Analytics', 'Cloud-native SQL warehousing and data sharing.', 'DATABASE'],
    ['Databricks Lakehouse', 'Unified analytics on Apache Spark and Delta Lake.', 'BIG_DATA']
  ];

  const dataIds = new Map<string, string>();
  for (const [name, description, category] of dataSkills) {
    const result = await query<{ id: string }>(
      `
      INSERT INTO skills (role_id, name, description, category)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (role_id, name)
      DO UPDATE SET description = EXCLUDED.description,
                    category = EXCLUDED.category
      RETURNING id
      `,
      [dataRoleId, name, description, category]
    );
    dataIds.set(name, result.rows[0].id);
  }

  const dataEdges: [string, string][] = [
    ['Advanced SQL & Window Functions', 'Probability & Descriptive Statistics'],
    ['Automated ETL Pipeline Engineering', 'Advanced SQL & Window Functions'],
    ['Data Visualization & Storytelling', 'Advanced SQL & Window Functions'],
    ['Distributed Processing with PySpark', 'Automated ETL Pipeline Engineering'],
    ['Real-Time Event Streaming (Kafka)', 'Distributed Processing with PySpark']
  ];

  for (const [skill, prerequisite] of dataEdges) {
    await query(
      `
      INSERT INTO skill_prerequisites (skill_id, prerequisite_skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [dataIds.get(skill), dataIds.get(prerequisite)]
    );
  }

  const dataBranch = await query<{ id: string }>(
    `
    INSERT INTO technology_branches (role_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (role_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      dataRoleId,
      'Modern Data Warehouse Platform',
      'Choose between Snowflake and Databricks.'
    ]
  );
  const dataBranchId = dataBranch.rows[0].id;
  for (const skill of ['Snowflake Analytics', 'Databricks Lakehouse']) {
    await query(
      `
      INSERT INTO technology_branch_options (branch_id, skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [dataBranchId, dataIds.get(skill)]
    );
  }

  // 11. FULL-STACK WEB DOMAIN & ROLE
  const fullstackDomain = await query<{ id: string }>(
    `
    INSERT INTO domains (name, description, demand_level)
    VALUES ($1, $2, $3)
    ON CONFLICT (name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      'Full-Stack Web Architecture',
      'Building rich frontend interfaces and connecting them to distributed backend APIs.',
      'HIGH'
    ]
  );
  const fullstackDomainId = fullstackDomain.rows[0].id;

  const fullstackRole = await query<{ id: string }>(
    `
    INSERT INTO roles (domain_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (domain_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      fullstackDomainId,
      'Full-Stack Web Architect',
      'Build rich user interfaces with React and connect them to performant distributed backend services.'
    ]
  );
  const fullstackRoleId = fullstackRole.rows[0].id;

  const fullstackSkills: SkillSeed[] = [
    ['Semantic HTML5 & Modern CSS3', 'Document hierarchy, Flexbox, Grid layouts, and responsive queries.', 'WEB'],
    ['TypeScript & Type Safety', 'Interfaces, generics, union types, and compiler configuration.', 'PROGRAMMING'],
    ['React Component Architecture & Hooks', 'Custom hooks, state management, and virtual DOM efficiency.', 'FRONTEND'],
    ['Backend API Integration (Node/Express)', 'Route controllers, middleware chains, and validation.', 'BACKEND'],
    ['Server-Side Rendering (Next.js)', 'Server components, static site generation, and SEO.', 'FULLSTACK'],
    ['Automated Testing & End-to-End', 'Unit testing with Jest/Vitest and React Testing Library.', 'TESTING'],
    ['Zustand Minimal State', 'Lightweight and scalable client-side state management.', 'FRONTEND'],
    ['Redux Toolkit Enterprise', 'Predictable, centralized enterprise application state management.', 'FRONTEND']
  ];

  const fullstackIds = new Map<string, string>();
  for (const [name, description, category] of fullstackSkills) {
    const result = await query<{ id: string }>(
      `
      INSERT INTO skills (role_id, name, description, category)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (role_id, name)
      DO UPDATE SET description = EXCLUDED.description,
                    category = EXCLUDED.category
      RETURNING id
      `,
      [fullstackRoleId, name, description, category]
    );
    fullstackIds.set(name, result.rows[0].id);
  }

  const fullstackEdges: [string, string][] = [
    ['TypeScript & Type Safety', 'Semantic HTML5 & Modern CSS3'],
    ['React Component Architecture & Hooks', 'TypeScript & Type Safety'],
    ['Backend API Integration (Node/Express)', 'TypeScript & Type Safety'],
    ['Server-Side Rendering (Next.js)', 'React Component Architecture & Hooks'],
    ['Automated Testing & End-to-End', 'Server-Side Rendering (Next.js)']
  ];

  for (const [skill, prerequisite] of fullstackEdges) {
    await query(
      `
      INSERT INTO skill_prerequisites (skill_id, prerequisite_skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [fullstackIds.get(skill), fullstackIds.get(prerequisite)]
    );
  }

  const fullstackBranch = await query<{ id: string }>(
    `
    INSERT INTO technology_branches (role_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (role_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      fullstackRoleId,
      'Client State Architecture',
      'Choose between Zustand and Redux Toolkit.'
    ]
  );
  const fullstackBranchId = fullstackBranch.rows[0].id;
  for (const skill of ['Zustand Minimal State', 'Redux Toolkit Enterprise']) {
    await query(
      `
      INSERT INTO technology_branch_options (branch_id, skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [fullstackBranchId, fullstackIds.get(skill)]
    );
  }

  // 12. CYBERSECURITY DOMAIN & ROLE
  const securityDomain = await query<{ id: string }>(
    `
    INSERT INTO domains (name, description, demand_level)
    VALUES ($1, $2, $3)
    ON CONFLICT (name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      'Cybersecurity & Defensive Systems',
      'Analyzing vulnerabilities, zero-trust authentication, and hardening enterprise systems.',
      'CRITICAL'
    ]
  );
  const securityDomainId = securityDomain.rows[0].id;

  const securityRole = await query<{ id: string }>(
    `
    INSERT INTO roles (domain_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (domain_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      securityDomainId,
      'Cybersecurity & Defensive Specialist',
      'Analyze network vulnerabilities, implement zero-trust authentication protocols, and harden enterprise applications.'
    ]
  );
  const securityRoleId = securityRole.rows[0].id;

  const securitySkills: SkillSeed[] = [
    ['Network Protocol & Packet Analysis', 'Packet sniffing with Wireshark, TCP handshakes, and port scanning.', 'NETWORKING'],
    ['Applied Cryptography Fundamentals', 'Symmetric/asymmetric encryption, hashing, and PKI infrastructure.', 'CRYPTOGRAPHY'],
    ['Web Application Security (OWASP Top 10)', 'Remediating SQL injections, XSS vulnerabilities, and CSRF.', 'APPSEC'],
    ['Identity & Access Management (OAuth/JWT)', 'Token validation, refresh rotation, and OAuth flows.', 'AUTH'],
    ['Defensive SIEM & Threat Monitoring', 'Log ingestion, alert triage, and intrusion detection.', 'OPERATIONS'],
    ['Zero-Trust Architecture & Hardening', 'Least privilege enforcement, kernel hardening, and compliance.', 'ENTERPRISE'],
    ['Cloud Security Posture (CSPM)', 'Evaluating cloud asset misconfigurations and identity policies.', 'SECURITY'],
    ['Digital Forensics & Incident Response', 'Memory dump analysis, artifact recovery, and incident containment.', 'SECURITY']
  ];

  const securityIds = new Map<string, string>();
  for (const [name, description, category] of securitySkills) {
    const result = await query<{ id: string }>(
      `
      INSERT INTO skills (role_id, name, description, category)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (role_id, name)
      DO UPDATE SET description = EXCLUDED.description,
                    category = EXCLUDED.category
      RETURNING id
      `,
      [securityRoleId, name, description, category]
    );
    securityIds.set(name, result.rows[0].id);
  }

  const securityEdges: [string, string][] = [
    ['Applied Cryptography Fundamentals', 'Network Protocol & Packet Analysis'],
    ['Web Application Security (OWASP Top 10)', 'Network Protocol & Packet Analysis'],
    ['Identity & Access Management (OAuth/JWT)', 'Applied Cryptography Fundamentals'],
    ['Defensive SIEM & Threat Monitoring', 'Web Application Security (OWASP Top 10)'],
    ['Zero-Trust Architecture & Hardening', 'Identity & Access Management (OAuth/JWT)']
  ];

  for (const [skill, prerequisite] of securityEdges) {
    await query(
      `
      INSERT INTO skill_prerequisites (skill_id, prerequisite_skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [securityIds.get(skill), securityIds.get(prerequisite)]
    );
  }

  const securityBranch = await query<{ id: string }>(
    `
    INSERT INTO technology_branches (role_id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (role_id, name)
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `,
    [
      securityRoleId,
      'Defensive Security Specialization',
      'Choose between Cloud Security Posture and Incident Response.'
    ]
  );
  const securityBranchId = securityBranch.rows[0].id;
  for (const skill of ['Cloud Security Posture (CSPM)', 'Digital Forensics & Incident Response']) {
    await query(
      `
      INSERT INTO technology_branch_options (branch_id, skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [securityBranchId, securityIds.get(skill)]
    );
  }

  console.log('✅ Seeded all 6 career domains, roles, skills, and prerequisite graphs successfully!');
}

export { seedSkillGraph };

if (require.main === module) {
  seedSkillGraph().catch((error) => {
    console.error('❌ Skill Graph seed failed:', error);
    process.exit(1);
  });
}