import { query } from '../../database/db';
import { inMemorySkillStates, memoryStore } from '../../database/store';

const levelValue: Record<string, number> = {
  AWARENESS: 1,
  BEGINNER: 2,
  INTERMEDIATE: 3,
  PROFICIENT: 4,
  EXPERT: 5,
};

function getRolePhaseMeta(roleName: string, phaseNum: number) {
  const slug = (roleName || '').toLowerCase();

  if (slug.includes('machine') || slug.includes('ml') || slug.includes('ai')) {
    switch (phaseNum) {
      case 1: return { title: 'Phase 1: Mathematical Foundations & Programming', description: 'Establish core mathematical rigor across linear algebra, probability, statistics, and scientific Python programming.', learning_outcome: 'Manipulate high-dimensional tensors, formulate statistical models, and collaborate with Git version control.' };
      case 2: return { title: 'Phase 2: Data Engineering & Exploratory Analysis', description: 'Perform tabular data engineering with Pandas/NumPy, relational data queries with SQL, and diagnostic visualization.', learning_outcome: 'Clean, preprocess, and extract high-signal predictive features from production datasets.' };
      case 3: return { title: 'Phase 3: Classical Machine Learning & Validation', description: 'Train supervised and unsupervised learning algorithms with rigorous cross-validation and hyperparameter optimization.', learning_outcome: 'Train calibrated Scikit-Learn models, prevent data leakage, and establish robust baseline metrics.' };
      case 4: return { title: 'Phase 4: Deep Learning Framework Specialization', description: 'Specialize in your selected deep learning framework to construct neural architectures, loss functions, and embeddings.', learning_outcome: 'Implement deep neural networks and custom training loops in production.' };
      default: return { title: 'Phase 5: MLOps, Model Serving & Applied AI', description: 'Package models into inference microservices, track experiments, and implement computer vision/NLP pipelines.', learning_outcome: 'Deploy, monitor, and scale high-throughput AI services in cloud production environments.' };
    }
  }

  if (slug.includes('cloud') || slug.includes('devops')) {
    switch (phaseNum) {
      case 1:
        return {
          title: 'Phase 1: Operating Systems & Computer Networking',
          description: 'Master Linux systems administration, shell scripting, TCP/IP fundamentals, and DNS configuration.',
          learning_outcome: 'Automate server tasks with Bash scripts, troubleshoot network packet drops, and configure secure SSH tunnels.'
        };
      case 2:
        return {
          title: 'Phase 2: Containerization & Modern Workload Packaging',
          description: 'Package microservices into optimized Docker images, write multi-stage Dockerfiles, and compose multi-container setups.',
          learning_outcome: 'Build minimal container images, manage storage volumes, and isolate virtual networks.'
        };
      case 3:
        return {
          title: 'Phase 3: Automated CI/CD Delivery Pipelines',
          description: 'Configure continuous integration pipelines with automated testing, linting, and artifact repository releases.',
          learning_outcome: 'Implement GitHub Actions workflows with branch protections, secret vaulting, and automatic rollbacks.'
        };
      case 4:
        return {
          title: 'Phase 4: Kubernetes Orchestration & Cluster Management',
          description: 'Deploy resilient container workloads using Kubernetes Pods, Deployments, Services, and Ingress Controllers.',
          learning_outcome: 'Architect zero-downtime rolling deployments, manage ConfigMaps, and configure Horizontal Pod Autoscaling.'
        };
      case 5:
      default:
        return {
          title: 'Phase 5: Infrastructure as Code (Terraform) & Cloud SRE',
          description: 'Provision reproducible cloud infrastructure using declarative Terraform state and maintain site reliability metrics.',
          learning_outcome: 'Manage cloud VPC networks, enforce immutable infrastructure, and monitor Prometheus/Grafana alerts.'
        };
    }
  }

  if (slug.includes('data') || slug.includes('analytics')) {
    switch (phaseNum) {
      case 1:
        return {
          title: 'Phase 1: Statistical Foundations & Relational Data',
          description: 'Master probability, descriptive statistics, hypothesis testing, and advanced relational SQL queries.',
          learning_outcome: 'Execute analytical queries with window functions, subqueries, and calculate statistical confidence intervals.'
        };
      case 2:
        return {
          title: 'Phase 2: Automated Data Wrangling & Pipelines',
          description: 'Design robust ETL pipelines for structured and semi-structured datasets using Python and SQL engines.',
          learning_outcome: 'Clean noisy raw telemetry, handle schema drift, and persist curated datasets into data warehouses.'
        };
      case 3:
        return {
          title: 'Phase 3: Exploratory Visualization & Storytelling',
          description: 'Synthesize raw metrics into impactful executive dashboards and interactive visual analytics.',
          learning_outcome: 'Communicate data-driven decisions and identify actionable business growth trends.'
        };
      case 4:
        return {
          title: 'Phase 4: Distributed Big Data Processing (PySpark)',
          description: 'Orchestrate high-volume distributed compute jobs across multi-node clusters using Apache Spark.',
          learning_outcome: 'Process terabyte-scale datasets with Spark DataFrames, partitioning, and resilient distributed datasets.'
        };
      case 5:
      default:
        return {
          title: 'Phase 5: Real-Time Event Streaming & Data Lakehouse',
          description: 'Build low-latency streaming architectures using Apache Kafka and modern cloud data lakes.',
          learning_outcome: 'Ingest continuous real-time data streams and query analytical lakehouse architectures with sub-second latency.'
        };
    }
  }

  if (slug.includes('full') || slug.includes('stack') || slug.includes('web')) {
    switch (phaseNum) {
      case 1:
        return {
          title: 'Phase 1: Semantic Web & Modern CSS3 Standards',
          description: 'Master accessible semantic HTML5 markup, responsive layouts with Flexbox and CSS Grid, and design systems.',
          learning_outcome: 'Construct responsive web interfaces with full mobile support and WCAG accessibility standards.'
        };
      case 2:
        return {
          title: 'Phase 2: TypeScript & Strong Type Safety',
          description: 'Leverage static typing, generics, interfaces, and compiler configurations for enterprise application logic.',
          learning_outcome: 'Eliminate runtime null pointer errors and maintain modular type-safe codebases.'
        };
      case 3:
        return {
          title: 'Phase 3: React Component Architecture & Hooks',
          description: 'Develop declarative frontend components with modern React hooks, state management, and optimized virtual DOM rendering.',
          learning_outcome: 'Build modular, reusable user interfaces with robust local and global state handling.'
        };
      case 4:
        return {
          title: 'Phase 4: Server-Side Rendering & Next.js Framework',
          description: 'Implement full-stack React applications using Next.js App Router, Server Actions, and API route handlers.',
          learning_outcome: 'Optimize Core Web Vitals, server-side caching, and search engine indexability.'
        };
      case 5:
      default:
        return {
          title: 'Phase 5: Full-Stack Integration, Testing & Cloud Deployment',
          description: 'Connect frontend clients to Node.js backend services, secure authentication flows, and run automated end-to-end tests.',
          learning_outcome: 'Ship tested full-stack web applications with continuous deployment pipelines.'
        };
    }
  }

  if (slug.includes('security') || slug.includes('cyber')) {
    switch (phaseNum) {
      case 1:
        return {
          title: 'Phase 1: Network Protocol & Packet Inspection',
          description: 'Analyze TCP/IP packet handshakes, DNS queries, routing tables, and Wireshark network captures.',
          learning_outcome: 'Detect anomalous network traffic, inspect TLS handshakes, and identify spoofed packet headers.'
        };
      case 2:
        return {
          title: 'Phase 2: Applied Cryptography Fundamentals',
          description: 'Implement symmetric and asymmetric encryption algorithms, hashing functions, and digital signatures.',
          learning_outcome: 'Secure data in transit and at rest using AES-256, RSA/ECC public key cryptography, and HMAC digests.'
        };
      case 3:
        return {
          title: 'Phase 3: Web Application Security (OWASP Top 10)',
          description: 'Audit and harden server endpoints against injection attacks, cross-site scripting (XSS), and broken access controls.',
          learning_outcome: 'Sanitize input surfaces, enforce Content Security Policies (CSP), and remediate web vulnerabilities.'
        };
      case 4:
        return {
          title: 'Phase 4: Identity & Access Management (OAuth2 & JWT)',
          description: 'Architect centralized authentication, role-based access control (RBAC), and token revocation workflows.',
          learning_outcome: 'Prevent unauthorized resource access with hardened token expiration and claims validation.'
        };
      case 5:
      default:
        return {
          title: 'Phase 5: Defensive SIEM & Zero-Trust Hardening',
          description: 'Monitor enterprise audit logs, configure Security Information & Event Management alerts, and enforce Zero Trust.',
          learning_outcome: 'Investigate security incidents, contain compromised nodes, and maintain strict least-privilege security postures.'
        };
    }
  }

  // Backend Developer & General Systems
  switch (phaseNum) {
    case 1: return { title: 'Phase 1: Foundations & Core Logic', description: 'Master programming fundamentals, language syntax, and distributed version control workflows.', learning_outcome: 'Write modular code, implement structured algorithms, and collaborate with Git repositories.' };
    case 2: return { title: 'Phase 2: Data Persistence & Web Architecture', description: 'Construct relational schemas, write optimal SQL queries, and implement HTTP/REST communication protocols.', learning_outcome: 'Design normalized database schemas, query tables, and consume robust web endpoints.' };
    case 3: return { title: 'Phase 3: APIs, Authentication & Testing', description: 'Implement enterprise authentication mechanisms, API security controls, and automated test suites.', learning_outcome: 'Build hardened server-side endpoints with high automated test coverage.' };
    case 4: return { title: 'Phase 4: Framework Specialization & Distributed Systems', description: 'Select your core web framework track and master caching and messaging patterns.', learning_outcome: 'Architect production-ready microservices using modern backend frameworks.' };
    default: return { title: 'Phase 5: DevOps, Containerization & Cloud Deployment', description: 'Automate delivery pipelines, containerize microservices, and ensure resilient cloud deployment.', learning_outcome: 'Deploy scalable, monitored cloud architectures with continuous delivery pipelines.' };
  }
}

const FALLBACK_ROADMAPS: Record<string, any> = {
  'role-backend': {
    role_name: 'Modern Backend & Distributed Systems',
    skills: [
      { id: 'skill-prog-fund', name: 'Programming Fundamentals', category: 'FOUNDATION', assessed_level: 'PROFICIENT', target_level: 'PROFICIENT' },
      { id: 'skill-git', name: 'Git & GitHub', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-http', name: 'HTTP & Web Architecture', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-rest', name: 'REST API Design', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-sql', name: 'SQL & Relational Databases', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' },
      { id: 'skill-db-design', name: 'Database Architecture & Normalization', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-auth', name: 'Authentication & JWT Security', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-python', name: 'Python / Node.js Core Logic', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-docker', name: 'Docker Containerization', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-cicd', name: 'CI/CD Pipeline Automation', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
    ],
    prerequisites: [
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-prog-fund' },
      { skill_id: 'skill-http', prerequisite_skill_id: 'skill-prog-fund' },
      { skill_id: 'skill-rest', prerequisite_skill_id: 'skill-http' },
      { skill_id: 'skill-sql', prerequisite_skill_id: 'skill-prog-fund' },
      { skill_id: 'skill-db-design', prerequisite_skill_id: 'skill-sql' },
      { skill_id: 'skill-auth', prerequisite_skill_id: 'skill-rest' },
      { skill_id: 'skill-python', prerequisite_skill_id: 'skill-prog-fund' },
      { skill_id: 'skill-docker', prerequisite_skill_id: 'skill-rest' },
      { skill_id: 'skill-cicd', prerequisite_skill_id: 'skill-docker' }
    ],
    branches: [
      {
        id: 'branch-backend-framework',
        name: 'Backend Web Framework',
        description: 'Choose between FastAPI (Modern Python) and Express (Node.js)',
        options: [
          { branch_id: 'branch-backend-framework', option_id: 'opt-fastapi', name: 'FastAPI', skill_id: 'skill-fastapi' },
          { branch_id: 'branch-backend-framework', option_id: 'opt-express', name: 'Express / NestJS', skill_id: 'skill-express' }
        ]
      }
    ]
  },
  'role-ml': {
    role_name: 'Machine Learning & Applied AI',
    skills: [
      { id: 'skill-python', name: 'Python Programming', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-git', name: 'Git & Collaboration', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-numpy', name: 'NumPy & Array Mathematics', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-pandas', name: 'Pandas & Data Wrangling', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-stats', name: 'Probability & Statistics', category: 'MATHEMATICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-linalg', name: 'Linear Algebra & Tensors', category: 'MATHEMATICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-ml-fund', name: 'Supervised & Unsupervised ML', category: 'MACHINE_LEARNING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-scikit', name: 'Scikit-Learn Modeling', category: 'MACHINE_LEARNING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
    ],
    prerequisites: [
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-numpy', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-pandas', prerequisite_skill_id: 'skill-numpy' },
      { skill_id: 'skill-stats', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-linalg', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-ml-fund', prerequisite_skill_id: 'skill-pandas' },
      { skill_id: 'skill-scikit', prerequisite_skill_id: 'skill-ml-fund' }
    ],
    branches: [
      {
        id: 'branch-dl-framework',
        name: 'Deep Learning Framework Specialization',
        description: 'Choose between PyTorch and TensorFlow for deep neural networks',
        options: [
          { branch_id: 'branch-dl-framework', option_id: 'opt-pytorch', name: 'PyTorch', skill_id: 'skill-pytorch' },
          { branch_id: 'branch-dl-framework', option_id: 'opt-tf', name: 'TensorFlow / Keras', skill_id: 'skill-tf' }
        ]
      }
    ]
  },
  'role-cloud': {
    role_name: 'Cloud Native & DevOps Engineering',
    skills: [
      { id: 'skill-linux', name: 'Linux Administration & Shell', category: 'FOUNDATION', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-git', name: 'Git & Trunk-Based Development', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-networking', name: 'Networking & DNS Architecture', category: 'FOUNDATION', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' },
      { id: 'skill-docker', name: 'Docker & Image Security', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-cicd', name: 'GitHub Actions & CI/CD', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-k8s', name: 'Kubernetes Workload Orchestration', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-iac', name: 'Infrastructure as Code (Terraform)', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-monitoring', name: 'Prometheus & Grafana Observability', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' }
    ],
    prerequisites: [
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-linux' },
      { skill_id: 'skill-networking', prerequisite_skill_id: 'skill-linux' },
      { skill_id: 'skill-docker', prerequisite_skill_id: 'skill-linux' },
      { skill_id: 'skill-cicd', prerequisite_skill_id: 'skill-git' },
      { skill_id: 'skill-k8s', prerequisite_skill_id: 'skill-docker' },
      { skill_id: 'skill-iac', prerequisite_skill_id: 'skill-docker' },
      { skill_id: 'skill-monitoring', prerequisite_skill_id: 'skill-k8s' }
    ],
    branches: [
      {
        id: 'branch-cloud-provider',
        name: 'Primary Cloud Infrastructure Track',
        description: 'Select your primary target cloud certification platform',
        options: [
          { branch_id: 'branch-cloud-provider', option_id: 'opt-aws', name: 'Amazon Web Services (AWS)', skill_id: 'skill-aws' },
          { branch_id: 'branch-cloud-provider', option_id: 'opt-gcp', name: 'Google Cloud Platform (GCP)', skill_id: 'skill-gcp' }
        ]
      }
    ]
  },
  'role-fullstack': {
    role_name: 'Full-Stack Web Architecture',
    skills: [
      { id: 'skill-html-css', name: 'Semantic HTML5 & Modern CSS', category: 'FOUNDATION', assessed_level: 'PROFICIENT', target_level: 'PROFICIENT' },
      { id: 'skill-js-ts', name: 'Modern TypeScript & ES6+', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-git', name: 'Git & Feature Branching', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-react', name: 'React Architecture & State Hooks', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-rest-node', name: 'REST APIs & Node.js Server Logic', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-sql', name: 'Relational Database Schema & ORMs', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' },
      { id: 'skill-auth-full', name: 'Session & JWT Authentication', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-e2e', name: 'Automated Testing (Jest & Cypress)', category: 'QUALITY', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' }
    ],
    prerequisites: [
      { skill_id: 'skill-js-ts', prerequisite_skill_id: 'skill-html-css' },
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-js-ts' },
      { skill_id: 'skill-react', prerequisite_skill_id: 'skill-js-ts' },
      { skill_id: 'skill-rest-node', prerequisite_skill_id: 'skill-js-ts' },
      { skill_id: 'skill-sql', prerequisite_skill_id: 'skill-rest-node' },
      { skill_id: 'skill-auth-full', prerequisite_skill_id: 'skill-rest-node' },
      { skill_id: 'skill-e2e', prerequisite_skill_id: 'skill-react' }
    ],
    branches: [
      {
        id: 'branch-frontend-framework',
        name: 'Full-Stack Application Framework',
        description: 'Choose between Next.js React Framework and Vite SPA Architecture',
        options: [
          { branch_id: 'branch-frontend-framework', option_id: 'opt-nextjs', name: 'Next.js App Router', skill_id: 'skill-nextjs' },
          { branch_id: 'branch-frontend-framework', option_id: 'opt-vite', name: 'React + Vite + Express', skill_id: 'skill-vite' }
        ]
      }
    ]
  },
  'role-data': {
    role_name: 'Data Science & Big Data Engineering',
    skills: [
      { id: 'skill-python-data', name: 'Python for Scientific Computing', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-git', name: 'Git & Notebook Versioning', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-sql-adv', name: 'Advanced SQL & Window Functions', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-pandas-clean', name: 'Data Wrangling with Pandas', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-eda', name: 'Exploratory Analysis & Visualization', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' },
      { id: 'skill-etl', name: 'Automated ETL Pipeline Design', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-warehouse', name: 'Data Warehousing & OLAP Schemas', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' }
    ],
    prerequisites: [
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-python-data' },
      { skill_id: 'skill-sql-adv', prerequisite_skill_id: 'skill-python-data' },
      { skill_id: 'skill-pandas-clean', prerequisite_skill_id: 'skill-python-data' },
      { skill_id: 'skill-eda', prerequisite_skill_id: 'skill-pandas-clean' },
      { skill_id: 'skill-etl', prerequisite_skill_id: 'skill-pandas-clean' },
      { skill_id: 'skill-warehouse', prerequisite_skill_id: 'skill-sql-adv' }
    ],
    branches: [
      {
        id: 'branch-data-engine',
        name: 'Distributed Big Data Engine',
        description: 'Choose between Batch Spark Analytics and Event-Driven Kafka Streaming',
        options: [
          { branch_id: 'branch-data-engine', option_id: 'opt-spark', name: 'Apache Spark & PySpark', skill_id: 'skill-spark' },
          { branch_id: 'branch-data-engine', option_id: 'opt-kafka', name: 'Apache Kafka Event Streams', skill_id: 'skill-kafka' }
        ]
      }
    ]
  },
  'role-security': {
    role_name: 'Cybersecurity & Defensive Systems',
    skills: [
      { id: 'skill-net-sec', name: 'Computer Networking & Protocols', category: 'FOUNDATION', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-linux-hard', name: 'Linux System Hardening', category: 'FOUNDATION', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-crypto-sec', name: 'Applied Cryptography & SSL/TLS', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-owasp-sec', name: 'Web Security & OWASP Top 10', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-iam-sec', name: 'Identity & Access Management (OAuth)', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-vuln-audit', name: 'Vulnerability Assessment & Pen-Testing', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' },
      { id: 'skill-siem-audit', name: 'Threat Detection & SIEM Monitoring', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' }
    ],
    prerequisites: [
      { skill_id: 'skill-linux-hard', prerequisite_skill_id: 'skill-net-sec' },
      { skill_id: 'skill-crypto-sec', prerequisite_skill_id: 'skill-net-sec' },
      { skill_id: 'skill-owasp-sec', prerequisite_skill_id: 'skill-net-sec' },
      { skill_id: 'skill-iam-sec', prerequisite_skill_id: 'skill-owasp-sec' },
      { skill_id: 'skill-vuln-audit', prerequisite_skill_id: 'skill-owasp-sec' },
      { skill_id: 'skill-siem-audit', prerequisite_skill_id: 'skill-vuln-audit' }
    ],
    branches: [
      {
        id: 'branch-sec-track',
        name: 'Cybersecurity Specialization Track',
        description: 'Choose between Blue Team Defensive Operations and Application Security Engineering',
        options: [
          { branch_id: 'branch-sec-track', option_id: 'opt-appsec', name: 'Application Security (DevSecOps)', skill_id: 'skill-appsec' },
          { branch_id: 'branch-sec-track', option_id: 'opt-soc', name: 'SOC Analysis & Incident Response', skill_id: 'skill-soc' }
        ]
      }
    ]
  }
};

export async function generatePersonalizedRoadmap(
  studentId: string,
  roleId: string
) {
  let roleName = 'Career Role';
  let skills: any[] = [];
  let prerequisiteRows: { skill_id: string; prerequisite_skill_id: string }[] = [];
  let branchOptions: any[] = [];
  let branchesCount = 0;
  let selectedBranchId: string | null = null;
  let validRoleId = roleId;

  // 0. Check student profile for uploaded resume (Calibrate ONLY if resume provided)
  let studentProfile = memoryStore.profiles.get(studentId) || Array.from(memoryStore.profiles.values()).find(p => p.id === studentId || p.user_id === studentId);
  if (!studentProfile) {
    try {
      const pRes = await query<any>(
        `SELECT id, user_id, resume_matched_role, parsed_skills, resume_parsed_data, resume_filename FROM student_profiles WHERE id::text = $1 OR user_id::text = $1 LIMIT 1`,
        [studentId]
      );
      if (pRes.rows.length > 0) studentProfile = pRes.rows[0];
    } catch {
      // Non-blocking
    }
  }

  const hasResume = !!(studentProfile?.resume_filename || studentProfile?.resume_matched_role || (studentProfile?.parsed_skills && studentProfile.parsed_skills.length > 0));
  const resumeSkills: string[] = studentProfile?.parsed_skills || studentProfile?.resume_parsed_data?.extractedSkills || [];

  // If roleId not explicitly set or generic, default to student's resume matched role if available
  if ((!validRoleId || validRoleId === 'default' || validRoleId === 'role-backend') && studentProfile?.resume_matched_role) {
    validRoleId = studentProfile.resume_matched_role;
  }

  const isUUID = (s: string) =>
    typeof s === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());

  try {
    // 1. Resolve role ID to database UUID if necessary
    if (!isUUID(validRoleId)) {
      const slug = validRoleId.toLowerCase();
      let roleSearch = '%backend%';
      if (slug.includes('ml') || slug.includes('machine') || slug.includes('ai')) roleSearch = '%machine%';
      else if (slug.includes('cloud') || slug.includes('devops')) roleSearch = '%cloud%';
      else if (slug.includes('data')) roleSearch = '%data%';
      else if (slug.includes('fullstack') || slug.includes('full-stack')) roleSearch = '%full-stack%';
      else if (slug.includes('security') || slug.includes('cyber')) roleSearch = '%cybersecurity%';

      const found = await query<{ id: string }>(
        `SELECT id FROM roles WHERE LOWER(name) LIKE $1 LIMIT 1`,
        [roleSearch]
      ).catch(() => ({ rows: [] as any[] }));
      if (found.rows.length > 0) validRoleId = found.rows[0].id;
    }

    // 2. Fetch role metadata
    const roleResult = await query<{ name: string }>(
      `SELECT name FROM roles WHERE id = $1`,
      [validRoleId]
    );

    if (roleResult.rows.length > 0) {
      roleName = roleResult.rows[0].name;

      // 3. Fetch all skills for the role merged with student's current skill states
      const skillsResult = await query<{
        id: string;
        name: string;
        category: string | null;
        assessed_level: string | null;
        target_level: string | null;
        accuracy: number | null;
      }>(
        `
        SELECT
          s.id,
          s.name,
          s.category,
          COALESCE(ss.assessed_level, 'AWARENESS') AS assessed_level,
          COALESCE(ss.target_level, 'PROFICIENT') AS target_level,
          ss.accuracy
        FROM skills s
        LEFT JOIN student_skill_states ss
          ON ss.skill_id = s.id
          AND ss.student_id = $1
        WHERE s.role_id = $2
        ORDER BY s.name
        `,
        [studentId, validRoleId]
      );

      skills = skillsResult.rows;

      // Merge in-memory test states if student recently completed diagnostic
      for (const skill of skills) {
        const memKey = `${studentId}:${skill.id}`;
        const mem = inMemorySkillStates.get(memKey);
        if (mem && mem.assessed_level) {
          const memVal = levelValue[mem.assessed_level] || 1;
          const curVal = levelValue[skill.assessed_level || 'AWARENESS'] || 1;
          if (memVal > curVal) {
            skill.assessed_level = mem.assessed_level;
            if (mem.accuracy !== undefined) skill.accuracy = mem.accuracy;
          }
        }
      }

      // 4. Fetch prerequisite edges
      const edgesResult = await query<{
        skill_id: string;
        prerequisite_skill_id: string;
      }>(
        `
        SELECT sp.skill_id, sp.prerequisite_skill_id
        FROM skill_prerequisites sp
        JOIN skills s ON s.id = sp.skill_id
        WHERE s.role_id = $1
        `,
        [validRoleId]
      );
      prerequisiteRows = edgesResult.rows;

      // 5. Fetch technology branches and options
      const branchesResult = await query<{
        branch_id: string;
        branch_name: string;
        branch_description: string;
        option_id: string;
        skill_id: string;
        skill_name: string;
      }>(
        `
        SELECT
          tb.id AS branch_id,
          tb.name AS branch_name,
          tb.description AS branch_description,
          tbo.id AS option_id,
          tbo.skill_id,
          s.name AS skill_name
        FROM technology_branches tb
        JOIN technology_branch_options tbo ON tbo.branch_id = tb.id
        JOIN skills s ON s.id = tbo.skill_id
        WHERE tb.role_id = $1
        `,
        [validRoleId]
      );

      branchesCount = branchesResult.rows.length;
      if (branchesCount > 0) {
        branchOptions = branchesResult.rows.map(row => ({
          branch_id: row.branch_id,
          option_id: row.option_id,
          name: row.skill_name,
          description: row.branch_description || `Specialize in ${row.skill_name}`,
          skill_id: row.skill_id
        }));
      }

      // Check if student has already chosen a branch
      const savedState = await query<{ selected_branch_id: string }>(
        `SELECT selected_branch_id FROM roadmap_states WHERE student_id = $1 AND role_id = $2 LIMIT 1`,
        [studentId, validRoleId]
      ).catch(() => ({ rows: [] as any[] }));
      selectedBranchId = savedState.rows[0]?.selected_branch_id || null;
    }
  } catch (err) {
    console.warn('[Roadmap Service] Database query fallback:', err);
  }

  // Fallback data if skills empty
  if (skills.length === 0) {
    let fallbackKey = 'role-backend';
    const slug = (validRoleId || '').toLowerCase();
    if (slug.includes('ml') || slug.includes('machine') || slug.includes('ai')) fallbackKey = 'role-ml';
    else if (slug.includes('cloud') || slug.includes('devops')) fallbackKey = 'role-cloud';
    else if (slug.includes('data') || slug.includes('analytics')) fallbackKey = 'role-data';
    else if (slug.includes('full') || slug.includes('stack') || slug.includes('web')) fallbackKey = 'role-fullstack';
    else if (slug.includes('security') || slug.includes('cyber')) fallbackKey = 'role-security';
    else if (FALLBACK_ROADMAPS[validRoleId]) fallbackKey = validRoleId;

    const fallback = FALLBACK_ROADMAPS[fallbackKey] || FALLBACK_ROADMAPS['role-backend'];
    roleName = fallback.role_name;
    skills = fallback.skills.map((s: any) => ({ ...s }));
    prerequisiteRows = fallback.prerequisites;
    branchesCount = fallback.branches.length;
    branchOptions = fallback.branches[0]?.options || [];
  }

  // CALIBRATE SKILLS FROM RESUME: Only if resume is provided!
  if (hasResume && resumeSkills.length > 0) {
    for (const skill of skills) {
      const sName = skill.name.toLowerCase();
      const isMatchedInResume = resumeSkills.some((rSkill: string) => {
        const rLower = (rSkill || '').toLowerCase().trim();
        return rLower.length > 1 && (sName.includes(rLower) || rLower.includes(sName));
      });

      if (isMatchedInResume) {
        skill.assessed_level = 'PROFICIENT';
        skill.accuracy = 85;
        skill.verified_by_resume = true;
      }
    }
  }

  // Build DAG for full topological ordering across all skills
  const prereqsOf = new Map<string, Set<string>>();
  const dependentsOf = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const skill of skills) {
    prereqsOf.set(skill.id, new Set());
    dependentsOf.set(skill.id, []);
    inDegree.set(skill.id, 0);
  }

  const allSkillIds = new Set(skills.map(s => s.id));

  for (const edge of prerequisiteRows) {
    if (allSkillIds.has(edge.skill_id) && allSkillIds.has(edge.prerequisite_skill_id)) {
      prereqsOf.get(edge.skill_id)!.add(edge.prerequisite_skill_id);
      dependentsOf.get(edge.prerequisite_skill_id)!.push(edge.skill_id);
      inDegree.set(edge.skill_id, (inDegree.get(edge.skill_id) || 0) + 1);
    }
  }

const categoryWeight: Record<string, number> = {
  FOUNDATION: 10,
  MATHEMATICS: 10,
  TOOLS: 15,
  PROGRAMMING: 20,
  DATA: 25,
  WEB: 30,
  DATABASE: 35,
  FRAMEWORK: 40,
  MACHINE_LEARNING: 45,
  QUALITY: 50,
  SECURITY: 60,
  DEVOPS: 70,
  DEPLOYMENT: 80,
  ARCHITECTURE: 90,
  MLOPS: 90
};

  // Kahn's algorithm: topological sort prioritized by category progression
  const skillMap = new Map(skills.map(s => [s.id, s]));

  const getWeight = (id: string) => {
    const s = skillMap.get(id);
    const cat = s?.category ? s.category.toUpperCase() : 'GENERAL';
    return categoryWeight[cat] || 50;
  };

  let queue: string[] = [];
  for (const [skillId, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(skillId);
  }
  queue.sort((a, b) => getWeight(a) - getWeight(b));

  const sortedSkillIds: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    sortedSkillIds.push(curr);
    const ready: string[] = [];
    for (const dep of dependentsOf.get(curr) || []) {
      const newDeg = (inDegree.get(dep) || 0) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) ready.push(dep);
    }
    if (ready.length > 0) {
      queue.push(...ready);
      queue.sort((a, b) => getWeight(a) - getWeight(b));
    }
  }

  // Append any disconnected skills
  for (const skill of skills) {
    if (!sortedSkillIds.includes(skill.id)) {
      sortedSkillIds.push(skill.id);
    }
  }

  // Evaluate mastered skills
  const masteredSkillIds = new Set<string>();

  for (const skill of skills) {
    const cur = levelValue[skill.assessed_level || 'AWARENESS'] || 1;
    const tgt = levelValue[skill.target_level || 'PROFICIENT'] || 4;
    if (cur >= tgt) {
      masteredSkillIds.add(skill.id);
    }
  }

  const totalSkillsCount = sortedSkillIds.length;
  let completedCount = 0;
  let inProgressCount = 0;
  let lockedCount = 0;

  // Create milestones with dependency-aware status
  const milestones = sortedSkillIds.map((skillId, index) => {
    const skill = skillMap.get(skillId)!;
    const cur = levelValue[skill.assessed_level || 'AWARENESS'] || 1;
    const tgt = levelValue[skill.target_level || 'PROFICIENT'] || 4;
    const isMastered = cur >= tgt;

    let status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'FAST_TRACKED' = 'LOCKED';

    if (isMastered) {
      const isExpertOrAccurate = skill.assessed_level === 'EXPERT' || (skill.accuracy && Number(skill.accuracy) >= 80);
      status = isExpertOrAccurate ? 'FAST_TRACKED' : 'COMPLETED';
      completedCount++;
    } else {
      const prereqs = prereqsOf.get(skill.id) || new Set();
      const allPrereqsMet = Array.from(prereqs).every(pid => masteredSkillIds.has(pid));
      if (allPrereqsMet) {
        status = 'IN_PROGRESS';
        inProgressCount++;
      } else {
        status = 'LOCKED';
        lockedCount++;
      }
    }

    const phaseNum = Math.min(5, Math.floor((index * 5) / Math.max(1, totalSkillsCount)) + 1);

    return {
      id: `milestone-${index + 1}`,
      skill_id: skill.id,
      title: skill.name,
      description: `Build proficiency in ${skill.name} (${skill.category || 'Core'}) according to industry benchmark.`,
      category: skill.category || 'GENERAL',
      phase: phaseNum,
      phase_number: phaseNum,
      milestone_order: index + 1,
      status,
      assessed_level: skill.assessed_level || 'AWARENESS',
      target_level: skill.target_level || 'PROFICIENT',
      accuracy: skill.accuracy ?? 0,
      verified_by_resume: !!skill.verified_by_resume
    };
  });

  // Ensure student has at least one active learning focus if not 100% completed
  if (inProgressCount === 0 && completedCount < totalSkillsCount) {
    const firstUnfinished = milestones.find(m => m.status === 'LOCKED');
    if (firstUnfinished) {
      firstUnfinished.status = 'IN_PROGRESS';
      inProgressCount++;
      lockedCount--;
    }
  }

  // Group milestones into 5 Phases
  const phasesMap = new Map<number, any>();
  for (let p = 1; p <= 5; p++) {
    const meta = getRolePhaseMeta(roleName, p);
    phasesMap.set(p, {
      id: `phase-${p}`,
      phase_number: p,
      title: meta.title,
      description: meta.description,
      learning_outcome: meta.learning_outcome,
      milestones: [],
      topics: [],
      status: 'LOCKED' as 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED',
      has_decision_point: false,
      decision_options: []
    });
  }

  for (const m of milestones) {
    const phase = phasesMap.get(m.phase_number) || phasesMap.get(5);
    phase.milestones.push(m);
    phase.topics.push(m.title);
  }

  // Determine each phase status from its milestones
  for (const [_, phase] of phasesMap.entries()) {
    if (phase.milestones.length === 0) continue;
    const allDone = phase.milestones.every((m: any) => m.status === 'COMPLETED' || m.status === 'FAST_TRACKED');
    const anyActive = phase.milestones.some((m: any) => m.status === 'IN_PROGRESS' || m.status === 'COMPLETED' || m.status === 'FAST_TRACKED');

    if (allDone) {
      phase.status = 'COMPLETED';
    } else if (anyActive) {
      phase.status = 'IN_PROGRESS';
    } else {
      phase.status = 'LOCKED';
    }
  }

  // Attach technology branching decision point to Phase 4
  if (branchOptions.length > 0) {
    const phase4 = phasesMap.get(4);
    if (phase4) {
      phase4.has_decision_point = !selectedBranchId;
      phase4.decision_options = branchOptions;
      phase4.selected_branch_id = selectedBranchId;
      if (selectedBranchId) {
        const chosen = branchOptions.find(opt => opt.branch_id === selectedBranchId);
        if (chosen) {
          phase4.selected_option_name = chosen.name;
        }
      }
    }
  }

  const phases = Array.from(phasesMap.values()).filter(p => p.milestones.length > 0);

  // Calculate live readiness percentage
  let readiness = 0;
  if (skills.length > 0) {
    let totalRatio = 0;
    for (const skill of skills) {
      const cur = levelValue[skill.assessed_level || 'AWARENESS'] || 1;
      const tgt = levelValue[skill.target_level || 'PROFICIENT'] || 4;
      totalRatio += Math.min(cur / tgt, 1.0);
    }
    readiness = Math.round((totalRatio / skills.length) * 100);
  }

  try {
    await query(
      `INSERT INTO roadmap_states (student_id, role_id, readiness_pct)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, role_id)
       DO UPDATE SET readiness_pct = EXCLUDED.readiness_pct, updated_at = NOW()`,
      [studentId, validRoleId, readiness]
    );
  } catch (err: any) {
    // Non-blocking
  }

  return {
    role_id: validRoleId,
    role_name: roleName,
    readiness_pct: readiness,
    total_skills: skills.length,
    completed_skills: completedCount,
    in_progress_skills: inProgressCount,
    locked_skills: lockedCount,
    selected_branch_id: selectedBranchId,
    milestones,
    phases,
    has_resume: hasResume,
    resume_filename: studentProfile?.resume_filename || null,
    resume_matched_role: studentProfile?.resume_matched_role || null,
    resume_skills_count: resumeSkills.length
  };
}

export async function recordBranchChoice(
  studentId: string,
  branchId: string,
  optionId?: string
) {
  let roleId = 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208';
  let branchName = 'Technology Framework';
  let skillId: string | null = null;
  let roadmapId = `roadmap-${studentId}`;

  try {
    const branchResult = await query<{
      id: string;
      role_id: string;
      name: string;
    }>(
      `SELECT id, role_id, name FROM technology_branches WHERE id = $1`,
      [branchId]
    );

    if (branchResult.rows.length > 0) {
      const branch = branchResult.rows[0];
      roleId = branch.role_id;
      branchName = branch.name;

      if (optionId) {
        const optionResult = await query<{
          id: string;
          skill_id: string;
        }>(
          `
          SELECT id, skill_id
          FROM technology_branch_options
          WHERE (id = $1 OR skill_id = $1)
            AND branch_id = $2
          LIMIT 1
          `,
          [optionId, branchId]
        );

        if (optionResult.rows.length > 0) {
          skillId = optionResult.rows[0].skill_id;
          await query(
            `
            INSERT INTO student_skill_states (student_id, skill_id, assessed_level, accuracy)
            VALUES ($1, $2, 'BEGINNER', 40)
            ON CONFLICT (student_id, skill_id)
            DO UPDATE SET target_level = 'PROFICIENT', updated_at = NOW()
            `,
            [studentId, skillId]
          ).catch(() => {});
        }
      }

      await query(
        `
        INSERT INTO roadmap_states (student_id, role_id, selected_branch_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (student_id, role_id)
        DO UPDATE SET selected_branch_id = EXCLUDED.selected_branch_id, updated_at = NOW()
        `,
        [studentId, roleId, branchId]
      );
    }
  } catch (err) {
    console.error('[recordBranchChoice Error]', err);
  }

  const updatedRoadmap = await generatePersonalizedRoadmap(studentId, roleId);

  return {
    roadmap_id: roadmapId,
    branch_id: branchId,
    branch_name: branchName,
    option_id: optionId,
    skill_id: skillId,
    message: 'Technology branch selected successfully',
    updated_roadmap: updatedRoadmap
  };
}