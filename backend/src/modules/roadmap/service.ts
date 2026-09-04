import { query } from '../../database/db';

const levelValue: Record<string, number> = {
  AWARENESS: 1,
  BEGINNER: 2,
  INTERMEDIATE: 3,
  PROFICIENT: 4,
  EXPERT: 5,
};

export async function generatePersonalizedRoadmap(
  studentId: string,
  roleId: string
) {
 // 1. Check role

  const roleResult = await query<{ name: string }>(
    `
    SELECT name
    FROM roles
    WHERE id = $1
    `,
    [roleId]
  );

  if (roleResult.rows.length === 0) {
    throw new Error('Role not found');
  }

  // 2. Get all skills for role

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

  const skills = skillsResult.rows;

 // 3. Find remaining skills

  const remainingSkills = skills.filter((skill) => {
    const current =
      levelValue[skill.assessed_level || 'AWARENESS'] || 1;

    const target =
      levelValue[skill.target_level || 'PROFICIENT'] || 4;

    return current < target;
  });

  const remainingIds = new Set(
    remainingSkills.map((skill) => skill.id)
  );

   // 4. Get prerequisites-

  let prerequisiteRows: {
    skill_id: string;
    prerequisite_skill_id: string;
  }[] = [];

  if (remainingSkills.length > 0) {
    const edgesResult = await query<{
      skill_id: string;
      prerequisite_skill_id: string;
    }>(
      `
      SELECT
        skill_id,
        prerequisite_skill_id
      FROM skill_prerequisites
      WHERE skill_id = ANY($1::uuid[])
        AND prerequisite_skill_id = ANY($1::uuid[])
      `,
      [Array.from(remainingIds)]
    );

    prerequisiteRows = edgesResult.rows;
  }

  // 5. Build graph

  const graph = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const skill of remainingSkills) {
    graph.set(skill.id, []);
    indegree.set(skill.id, 0);
  }

  for (const edge of prerequisiteRows) {
    const nextSkills = graph.get(
      edge.prerequisite_skill_id
    );

    if (nextSkills) {
      nextSkills.push(edge.skill_id);

      indegree.set(
        edge.skill_id,
        (indegree.get(edge.skill_id) || 0) + 1
      );
    }
  }

 // 6. Topological Sort

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
      const newDegree =
        (indegree.get(next) || 0) - 1;

      indegree.set(next, newDegree);

      if (newDegree === 0) {
        queue.push(next);
      }
    }
  }

  // 7. Cycle detection

  if (sortedIds.length !== remainingSkills.length) {
    throw new Error(
      'Skill graph contains a cycle. Roadmap cannot be generated.'
    );
  }

   // 8. Create milestones

  const skillMap = new Map(
    remainingSkills.map((skill) => [
      skill.id,
      skill,
    ])
  );

  const milestones = sortedIds.map(
    (skillId, index) => {
      const skill = skillMap.get(skillId)!;

      return {
        id: `milestone-${index + 1}`,
        skill_id: skill.id,
        title: `Learn ${skill.name}`,
        description:
          `Build proficiency in ${skill.name} according to the prerequisite order.`,
        phase: index + 1,
        milestone_order: index + 1,
        status:
          index === 0
            ? 'AVAILABLE'
            : 'LOCKED',
      };
    }
  );

  // 9. Readiness calculation

  let readiness = 0;

  if (skills.length > 0) {
    let total = 0;

    for (const skill of skills) {
      const current =
        levelValue[
          skill.assessed_level || 'AWARENESS'
        ] || 1;

      const target =
        levelValue[
          skill.target_level || 'PROFICIENT'
        ] || 4;

      total += Math.min(current / target, 1);
    }

    readiness = Math.round(
      (total / skills.length) * 100
    );
  }

  return {
    role_id: roleId,
    role_name: roleResult.rows[0].name,
    readiness_pct: readiness,

    total_skills: skills.length,

    completed_skills:
      skills.length - remainingSkills.length,

    remaining_skills:
      remainingSkills.length,

    milestones,
  };
}


// RECORD TECHNOLOGY BRANCH CHOICE

export async function recordBranchChoice(
  studentId: string,
  branchId: string,
  optionId: string
) {
  // 1. Check branch

  const branchResult = await query<{
    id: string;
    role_id: string;
    name: string;
  }>(
    `
    SELECT
      id,
      role_id,
      name
    FROM technology_branches
    WHERE id = $1
    `,
    [branchId]
  );

  if (branchResult.rows.length === 0) {
    throw new Error(
      'Technology branch not found'
    );
  }

  const branch = branchResult.rows[0];

 // 2. Check option

  const optionResult = await query<{
    id: string;
    skill_id: string;
  }>(
    `
    SELECT
      id,
      skill_id
    FROM technology_branch_options
    WHERE id = $1
      AND branch_id = $2
    `,
    [optionId, branchId]
  );

  if (optionResult.rows.length === 0) {
    throw new Error(
      'Invalid technology branch option'
    );
  }

  const option = optionResult.rows[0];

  // 3. Check roadmap state

  const existing = await query<{
    id: string;
  }>(
    `
    SELECT id
    FROM roadmap_states
    WHERE student_id = $1
      AND role_id = $2
    LIMIT 1
    `,
    [
      studentId,
      branch.role_id,
    ]
  );

  let roadmapId: string;

  if (existing.rows.length === 0) {
    const created = await query<{
      id: string;
    }>(
      `
      INSERT INTO roadmap_states
        (student_id, role_id)
      VALUES ($1, $2)
      RETURNING id
      `,
      [
        studentId,
        branch.role_id,
      ]
    );

    roadmapId = created.rows[0].id;
  } else {
    roadmapId = existing.rows[0].id;
  }

  return {
    roadmap_id: roadmapId,
    branch_id: branchId,
    branch_name: branch.name,
    option_id: optionId,
    skill_id: option.skill_id,
    message:
      'Technology branch selected successfully',
  };
}