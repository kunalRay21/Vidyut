import { query } from '../../database/db';

const levelValue: Record<string, number> = {
  AWARENESS: 1,
  BEGINNER: 2,
  INTERMEDIATE: 3,
  PROFICIENT: 4,
  EXPERT: 5,
};

const FALLBACK_ROADMAPS: Record<string, any> = {
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

  try {
    const roleResult = await query<{ name: string }>(
      `SELECT name FROM roles WHERE id = $1`,
      [roleId]
    );

    if (roleResult.rows.length > 0) {
      roleName = roleResult.rows[0].name;

      const skillsResult = await query<{
        id: string;
        name: string;
        category: string | null;
        assessed_level: string | null;
        target_level: string | null;
      }>(
        `
        SELECT
          s.id,
          s.name,
          s.category,
          COALESCE(ss.assessed_level, 'AWARENESS') AS assessed_level,
          COALESCE(ss.target_level, 'PROFICIENT') AS target_level
        FROM skills s
        LEFT JOIN student_skill_states ss
          ON ss.skill_id = s.id
          AND ss.student_id = $1
        WHERE s.role_id = $2
        ORDER BY s.name
        `,
        [studentId, roleId]
      );

      skills = skillsResult.rows;

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
        [roleId]
      );
      prerequisiteRows = edgesResult.rows;

      const branchesResult = await query<{ id: string }>(
        `SELECT id FROM technology_branches WHERE role_id = $1`,
        [roleId]
      );
      branchesCount = branchesResult.rows.length;

      if (branchesCount > 0) {
        const branchIds = branchesResult.rows.map(b => b.id);
        const optionsResult = await query<{
          branch_id: string;
          skill_id: string;
          skill_name: string;
        }>(
          `
          SELECT tbo.branch_id, tbo.skill_id, s.name AS skill_name
          FROM technology_branch_options tbo
          JOIN skills s ON s.id = tbo.skill_id
          WHERE tbo.branch_id = ANY($1::uuid[])
          `,
          [branchIds]
        );
        branchOptions = optionsResult.rows.map(opt => ({
          branch_id: opt.branch_id,
          option_id: opt.branch_id,
          name: opt.skill_name,
          skill_id: opt.skill_id
        }));
      }
    }
  } catch {
    // Database offline fallback
  }

  // Fallback data if skills empty
  if (skills.length === 0) {
    const fallbackKey = roleId.includes('ml') ? 'role-ml' : 'role-backend';
    const fallback = FALLBACK_ROADMAPS[fallbackKey];
    roleName = fallback.role_name;
    skills = fallback.skills;
    prerequisiteRows = fallback.prerequisites;
    branchesCount = fallback.branches.length;
    branchOptions = fallback.branches[0].options;
  }

  // Find remaining skills
  const remainingSkills = skills.filter((skill) => {
    const current = levelValue[skill.assessed_level || 'AWARENESS'] || 1;
    const target = levelValue[skill.target_level || 'PROFICIENT'] || 4;
    return current < target;
  });

  const remainingIds = new Set(remainingSkills.map((skill) => skill.id));

  // Build DAG for topological sort
  const graph = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const skill of remainingSkills) {
    graph.set(skill.id, []);
    indegree.set(skill.id, 0);
  }

  for (const edge of prerequisiteRows) {
    if (remainingIds.has(edge.skill_id) && remainingIds.has(edge.prerequisite_skill_id)) {
      const nextSkills = graph.get(edge.prerequisite_skill_id);
      if (nextSkills) {
        nextSkills.push(edge.skill_id);
        indegree.set(edge.skill_id, (indegree.get(edge.skill_id) || 0) + 1);
      }
    }
  }

  // Topological Sort (Kahn's algorithm)
  const queue: string[] = [];
  for (const [skillId, degree] of indegree.entries()) {
    if (degree === 0) {
      queue.push(skillId);
    }
  }

  const sortedIds: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sortedIds.push(current);

    for (const next of graph.get(current) || []) {
      const newDegree = (indegree.get(next) || 0) - 1;
      indegree.set(next, newDegree);
      if (newDegree === 0) {
        queue.push(next);
      }
    }
  }

  // Create milestones
  const skillMap = new Map(remainingSkills.map((skill) => [skill.id, skill]));
  const milestones = sortedIds.map((skillId, index) => {
    const skill = skillMap.get(skillId)!;
    const phaseNum = Math.min(Math.floor(index / 2) + 1, 5);

    return {
      id: `milestone-${index + 1}`,
      skill_id: skill.id,
      title: `Learn ${skill.name}`,
      description: `Build proficiency in ${skill.name} according to the prerequisite order.`,
      phase: phaseNum,
      phase_number: phaseNum,
      milestone_order: index + 1,
      status: index === 0 ? 'IN_PROGRESS' : 'LOCKED',
    };
  });

  // Group into phases for Frontend Developer 2
  const phasesMap = new Map<number, any>();
  for (const m of milestones) {
    if (!phasesMap.has(m.phase)) {
      phasesMap.set(m.phase, {
        phase_number: m.phase,
        title: `Phase ${m.phase}: Competency Stage`,
        milestones: []
      });
    }
    phasesMap.get(m.phase).milestones.push(m);
  }

  // Attach decision point to Phase 4 or highest phase if branches exist
  if (branchesCount > 0 && branchOptions.length > 0) {
    const targetPhaseNum = Math.max(1, Math.min(4, phasesMap.size));
    if (phasesMap.has(targetPhaseNum)) {
      const phase = phasesMap.get(targetPhaseNum);
      phase.has_decision_point = true;
      phase.decision_options = branchOptions;
    }
  }

  const phases = Array.from(phasesMap.values());

  // Readiness calculation
  let readiness = 0;
  if (skills.length > 0) {
    let total = 0;
    for (const skill of skills) {
      const current = levelValue[skill.assessed_level || 'AWARENESS'] || 1;
      const target = levelValue[skill.target_level || 'PROFICIENT'] || 4;
      total += Math.min(current / target, 1);
    }
    readiness = Math.round((total / skills.length) * 100);
  }

  try {
    await query(
      `INSERT INTO roadmap_states (student_id, role_id, readiness_pct)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, role_id)
       DO UPDATE SET readiness_pct = EXCLUDED.readiness_pct, updated_at = NOW()`,
      [studentId, roleId, readiness]
    );
  } catch (err: any) {
    // Non-blocking for offline development
  }

  return {
    role_id: roleId,
    role_name: roleName,
    readiness_pct: readiness,
    total_skills: skills.length,
    completed_skills: skills.length - remainingSkills.length,
    remaining_skills: remainingSkills.length,
    milestones,
    phases
  };
}

export async function recordBranchChoice(
  studentId: string,
  branchId: string,
  optionId?: string
) {
  let roleId = 'role-backend';
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
          WHERE (id = $1 OR branch_id = $1 OR skill_id = $1)
            AND branch_id = $2
          LIMIT 1
          `,
          [optionId, branchId]
        );

        if (optionResult.rows.length > 0) {
          skillId = optionResult.rows[0].skill_id;
        }
      }

      const existing = await query<{ id: string }>(
        `SELECT id FROM roadmap_states WHERE student_id = $1 AND role_id = $2 LIMIT 1`,
        [studentId, roleId]
      );

      if (existing.rows.length === 0) {
        const created = await query<{ id: string }>(
          `INSERT INTO roadmap_states (student_id, role_id, selected_branch_id) VALUES ($1, $2, $3) RETURNING id`,
          [studentId, roleId, branchId]
        );
        roadmapId = created.rows[0].id;
      } else {
        roadmapId = existing.rows[0].id;
        await query(
          `UPDATE roadmap_states SET selected_branch_id = $1, updated_at = NOW() WHERE id = $2`,
          [branchId, roadmapId]
        );
      }
    }
  } catch {
    // In-memory fallback
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