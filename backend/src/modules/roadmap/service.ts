import { query } from '../../database/db';
import { inMemorySkillStates, memoryStore } from '../../database/store';

export const levelValue: Record<string, number> = {
  NOT_ASSESSED: 0,
  NOT_FAMILIAR: 1,
  AWARENESS: 1,
  BEGINNER: 2,
  AVERAGE: 3,
  INTERMEDIATE: 3,
  GOOD: 4,
  PROFICIENT: 4,
  ADVANCED: 5,
  EXPERT: 5,
  MASTERED: 5,
};

export interface SkillNode {
  id: string;
  name: string;
  category: string | null;
  assessed_level: string;
  target_level: string;
  accuracy: number;
}

export interface PrerequisiteEdge {
  skill_id: string;
  prerequisite_skill_id: string;
}

export interface DAGValidationResult {
  isValid: boolean;
  hasCycle: boolean;
  cycleNodes: string[];
  sortedIds: string[];
  errors: string[];
}

/**
 * Generic topological sort with cycle detection (Kahn's Algorithm + DFS cycle check)
 */
export function validateAndSortDAG(
  skills: SkillNode[],
  edges: PrerequisiteEdge[]
): DAGValidationResult {
  const skillIds = new Set(skills.map(s => s.id));
  const errors: string[] = [];

  // Filter & validate edges
  const validEdges: PrerequisiteEdge[] = [];
  const edgeSet = new Set<string>();

  for (const edge of edges) {
    if (!skillIds.has(edge.skill_id) || !skillIds.has(edge.prerequisite_skill_id)) {
      errors.push(`Orphaned prerequisite reference: ${edge.prerequisite_skill_id} -> ${edge.skill_id}`);
      continue;
    }
    if (edge.skill_id === edge.prerequisite_skill_id) {
      errors.push(`Self-dependency detected on skill: ${edge.skill_id}`);
      continue;
    }
    const pairKey = `${edge.prerequisite_skill_id}->${edge.skill_id}`;
    if (edgeSet.has(pairKey)) {
      continue; // Duplicate edge ignored
    }
    edgeSet.add(pairKey);
    validEdges.push(edge);
  }

  // Build Graph Adjacency List & Indegrees
  const inDegree = new Map<string, number>();
  const dependentsOf = new Map<string, string[]>();
  const prereqsOf = new Map<string, string[]>();

  for (const id of skillIds) {
    inDegree.set(id, 0);
    dependentsOf.set(id, []);
    prereqsOf.set(id, []);
  }

  for (const edge of validEdges) {
    dependentsOf.get(edge.prerequisite_skill_id)!.push(edge.skill_id);
    prereqsOf.get(edge.skill_id)!.push(edge.prerequisite_skill_id);
    inDegree.set(edge.skill_id, (inDegree.get(edge.skill_id) || 0) + 1);
  }

  // Category priority weights for deterministic ties
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
    SECURITY: 60,
    DEVOPS: 70,
    ARCHITECTURE: 90,
  };

  const skillMap = new Map(skills.map(s => [s.id, s]));
  const getWeight = (id: string) => {
    const cat = (skillMap.get(id)?.category || 'GENERAL').toUpperCase();
    return categoryWeight[cat] || 50;
  };

  // Kahn's Algorithm
  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }
  queue.sort((a, b) => getWeight(a) - getWeight(b));

  const sortedIds: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    sortedIds.push(curr);

    const newlyReady: string[] = [];
    for (const dep of dependentsOf.get(curr) || []) {
      const newDeg = (inDegree.get(dep) || 0) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) newlyReady.push(dep);
    }
    if (newlyReady.length > 0) {
      queue.push(...newlyReady);
      queue.sort((a, b) => getWeight(a) - getWeight(b));
    }
  }

  // Check for cycles
  const hasCycle = sortedIds.length < skills.length;
  const cycleNodes: string[] = [];
  if (hasCycle) {
    for (const id of skillIds) {
      if (!sortedIds.includes(id)) {
        cycleNodes.push(id);
      }
    }
    errors.push(`Cycle detected involving skills: ${cycleNodes.join(', ')}`);
  }

  return {
    isValid: !hasCycle && errors.length === 0,
    hasCycle,
    cycleNodes,
    sortedIds,
    errors,
  };
}

export function getRolePhaseMeta(roleName: string, phaseNum: number) {
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
      { id: 'skill-prog-fund', name: 'Programming Fundamentals', category: 'FOUNDATION', assessed_level: 'PROFICIENT', target_level: 'PROFICIENT', accuracy: 85 },
      { id: 'skill-git', name: 'Git & GitHub', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 40 },
      { id: 'skill-http', name: 'HTTP', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 30 },
      { id: 'skill-rest', name: 'REST API', category: 'WEB', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 20 },
      { id: 'skill-sql', name: 'SQL', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'INTERMEDIATE', accuracy: 25 },
      { id: 'skill-db-design', name: 'Database Design', category: 'DATABASE', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 10 },
      { id: 'skill-auth', name: 'Authentication', category: 'SECURITY', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 10 },
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT', accuracy: 45 },
      { id: 'skill-docker', name: 'Docker', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
      { id: 'skill-cicd', name: 'CI/CD', category: 'DEVOPS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 }
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
      { id: 'skill-python', name: 'Python', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT', accuracy: 45 },
      { id: 'skill-git', name: 'Git', category: 'TOOLS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 30 },
      { id: 'skill-numpy', name: 'NumPy', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 20 },
      { id: 'skill-pandas', name: 'Pandas', category: 'DATA', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 15 },
      { id: 'skill-stats', name: 'Statistics', category: 'MATHEMATICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 25 },
      { id: 'skill-linalg', name: 'Linear Algebra', category: 'MATHEMATICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 20 },
      { id: 'skill-ml-fund', name: 'Machine Learning Fundamentals', category: 'MACHINE_LEARNING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 }
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
  }
};

/**
 * Skill Gap Analysis Engine
 */
export async function analyzeSkillGaps(studentId: string, roleId: string) {
  // Check student profile for uploaded resume (Calibrate ONLY if resume provided)
  let studentProfile: any = null;
  const isUUID = (s: string) =>
    typeof s === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());

  if (isUUID(studentId)) {
    try {
      const spRes = await query<{
        id: string;
        user_id: string;
        resume_matched_role: string;
        parsed_skills: string[];
        resume_parsed_data: any;
        resume_filename: string;
      }>(
        `SELECT id, user_id, resume_matched_role, parsed_skills, resume_parsed_data, resume_filename FROM student_profiles WHERE id::text = $1 OR user_id::text = $1 LIMIT 1`,
        [studentId]
      );
      if (spRes.rows.length > 0) studentProfile = spRes.rows[0];
    } catch {
      // ignore
    }
  }
  if (!studentProfile) {
    studentProfile = memoryStore.profiles.get(studentId) || Array.from(memoryStore.profiles.values()).find(p => p.id === studentId || p.user_id === studentId);
  }

  const hasResume = !!(studentProfile?.resume_filename || studentProfile?.resume_matched_role || (studentProfile?.parsed_skills && studentProfile.parsed_skills.length > 0));
  const resumeSkills: string[] = studentProfile?.parsed_skills || studentProfile?.resume_parsed_data?.extractedSkills || [];

  let validRoleId = roleId;
  let roleName = 'Career Role';
  let skills: SkillNode[] = [];
  let prerequisiteRows: PrerequisiteEdge[] = [];

  try {
    if (!isUUID(validRoleId)) {
      const isML = validRoleId.toLowerCase().includes('ml') || validRoleId.toLowerCase().includes('machine');
      const found = await query<{ id: string }>(
        `SELECT id FROM roles WHERE LOWER(name) LIKE $1 LIMIT 1`,
        [isML ? '%machine%' : '%backend%']
      );
      if (found.rows.length > 0) validRoleId = found.rows[0].id;
    }

    const roleResult = await query<{ name: string }>(`SELECT name FROM roles WHERE id = $1`, [validRoleId]);
    if (roleResult.rows.length > 0) {
      roleName = roleResult.rows[0].name;

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
          COALESCE(ss.accuracy, 0) AS accuracy
        FROM skills s
        LEFT JOIN student_skill_states ss
          ON ss.skill_id = s.id
          AND ss.student_id = $1
        WHERE s.role_id = $2
        ORDER BY s.name
        `,
        [studentId, validRoleId]
      );

      skills = skillsResult.rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        assessed_level: r.assessed_level || 'AWARENESS',
        target_level: r.target_level || 'PROFICIENT',
        accuracy: r.accuracy || 0,
      }));

      // Merge in-memory states
      for (const skill of skills) {
        const memKey = `${studentId}:${skill.id}`;
        const mem = inMemorySkillStates.get(memKey) || memoryStore.skill_states.get(memKey);
        if (mem && mem.assessed_level) {
          const memVal = levelValue[mem.assessed_level] || 1;
          const curVal = levelValue[skill.assessed_level] || 1;
          if (memVal > curVal) {
            skill.assessed_level = mem.assessed_level;
            if (mem.accuracy !== undefined) skill.accuracy = mem.accuracy;
          }
        }
      }

      const edgesResult = await query<PrerequisiteEdge>(
        `
        SELECT sp.skill_id, sp.prerequisite_skill_id
        FROM skill_prerequisites sp
        JOIN skills s ON s.id = sp.skill_id
        WHERE s.role_id = $1
        `,
        [validRoleId]
      );
      prerequisiteRows = edgesResult.rows;
    }
  } catch (err) {
    // Database query fallback
  }

  // Fallback if empty DB
  if (skills.length === 0) {
    const fallbackKey = (roleId || '').toLowerCase().includes('ml') ? 'role-ml' : 'role-backend';
    const fallback = FALLBACK_ROADMAPS[fallbackKey];
    roleName = fallback.role_name;
    skills = fallback.skills.map((s: any) => ({ ...s, assessed_level: 'AWARENESS', accuracy: 0 }));
    prerequisiteRows = fallback.prerequisites.map((p: any) => ({ ...p }));

    // Check memory store for student state
    for (const skill of skills) {
      const memKey = `${studentId}:${skill.id}`;
      const mem = inMemorySkillStates.get(memKey) || memoryStore.skill_states.get(memKey);
      if (mem && mem.assessed_level) {
        skill.assessed_level = mem.assessed_level;
        if (mem.accuracy !== undefined) skill.accuracy = mem.accuracy;
      }
    }
  }

  // CALIBRATE SKILLS FROM RESUME: Only if resume is provided!
  if (hasResume && resumeSkills.length > 0) {
    for (const skill of skills) {
      const isMatchedInResume = resumeSkills.some((rSkill: string) => {
        const r = (rSkill || '').toLowerCase().trim();
        const s = (skill.name || '').toLowerCase().trim();
        return r === s || r.includes(s) || s.includes(r);
      });
      if (isMatchedInResume) {
        const curVal = levelValue[skill.assessed_level] || 1;
        if (curVal < 4) {
          skill.assessed_level = 'PROFICIENT';
        }
        (skill as any).verified_by_resume = true;
      }
    }
  }

  // Run generic DAG topological sort
  const dag = validateAndSortDAG(skills, prerequisiteRows);

  const skillMap = new Map(skills.map(s => [s.id, s]));
  const prereqsOfMap = new Map<string, string[]>();
  for (const s of skills) prereqsOfMap.set(s.id, []);
  for (const edge of prerequisiteRows) {
    if (prereqsOfMap.has(edge.skill_id)) {
      prereqsOfMap.get(edge.skill_id)!.push(edge.prerequisite_skill_id);
    }
  }

  const masteredSkills: any[] = [];
  const partiallyMasteredSkills: any[] = [];
  const missingSkills: any[] = [];
  const blockedSkills: any[] = [];
  const eligibleSkills: any[] = [];

  const masteredIds = new Set<string>();

  // Determine mastery
  for (const id of dag.sortedIds) {
    const skill = skillMap.get(id)!;
    const curVal = levelValue[skill.assessed_level] || 1;
    const tgtVal = levelValue[skill.target_level] || 4;

    if (curVal >= tgtVal || skill.accuracy >= 80) {
      masteredIds.add(id);
      masteredSkills.push({
        id: skill.id,
        name: skill.name,
        assessed_level: skill.assessed_level,
        target_level: skill.target_level,
        reason: 'Mastered: Skill proficiency benchmark satisfied.',
      });
    } else if (curVal > 1) {
      partiallyMasteredSkills.push({
        id: skill.id,
        name: skill.name,
        assessed_level: skill.assessed_level,
        target_level: skill.target_level,
        remaining_gap: `${skill.assessed_level} -> ${skill.target_level}`,
      });
    } else {
      missingSkills.push({
        id: skill.id,
        name: skill.name,
        assessed_level: skill.assessed_level,
        target_level: skill.target_level,
      });
    }
  }

  // Determine prerequisite eligibility vs blocked
  for (const id of dag.sortedIds) {
    if (masteredIds.has(id)) continue;

    const skill = skillMap.get(id)!;
    const prereqs = prereqsOfMap.get(id) || [];
    const missingPrereqs = prereqs.filter(pId => !masteredIds.has(pId));

    if (missingPrereqs.length === 0) {
      eligibleSkills.push({
        id: skill.id,
        name: skill.name,
        assessed_level: skill.assessed_level,
        target_level: skill.target_level,
        prerequisites_satisfied: true,
        reason: prereqs.length > 0 ? `All prerequisites (${prereqs.map(p => skillMap.get(p)?.name || p).join(', ')}) satisfied.` : 'Foundation skill ready for mastery.',
      });
    } else {
      const missingNames = missingPrereqs.map(p => skillMap.get(p)?.name || p);
      blockedSkills.push({
        id: skill.id,
        name: skill.name,
        assessed_level: skill.assessed_level,
        target_level: skill.target_level,
        blocked_by: missingNames,
        reason: `Blocked until prerequisites (${missingNames.join(', ')}) are completed.`,
      });
    }
  }

  const nextBestSkill = eligibleSkills.length > 0 ? eligibleSkills[0] : null;

  let readinessPct = 0;
  if (skills.length > 0) {
    let totalRatio = 0;
    for (const skill of skills) {
      const cur = levelValue[skill.assessed_level] || 1;
      const tgt = levelValue[skill.target_level] || 4;
      totalRatio += Math.min(cur / tgt, 1.0);
    }
    readinessPct = Math.round((totalRatio / skills.length) * 100);
  }

  return {
    has_resume: hasResume,
    resume_filename: studentProfile?.resume_filename || null,
    resume_matched_role: studentProfile?.resume_matched_role || null,
    resume_skills_count: resumeSkills.length,
    role_id: validRoleId,
    role_name: roleName,
    readiness_pct: readinessPct,
    total_skills: skills.length,
    mastered_skills: masteredSkills,
    partially_mastered_skills: partiallyMasteredSkills,
    missing_skills: missingSkills,
    blocked_skills: blockedSkills,
    eligible_skills: eligibleSkills,
    next_best_skill: nextBestSkill,
    dag_validation: dag,
  };
}

/**
 * Main Roadmap Generation & Regeneration Orchestrator
 */
export async function generatePersonalizedRoadmap(studentId: string, roleId: string) {
  const gaps = await analyzeSkillGaps(studentId, roleId);
  const isUUID = (s: string) =>
    typeof s === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());

  let validRoleId = gaps.role_id;
  let roleName = gaps.role_name;

  // Fetch branch options and selected branch
  let branchOptions: any[] = [];
  let selectedBranchId: string | null = null;

  try {
    if (isUUID(validRoleId)) {
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

      if (branchesResult.rows.length > 0) {
        branchOptions = branchesResult.rows.map(row => ({
          branch_id: row.branch_id,
          option_id: row.option_id,
          name: row.skill_name,
          description: row.branch_description || `Specialize in ${row.skill_name}`,
          skill_id: row.skill_id,
        }));
      }

      const savedState = await query<{ selected_branch_id: string }>(
        `SELECT selected_branch_id FROM roadmap_states WHERE student_id = $1 AND role_id = $2 LIMIT 1`,
        [studentId, validRoleId]
      ).catch(() => ({ rows: [] as any[] }));
      selectedBranchId = savedState.rows[0]?.selected_branch_id || null;
    }
  } catch {
    // Database query fallback
  }

  if (branchOptions.length === 0) {
    const fallbackKey = (roleId || '').toLowerCase().includes('ml') ? 'role-ml' : 'role-backend';
    const fallback = FALLBACK_ROADMAPS[fallbackKey];
    if (fallback && fallback.branches && fallback.branches[0]) {
      branchOptions = fallback.branches[0].options;
    }
  }

  // Create milestones in topological order
  const sortedIds = gaps.dag_validation.sortedIds;
  const totalSkillsCount = sortedIds.length;
  const masteredIds = new Set(gaps.mastered_skills.map((m: any) => m.id));
  const blockedIds = new Set(gaps.blocked_skills.map((b: any) => b.id));

  let completedCount = 0;
  let inProgressCount = 0;
  let lockedCount = 0;

  const milestones = sortedIds.map((skillId, index) => {
    const isMastered = masteredIds.has(skillId);
    const isBlocked = blockedIds.has(skillId);

    let status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'FAST_TRACKED' = 'LOCKED';
    let reason = '';

    if (isMastered) {
      status = 'COMPLETED';
      completedCount++;
      reason = 'Prerequisites and competency benchmarks satisfied.';
    } else if (!isBlocked) {
      status = 'IN_PROGRESS';
      inProgressCount++;
      reason = 'All prerequisites met — currently active learning focus.';
    } else {
      status = 'LOCKED';
      lockedCount++;
      const blockedObj = gaps.blocked_skills.find((b: any) => b.id === skillId);
      reason = blockedObj ? blockedObj.reason : 'Prerequisites pending.';
    }

    const phaseNum = Math.min(5, Math.floor((index * 5) / Math.max(1, totalSkillsCount)) + 1);
    const skillObj =
      gaps.mastered_skills.find((s: any) => s.id === skillId) ||
      gaps.partially_mastered_skills.find((s: any) => s.id === skillId) ||
      gaps.eligible_skills.find((s: any) => s.id === skillId) ||
      gaps.blocked_skills.find((s: any) => s.id === skillId) ||
      { name: `Skill ${index + 1}`, assessed_level: 'AWARENESS', target_level: 'PROFICIENT' };

    return {
      id: `milestone-${index + 1}`,
      skill_id: skillId,
      title: skillObj.name,
      description: `Build proficiency in ${skillObj.name} according to industry benchmark.`,
      phase: phaseNum,
      phase_number: phaseNum,
      milestone_order: index + 1,
      status,
      reason,
      assessed_level: skillObj.assessed_level || 'AWARENESS',
      target_level: skillObj.target_level || 'PROFICIENT',
    };
  });

  // Group into 5 Phases
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
      decision_options: [],
    });
  }

  for (const m of milestones) {
    const phase = phasesMap.get(m.phase_number) || phasesMap.get(5);
    phase.milestones.push(m);
    phase.topics.push(m.title);
  }

  for (const [, phase] of phasesMap.entries()) {
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

  // Attach technology branching to Phase 4
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

  // Persist readiness state
  try {
    await query(
      `INSERT INTO roadmap_states (student_id, role_id, readiness_pct)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, role_id)
       DO UPDATE SET readiness_pct = EXCLUDED.readiness_pct, updated_at = NOW()`,
      [studentId, validRoleId, gaps.readiness_pct]
    );
  } catch {
    // Non-blocking
  }

  return {
    role_id: validRoleId,
    role_name: roleName,
    readiness_pct: gaps.readiness_pct,
    total_skills: totalSkillsCount,
    completed_skills: completedCount,
    in_progress_skills: inProgressCount,
    locked_skills: lockedCount,
    next_best_skill: gaps.next_best_skill,
    selected_branch_id: selectedBranchId,
    milestones,
    phases,
    dag_validation: {
      is_valid: gaps.dag_validation.isValid,
      has_cycle: gaps.dag_validation.hasCycle,
      errors: gaps.dag_validation.errors,
    },
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
    }>(`SELECT id, role_id, name FROM technology_branches WHERE id = $1`, [branchId]);

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
    updated_roadmap: updatedRoadmap,
  };
}