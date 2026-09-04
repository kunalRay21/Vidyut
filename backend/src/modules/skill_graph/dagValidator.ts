import { query } from '../../database/db';

type SkillEdge = {
  skill_id: string;
  prerequisite_skill_id: string;
};

export async function validateSkillGraph(): Promise<boolean> {
  const result = await query<SkillEdge>(`
    SELECT skill_id, prerequisite_skill_id
    FROM skill_prerequisites
  `);

  const graph = new Map<string, string[]>();

  for (const edge of result.rows) {
    if (!graph.has(edge.prerequisite_skill_id)) {
      graph.set(edge.prerequisite_skill_id, []);
    }

    graph.get(edge.prerequisite_skill_id)!.push(edge.skill_id);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(skillId: string): boolean {
    if (visiting.has(skillId)) {
      return false; // Cycle detected
    }

    if (visited.has(skillId)) {
      return true;
    }

    visiting.add(skillId);

    for (const nextSkill of graph.get(skillId) ?? []) {
      if (!dfs(nextSkill)) {
        return false;
      }
    }

    visiting.delete(skillId);
    visited.add(skillId);

    return true;
  }

  const skills = await query<{ id: string }>(
    `SELECT id FROM skills`
  );

  for (const skill of skills.rows) {
    if (!dfs(skill.id)) {
      console.error('❌ Skill Graph contains a cycle.');
      return false;
    }
  }

  console.log('✅ Skill Graph is a valid DAG. No cycles detected.');
  return true;
}

if (require.main === module) {
  validateSkillGraph()
    .then((valid) => {
      process.exit(valid ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ DAG validation failed:', error);
      process.exit(1);
    });
}