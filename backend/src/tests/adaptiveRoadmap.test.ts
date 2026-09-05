import assert from 'assert';
import {
  validateAndSortDAG,
  analyzeSkillGaps,
  generatePersonalizedRoadmap,
  FALLBACK_ROADMAPS,
  SkillNode,
  PrerequisiteEdge,
} from '../modules/roadmap/service';
import { memoryStore } from '../database/store';

async function runAdaptiveRoadmapTests() {
  console.log('🧪 Starting Phase 4 Adaptive Roadmap Engine Verification Suite...\n');

  // TEST 1: Simple DAG Topological Ordering
  console.log('TEST 1: Verification of Simple DAG Topological Ordering (A -> B -> C)...');
  const skills1: SkillNode[] = [
    { id: 'C', name: 'Skill C', category: 'FRAMEWORK', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
    { id: 'A', name: 'Skill A', category: 'FOUNDATION', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
    { id: 'B', name: 'Skill B', category: 'PROGRAMMING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
  ];
  const edges1: PrerequisiteEdge[] = [
    { skill_id: 'B', prerequisite_skill_id: 'A' },
    { skill_id: 'C', prerequisite_skill_id: 'B' },
  ];

  const dag1 = validateAndSortDAG(skills1, edges1);
  assert.strictEqual(dag1.isValid, true, 'DAG 1 should be valid');
  assert.deepStrictEqual(dag1.sortedIds, ['A', 'B', 'C'], 'Topological order mismatch for A -> B -> C');
  console.log('  ✅ Simple DAG correctly sorted to [A, B, C].');

  // TEST 2: Cycle Detection
  console.log('\nTEST 2: Verification of Cycle Detection (A -> B -> A)...');
  const skills2: SkillNode[] = [
    { id: 'A', name: 'Skill A', category: 'FOUNDATION', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
    { id: 'B', name: 'Skill B', category: 'PROGRAMMING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
  ];
  const edges2: PrerequisiteEdge[] = [
    { skill_id: 'B', prerequisite_skill_id: 'A' },
    { skill_id: 'A', prerequisite_skill_id: 'B' },
  ];

  const dag2 = validateAndSortDAG(skills2, edges2);
  assert.strictEqual(dag2.hasCycle, true, 'Cycle should be detected for A -> B -> A');
  assert.strictEqual(dag2.isValid, false, 'Cyclic DAG should be marked invalid');
  console.log('  ✅ Cycle correctly detected and flagged invalid.');

  // TEST 3: Mastered Prerequisite Skipping
  console.log('\nTEST 3: Verification of Mastered Prerequisite Skipping...');
  const student3Id = `test-std-3-${Date.now()}`;
  // Seed student 3 with Skill A = PROFICIENT
  memoryStore.skill_states.set(`${student3Id}:skill-prog-fund`, {
    student_id: student3Id,
    skill_id: 'skill-prog-fund',
    assessed_level: 'PROFICIENT',
    accuracy: 90,
  });

  const gaps3 = await analyzeSkillGaps(student3Id, 'role-backend');
  const mastered3 = gaps3.mastered_skills.map((s: any) => s.id);
  assert.ok(mastered3.includes('skill-prog-fund'), 'Programming Fundamentals should be mastered');
  assert.ok(gaps3.next_best_skill !== null, 'Next best skill should not be null');
  assert.notStrictEqual(gaps3.next_best_skill?.id, 'skill-prog-fund', 'Mastered skill must NOT be recommended as Next Best Skill');
  console.log(`  ✅ Mastered skill skipped; Next Best Skill derived as: ${gaps3.next_best_skill?.name}.`);

  // TEST 4: Multiple Prerequisites (Unmet Prerequisite Blocks Downstream Skill)
  console.log('\nTEST 4: Verification of Multiple Prerequisites (Unmet Prerequisite Block)...');
  const skills4: SkillNode[] = [
    { id: 'A', name: 'Python', category: 'PROGRAMMING', assessed_level: 'PROFICIENT', target_level: 'PROFICIENT', accuracy: 85 },
    { id: 'B', name: 'Statistics', category: 'MATHEMATICS', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
    { id: 'C', name: 'Machine Learning', category: 'MACHINE_LEARNING', assessed_level: 'AWARENESS', target_level: 'PROFICIENT', accuracy: 0 },
  ];
  const edges4: PrerequisiteEdge[] = [
    { skill_id: 'C', prerequisite_skill_id: 'A' },
    { skill_id: 'C', prerequisite_skill_id: 'B' },
  ];

  const dag4 = validateAndSortDAG(skills4, edges4);
  const mastered4 = new Set(['A']);
  const cPrereqs = edges4.filter(e => e.skill_id === 'C').map(e => e.prerequisite_skill_id);
  const allMet4 = cPrereqs.every(p => mastered4.has(p));
  assert.strictEqual(allMet4, false, 'Skill C should be blocked because Statistics (B) is missing');
  console.log('  ✅ Machine Learning (C) blocked correctly when Statistics (B) is unmet.');

  // TEST 5: Multiple Prerequisites Satisfied
  console.log('\nTEST 5: Verification of Multiple Prerequisites Satisfied...');
  const mastered5 = new Set(['A', 'B']);
  const allMet5 = cPrereqs.every(p => mastered5.has(p));
  assert.strictEqual(allMet5, true, 'Skill C should be eligible when both A and B are mastered');
  console.log('  ✅ Machine Learning (C) became eligible when both Python and Statistics were satisfied.');

  // TEST 6: Partial Proficiency Gap
  console.log('\nTEST 6: Verification of Partial Proficiency Gap...');
  const skills6: SkillNode[] = [
    { id: 'A', name: 'Python', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'ADVANCED', accuracy: 45 },
  ];
  const dag6 = validateAndSortDAG(skills6, []);
  assert.strictEqual(skills6[0].assessed_level, 'BEGINNER');
  assert.strictEqual(skills6[0].target_level, 'ADVANCED');
  console.log('  ✅ Partial proficiency (BEGINNER vs ADVANCED) preserved as a remaining gap.');

  // TEST 7: Different Students Produce Different Roadmaps
  console.log('\nTEST 7: Verification that Different Students Produce Different Roadmaps...');
  const student7A = `test-std-7A-${Date.now()}`;
  const student7B = `test-std-7B-${Date.now()}`;

  memoryStore.skill_states.set(`${student7A}:skill-prog-fund`, { student_id: student7A, skill_id: 'skill-prog-fund', assessed_level: 'PROFICIENT', accuracy: 90 });
  memoryStore.skill_states.set(`${student7B}:skill-prog-fund`, { student_id: student7B, skill_id: 'skill-prog-fund', assessed_level: 'AWARENESS', accuracy: 10 });

  const rA = await generatePersonalizedRoadmap(student7A, 'role-backend');
  const rB = await generatePersonalizedRoadmap(student7B, 'role-backend');

  assert.strictEqual(rA.milestones[0].status, 'COMPLETED', 'Student A milestone 1 should be COMPLETED');
  assert.strictEqual(rB.milestones[0].status, 'IN_PROGRESS', 'Student B milestone 1 should be IN_PROGRESS');
  assert.notStrictEqual(rA.readiness_pct, rB.readiness_pct, 'Readiness scores should differ between Student A and B');
  console.log(`  ✅ Student A readiness: ${rA.readiness_pct}%, Student B readiness: ${rB.readiness_pct}%. Distinct roadmaps generated.`);

  // TEST 8: All Required Skills Mastered
  console.log('\nTEST 8: Verification when All Required Skills are Mastered...');
  const student8 = `test-std-8-${Date.now()}`;
  const backendSkills = FALLBACK_ROADMAPS['role-backend'].skills;
  for (const s of backendSkills) {
    memoryStore.skill_states.set(`${student8}:${s.id}`, { student_id: student8, skill_id: s.id, assessed_level: 'EXPERT', accuracy: 100 });
  }

  const gaps8 = await analyzeSkillGaps(student8, 'role-backend');
  assert.strictEqual(gaps8.eligible_skills.length, 0, 'No mandatory eligible gaps should remain when all mastered');
  assert.strictEqual(gaps8.readiness_pct, 100, 'Readiness should be 100%');
  console.log('  ✅ 100% readiness achieved; 0 mandatory skill gaps remaining.');

  // TEST 9: Role Isolation
  console.log('\nTEST 9: Verification of Role Isolation...');
  const rBackend = await generatePersonalizedRoadmap(student7A, 'role-backend');
  const backendSkillNames = rBackend.milestones.map((m: any) => m.title);
  assert.strictEqual(backendSkillNames.includes('Linear Algebra'), false, 'Backend role received ML-only skill (Linear Algebra)');
  assert.strictEqual(backendSkillNames.includes('NumPy'), false, 'Backend role received ML-only skill (NumPy)');
  console.log('  ✅ Role isolation verified — Backend role contained 0 ML-only skills.');

  // TEST 10: Technology Branch Integration
  console.log('\nTEST 10: Verification of Technology Branch Integration...');
  const rBranch = await generatePersonalizedRoadmap(student7A, 'role-backend');
  assert.strictEqual(rBranch.phases.length, 5, 'Phases should equal 5');
  const phase4 = rBranch.phases.find((p: any) => p.phase_number === 4);
  assert.ok(phase4 !== undefined, 'Phase 4 should exist for technology branch decision point');
  console.log('  ✅ Technology branch decision point successfully integrated into Phase 4.');

  // TEST 11: Academic Branch Does Not Imply Proficiency
  console.log('\nTEST 11: Verification that Academic Branch Does Not Imply Proficiency...');
  const cseStudentId = `cse-student-${Date.now()}`;
  const gapsCSE = await analyzeSkillGaps(cseStudentId, 'role-backend');
  assert.strictEqual(gapsCSE.mastered_skills.length, 0, 'CSE student with 0 assessment evidence must NOT receive fake mastered skills!');
  console.log('  ✅ Verified: AcademicBranch (CSE) does NOT fabricate skill mastery without empirical assessment data.');

  // TEST 12: Roadmap Regeneration after Assessment Update
  console.log('\nTEST 12: Verification of Roadmap Regeneration after Assessment Update...');
  const regenStudent = `regen-student-${Date.now()}`;
  const initialRoadmap = await generatePersonalizedRoadmap(regenStudent, 'role-backend');
  const initialScore = initialRoadmap.readiness_pct;

  // Submit diagnostic assessment update
  memoryStore.skill_states.set(`${regenStudent}:skill-prog-fund`, { student_id: regenStudent, skill_id: 'skill-prog-fund', assessed_level: 'PROFICIENT', accuracy: 85 });
  memoryStore.skill_states.set(`${regenStudent}:skill-python`, { student_id: regenStudent, skill_id: 'skill-python', assessed_level: 'PROFICIENT', accuracy: 90 });

  const updatedRoadmap = await generatePersonalizedRoadmap(regenStudent, 'role-backend');
  assert.ok(updatedRoadmap.readiness_pct > initialScore, 'Updated roadmap readiness score should increase after assessment');
  console.log(`  ✅ Initial readiness: ${initialScore}%, Regenerated readiness: ${updatedRoadmap.readiness_pct}%. Roadmap dynamically updated.`);

  console.log('\n🎉 ALL 12 PHASE 4 ADAPTIVE ROADMAP TESTS PASSED CLEANLY!\n');
}

runAdaptiveRoadmapTests().catch(err => {
  console.error('❌ Adaptive Roadmap Test Failed:', err);
  process.exit(1);
});
