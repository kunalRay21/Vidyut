import { query } from '../../database/db';
import { inMemorySkillStates, memoryStore } from '../../database/store';

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
  MLOPS: 90,
};

const levelValue: Record<string, number> = {
  AWARENESS: 1,
  BEGINNER: 2,
  INTERMEDIATE: 3,
  PROFICIENT: 4,
  EXPERT: 5,
};

function getRolePhaseMeta(roleName: string, phaseNum: number) {
  const isML = roleName.toLowerCase().includes('machine') || roleName.toLowerCase().includes('ml') || roleName.toLowerCase().includes('ai');
  if (isML) {
    switch (phaseNum) {
      case 1:
        return {
          title: 'Phase 1: Mathematical Foundations & Programming',
          description: 'Establish core mathematical rigor across linear algebra, probability, statistics, and scientific Python programming.',
          learning_outcome: 'Manipulate high-dimensional tensors, formulate statistical models, and collaborate with Git version control.'
        };
      case 2:
        return {
          title: 'Phase 2: Data Engineering & Exploratory Analysis',
          description: 'Perform tabular data engineering with Pandas/NumPy, relational data queries with SQL, and diagnostic visualization.',
          learning_outcome: 'Clean, preprocess, and extract high-signal predictive features from production datasets.'
        };
      case 3:
        return {
          title: 'Phase 3: Classical Machine Learning & Validation',
          description: 'Train supervised and unsupervised learning algorithms with rigorous cross-validation and hyperparameter optimization.',
          learning_outcome: 'Train calibrated Scikit-Learn models, prevent data leakage, and establish robust baseline metrics.'
        };
      case 4:
        return {
          title: 'Phase 4: Deep Learning Framework Specialization',
          description: 'Specialize in your selected deep learning framework to construct neural architectures, loss functions, and embeddings.',
          learning_outcome: 'Implement deep neural networks and custom training loops in production.'
        };
      case 5:
      default:
        return {
          title: 'Phase 5: MLOps, Model Serving & Applied AI',
          description: 'Package models into inference microservices, track experiments, and implement computer vision/NLP pipelines.',
          learning_outcome: 'Deploy, monitor, and scale high-throughput AI services in cloud production environments.'
        };
    }
  }

  // Backend Developer & General Software Engineering
  switch (phaseNum) {
    case 1:
      return {
        title: 'Phase 1: Foundations & Core Logic',
        description: 'Master programming fundamentals, language syntax, and distributed version control workflows.',
        learning_outcome: 'Write modular code, implement structured algorithms, and collaborate with Git repositories.'
      };
    case 2:
      return {
        title: 'Phase 2: Data Persistence & Web Architecture',
        description: 'Construct relational schemas, write optimal SQL queries, and implement HTTP/REST communication protocols.',
        learning_outcome: 'Design normalized database schemas, query tables, and consume robust web endpoints.'
      };
    case 3:
      return {
        title: 'Phase 3: APIs, Authentication & Testing',
        description: 'Implement enterprise authentication mechanisms, API security controls, and automated test suites.',
        learning_outcome: 'Build hardened server-side endpoints with high automated test coverage.'
      };
    case 4:
      return {
        title: 'Phase 4: Framework Specialization & Distributed Systems',
        description: 'Select your core web framework track and master caching and messaging patterns.',
        learning_outcome: 'Architect production-ready microservices using modern backend frameworks.'
      };
    case 5:
    default:
      return {
        title: 'Phase 5: DevOps, Containerization & Cloud Deployment',
        description: 'Automate delivery pipelines, containerize microservices, and ensure resilient cloud deployment.',
        learning_outcome: 'Deploy scalable, monitored cloud architectures with continuous delivery pipelines.'
      };
  }
}

export const FALLBACK_ROADMAPS: Record<string, any> = {
  'role-backend': {
    role_name: 'Backend Developer',
    skills: [
      { id: 'skill-prog-fund', name: 'Programming Fundamentals', category: 'FOUNDATION', assessed_level: 'PROFICIENT', target_level: 'PROFICIENT' },
      { id: 'skill-git', name: 'Git & GitHub', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-http', name: 'HTTP', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-rest', name: 'REST API', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-sql', name: 'SQL', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE' },
      { id: 'skill-db-design', name: 'Database Design', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-auth', name: 'Authentication', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-docker', name: 'Docker', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-cicd', name: 'CI/CD', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
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
        name: 'Python Web Framework',
        description: 'Choose between FastAPI and Django',
        options: [
          { branch_id: 'branch-backend-framework', option_id: 'opt-fastapi', name: 'FastAPI', skill_id: 'skill-fastapi' },
          { branch_id: 'branch-backend-framework', option_id: 'opt-django', name: 'Django', skill_id: 'skill-django' }
        ]
      }
    ]
  },
  'role-ml': {
    role_name: 'Machine Learning Engineer',
    skills: [
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-git', name: 'Git', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-numpy', name: 'NumPy', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-pandas', name: 'Pandas', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-stats', name: 'Statistics', category: 'MATHEMATICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-linalg', name: 'Linear Algebra', category: 'MATHEMATICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-ml-fund', name: 'Machine Learning Fundamentals', category: 'MACHINE_LEARNING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
    ],
    prerequisites: [
      { skill_id: 'skill-git', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-numpy', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-pandas', prerequisite_skill_id: 'skill-numpy' },
      { skill_id: 'skill-stats', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-linalg', prerequisite_skill_id: 'skill-python' },
      { skill_id: 'skill-ml-fund', prerequisite_skill_id: 'skill-pandas' }
    ],
    branches: [
      {
        id: 'branch-dl-framework',
        name: 'Deep Learning Framework',
        description: 'Choose between TensorFlow and PyTorch',
        options: [
          { branch_id: 'branch-dl-framework', option_id: 'opt-tf', name: 'TensorFlow', skill_id: 'skill-tf' },
          { branch_id: 'branch-dl-framework', option_id: 'opt-pytorch', name: 'PyTorch', skill_id: 'skill-pytorch' }
        ]
      }
    ]
  },
  'role-cloud': {
    role_name: 'Cloud Native & DevOps Engineer',
    skills: [
      { id: 'skill-linux', name: 'Linux Administration & Shell Scripting', category: 'SYSADMIN', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-networking', name: 'Computer Networking & DNS Basics', category: 'NETWORKING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-docker', name: 'Container Orchestration with Docker', category: 'CONTAINERS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-cicd', name: 'Automated CI/CD Pipelines', category: 'CI_CD', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-k8s', name: 'Kubernetes Cluster Management', category: 'ORCHESTRATION', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-terraform', name: 'Infrastructure as Code (Terraform)', category: 'IAC', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
    ],
    prerequisites: [
      { skill_id: 'skill-networking', prerequisite_skill_id: 'skill-linux' },
      { skill_id: 'skill-docker', prerequisite_skill_id: 'skill-linux' },
      { skill_id: 'skill-cicd', prerequisite_skill_id: 'skill-docker' },
      { skill_id: 'skill-k8s', prerequisite_skill_id: 'skill-docker' },
      { skill_id: 'skill-terraform', prerequisite_skill_id: 'skill-k8s' }
    ],
    branches: [
      {
        id: 'branch-cloud-provider',
        name: 'Cloud Infrastructure Provider',
        description: 'Choose between AWS and Azure architectures',
        options: [
          { branch_id: 'branch-cloud-provider', option_id: 'opt-aws', name: 'AWS Cloud Services', skill_id: 'skill-aws' },
          { branch_id: 'branch-cloud-provider', option_id: 'opt-azure', name: 'Microsoft Azure', skill_id: 'skill-azure' }
        ]
      }
    ]
  },
  'role-data': {
    role_name: 'Data Science & Big Data Engineer',
    skills: [
      { id: 'skill-prob-stats', name: 'Probability & Descriptive Statistics', category: 'STATISTICS', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-adv-sql', name: 'Advanced SQL & Window Functions', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-etl', name: 'Automated ETL Pipeline Engineering', category: 'DATA_PIPELINES', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-data-viz', name: 'Data Visualization & Storytelling', category: 'ANALYTICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-spark', name: 'Distributed Processing with PySpark', category: 'BIG_DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-kafka-stream', name: 'Real-Time Event Streaming (Kafka)', category: 'STREAMING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
    ],
    prerequisites: [
      { skill_id: 'skill-adv-sql', prerequisite_skill_id: 'skill-prob-stats' },
      { skill_id: 'skill-etl', prerequisite_skill_id: 'skill-adv-sql' },
      { skill_id: 'skill-data-viz', prerequisite_skill_id: 'skill-adv-sql' },
      { skill_id: 'skill-spark', prerequisite_skill_id: 'skill-etl' },
      { skill_id: 'skill-kafka-stream', prerequisite_skill_id: 'skill-spark' }
    ],
    branches: [
      {
        id: 'branch-data-warehouse',
        name: 'Modern Data Warehouse Platform',
        description: 'Choose between Snowflake and Databricks',
        options: [
          { branch_id: 'branch-data-warehouse', option_id: 'opt-snowflake', name: 'Snowflake Analytics', skill_id: 'skill-snowflake' },
          { branch_id: 'branch-data-warehouse', option_id: 'opt-databricks', name: 'Databricks Lakehouse', skill_id: 'skill-databricks' }
        ]
      }
    ]
  },
  'role-fullstack': {
    role_name: 'Full-Stack Web Architect',
    skills: [
      { id: 'skill-html-css', name: 'Semantic HTML5 & Modern CSS3', category: 'WEB', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-ts', name: 'TypeScript & Type Safety', category: 'PROGRAMMING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-react', name: 'React Component Architecture & Hooks', category: 'FRONTEND', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-node-api', name: 'Backend API Integration (Node/Express)', category: 'BACKEND', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-nextjs', name: 'Server-Side Rendering (Next.js)', category: 'FULLSTACK', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-testing', name: 'Automated Testing & End-to-End', category: 'TESTING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
    ],
    prerequisites: [
      { skill_id: 'skill-ts', prerequisite_skill_id: 'skill-html-css' },
      { skill_id: 'skill-react', prerequisite_skill_id: 'skill-ts' },
      { skill_id: 'skill-node-api', prerequisite_skill_id: 'skill-ts' },
      { skill_id: 'skill-nextjs', prerequisite_skill_id: 'skill-react' },
      { skill_id: 'skill-testing', prerequisite_skill_id: 'skill-nextjs' }
    ],
    branches: [
      {
        id: 'branch-state-management',
        name: 'Client State Architecture',
        description: 'Choose between Zustand and Redux Toolkit',
        options: [
          { branch_id: 'branch-state-management', option_id: 'opt-zustand', name: 'Zustand Minimal State', skill_id: 'skill-zustand' },
          { branch_id: 'branch-state-management', option_id: 'opt-redux', name: 'Redux Toolkit Enterprise', skill_id: 'skill-redux' }
        ]
      }
    ]
  },
  'role-security': {
    role_name: 'Cybersecurity & Defensive Specialist',
    skills: [
      { id: 'skill-sec-net', name: 'Network Protocol & Packet Analysis', category: 'NETWORKING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT' },
      { id: 'skill-crypto', name: 'Applied Cryptography Fundamentals', category: 'CRYPTOGRAPHY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-owasp', name: 'Web Application Security (OWASP Top 10)', category: 'APPSEC', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-iam', name: 'Identity & Access Management (OAuth/JWT)', category: 'AUTH', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-siem', name: 'Defensive SIEM & Threat Monitoring', category: 'OPERATIONS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' },
      { id: 'skill-zero-trust', name: 'Zero-Trust Architecture & Hardening', category: 'ENTERPRISE', assessed_level: 'AWARENESS', target_level: 'PROFICIENT' }
    ],
    prerequisites: [
      { skill_id: 'skill-crypto', prerequisite_skill_id: 'skill-sec-net' },
      { skill_id: 'skill-owasp', prerequisite_skill_id: 'skill-sec-net' },
      { skill_id: 'skill-iam', prerequisite_skill_id: 'skill-crypto' },
      { skill_id: 'skill-siem', prerequisite_skill_id: 'skill-owasp' },
      { skill_id: 'skill-zero-trust', prerequisite_skill_id: 'skill-iam' }
    ],
    branches: [
      {
        id: 'branch-security-ops',
        name: 'Defensive Security Specialization',
        description: 'Choose between Cloud Security Posture and Incident Response',
        options: [
          { branch_id: 'branch-security-ops', option_id: 'opt-cloudsec', name: 'Cloud Security Posture (CSPM)', skill_id: 'skill-cloudsec' },
          { branch_id: 'branch-security-ops', option_id: 'opt-forensics', name: 'Digital Forensics & Incident Response', skill_id: 'skill-forensics' }
        ]
      }
    ]
  }
};

export const inMemoryRoadmapBranches = new Map<string, { branchId: string; optionId?: string; roleId?: string }>();

function resolveRoleSearchPattern(roleSlug: string): string {
  const s = (roleSlug || '').toLowerCase();
  if (s.includes('cloud') || s.includes('devops')) return '%cloud%';
  if (s.includes('data') || s.includes('analytics') || s.includes('big')) return '%data%';
  if (s.includes('fullstack') || s.includes('full-stack') || s.includes('frontend') || s.includes('web')) return '%full%';
  if (s.includes('security') || s.includes('cyber') || s.includes('defensive')) return '%security%';
  if (s.includes('ml') || s.includes('machine') || s.includes('ai')) return '%machine%';
  return '%backend%';
}

export function resolveFallbackRoleKey(roleSlug: string): string {
  if (FALLBACK_ROADMAPS[roleSlug]) return roleSlug;
  const s = (roleSlug || '').toLowerCase();
  if (s.includes('cloud') || s.includes('devops')) return 'role-cloud';
  if (s.includes('data') || s.includes('analytics') || s.includes('big')) return 'role-data';
  if (s.includes('fullstack') || s.includes('full-stack') || s.includes('web')) return 'role-fullstack';
  if (s.includes('security') || s.includes('cyber')) return 'role-security';
  if (s.includes('ml') || s.includes('machine') || s.includes('ai')) return 'role-ml';
  return 'role-backend';
}

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

  const isUUID = (s: string) =>
    typeof s === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());

  try {
    // 1. Resolve role ID to database UUID if necessary
    if (!isUUID(validRoleId)) {
      const searchPattern = resolveRoleSearchPattern(validRoleId);
      const found = await query<{ id: string }>(
        `SELECT id FROM roles WHERE LOWER(name) LIKE $1 LIMIT 1`,
        [searchPattern]
      );
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

  // Check in-memory branch state for offline resilience
  const memBranch = inMemoryRoadmapBranches.get(studentId) || inMemoryRoadmapBranches.get(`${studentId}:${validRoleId}`);
  if (memBranch) {
    selectedBranchId = selectedBranchId || memBranch.branchId;
  }

  // Fallback data if skills empty
  if (skills.length === 0) {
    const fallbackKey = resolveFallbackRoleKey(validRoleId || roleId);
    const fallback = FALLBACK_ROADMAPS[fallbackKey];
    roleName = fallback.role_name;
    skills = fallback.skills.map((s: any) => ({ ...s }));
    prerequisiteRows = fallback.prerequisites;
    branchesCount = fallback.branches.length;
    branchOptions = fallback.branches[0].options;
  }

  // Merge in-memory test states and evidence for student (works for both DB and fallback paths)
  for (const skill of skills) {
    const memKey = `${studentId}:${skill.id}`;
    const mem = memoryStore.skill_states.get(memKey) || inMemorySkillStates.get(memKey);
    if (mem && mem.assessed_level) {
      const memVal = levelValue[mem.assessed_level] || 1;
      const curVal = levelValue[skill.assessed_level || 'AWARENESS'] || 1;
      if (memVal >= curVal) {
        skill.assessed_level = mem.assessed_level;
        if (mem.accuracy !== undefined) skill.accuracy = mem.accuracy;
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
      accuracy: skill.accuracy ?? 0
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
    phases
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

  // Persist into in-memory branch state for offline resilience
  inMemoryRoadmapBranches.set(studentId, { branchId, optionId, roleId });
  inMemoryRoadmapBranches.set(`${studentId}:${roleId}`, { branchId, optionId, roleId });

  if (branchName === 'Technology Framework') {
    for (const fb of Object.values(FALLBACK_ROADMAPS)) {
      const b = fb.branches?.find((br: any) => br.id === branchId);
      if (b) {
        branchName = b.name;
        if (optionId) {
          const opt = b.options?.find((o: any) => o.option_id === optionId || o.skill_id === optionId);
          if (opt && opt.skill_id) {
            skillId = opt.skill_id;
            memoryStore.skill_states.set(`${studentId}:${opt.skill_id}`, {
              student_id: studentId,
              skill_id: opt.skill_id,
              assessed_level: 'BEGINNER',
              accuracy: 40,
              target_level: 'PROFICIENT',
              updated_at: new Date().toISOString()
            });
          }
        }
        break;
      }
    }
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