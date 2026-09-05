/**
 * Phase 6 — Engineering Hardening, Observability & Demonstration-Readiness Tests
 * Role: SIH 2026 Phase 6 Final Verification Suite
 * 
 * Tests the 12 critical failure-resilience, security, demo integrity,
 * and adaptive engine behaviors specified in Phase 6 requirements.
 */

import assert from 'assert';
import supertest from 'supertest';
import app from '../server';
import { demoService } from '../modules/demo/demoService';
import { generateAccessToken } from '../auth/jwt';
import { memoryStore } from '../database/store';
import { validateAndSortDAG, analyzeSkillGaps, generatePersonalizedRoadmap } from '../modules/roadmap/service';
import { BaseAdapter } from '../modules/opportunities/pipeline/adapters/base.adapter';
import { OpportunityIngestionService } from '../modules/opportunities/pipeline/ingestion.service';
import { matchOpportunitySkills } from '../modules/opportunities/pipeline/skillMatcher';
import { computeCompatibilityScore } from '../modules/recommendation/scoring.engine';
import { RawOpportunityItem, OpportunitySource } from '../modules/opportunities/pipeline/types';

const request = supertest(app);

async function runPhase6Tests() {
  console.log('🧪 Starting Phase 6 Hardening & SIH Demonstration Verification Suite...\n');

  // ============================================================================
  // TEST 1: Health Endpoints
  // ============================================================================
  console.log('TEST 1: Verification of System Health Endpoints (/health & /api/v1/health)...');
  const resHealth1 = await request.get('/health');
  assert.strictEqual(resHealth1.status, 200, '/health should return HTTP 200');
  assert.strictEqual(resHealth1.body.success, true, 'Health check envelope should have success=true');
  assert.ok(['healthy', 'degraded'].includes(resHealth1.body.data.status), 'Status must be healthy or degraded');
  assert.ok(resHealth1.body.data.services.api === 'operational', 'API service must be operational');
  assert.ok(resHealth1.body.data.services.database, 'Database status must be reported');
  assert.ok(resHealth1.body.data.uptime, 'Uptime must be reported');

  const resHealth2 = await request.get('/api/v1/health');
  assert.strictEqual(resHealth2.status, 200, '/api/v1/health should return HTTP 200');
  assert.strictEqual(resHealth2.body.data.status, resHealth1.body.data.status);
  console.log(`  ✅ Health check passed. Application mode: ${resHealth1.body.data.mode}, status: ${resHealth1.body.data.status}.`);

  // ============================================================================
  // TEST 2: Invalid Authentication Handling
  // ============================================================================
  console.log('\nTEST 2: Verification of Invalid and Expired Authentication Rejection (401)...');
  const resNoAuth = await request.get('/api/v1/profile/me');
  assert.strictEqual(resNoAuth.status, 401, 'Unauthenticated access to protected route must return 401');
  assert.strictEqual(resNoAuth.body.success, false);
  assert.strictEqual(resNoAuth.body.error.code, 'UNAUTHORIZED');

  const resBadToken = await request
    .get('/api/v1/profile/me')
    .set('Authorization', 'Bearer invalid.tampered.jwt.signature.here');
  assert.strictEqual(resBadToken.status, 401, 'Tampered token must return 401');
  assert.strictEqual(resBadToken.body.error.code, 'TOKEN_EXPIRED');
  console.log('  ✅ Unauthenticated and invalid token requests rejected with HTTP 401.');

  // ============================================================================
  // TEST 3: Student Ownership & Isolation Boundaries
  // ============================================================================
  console.log('\nTEST 3: Verification of Student Ownership & Isolation Boundaries...');
  const studentAId = 'student-alice-uuid-001';

  memoryStore.profiles.set(studentAId, {
    id: studentAId,
    user_id: studentAId,
    full_name: 'Alice Cooper',
    institution: 'NITK Surathkal',
    degree: 'B.Tech',
    academic_branch_id: 'branch-cse',
    year_of_study: 3,
    interests: ['AI'],
    selected_role_id: 'role-backend',
    readiness_pct: 45.0,
  });

  const aliceToken = generateAccessToken({ id: studentAId, email: 'alice@vidyut.in', role: 'STUDENT' });

  // Student Alice fetches own profile
  const resAlice = await request
    .get('/api/v1/profile/me')
    .set('Authorization', `Bearer ${aliceToken}`);
  assert.strictEqual(resAlice.status, 200, 'Student should fetch own profile successfully');
  assert.strictEqual(resAlice.body.data.full_name, 'Alice Cooper');

  // Institution user attempting to access student-only route receives 403
  const institutionToken = generateAccessToken({ id: 'inst-001', email: 'officer@nitk.ac.in', role: 'INSTITUTION' });
  const resForbidden = await request
    .get('/api/v1/profile/me')
    .set('Authorization', `Bearer ${institutionToken}`);
  assert.strictEqual(resForbidden.status, 403, 'Non-student role must receive 403 FORBIDDEN on student profile');
  assert.strictEqual(resForbidden.body.error.code, 'FORBIDDEN');
  console.log('  ✅ Student profile access is strictly isolated; cross-role access returns HTTP 403.');

  // ============================================================================
  // TEST 4: Admin Endpoint Protection
  // ============================================================================
  console.log('\nTEST 4: Verification of Administrative Endpoint Protection (/ingest & /unmatched-skills)...');
  // Attempt to call /ingest as student -> must return 403
  const resStudentIngest = await request
    .post('/api/v1/opportunities/ingest')
    .set('Authorization', `Bearer ${aliceToken}`)
    .send({});
  assert.strictEqual(resStudentIngest.status, 403, 'Student token must NOT be authorized to trigger ingestion');

  // Attempt to call /ingest with no auth -> must return 403
  const resNoAuthIngest = await request
    .post('/api/v1/opportunities/ingest')
    .send({});
  assert.strictEqual(resNoAuthIngest.status, 403, 'Unauthenticated caller must be rejected on /ingest');

  // Call with admin key header -> must succeed (200)
  const resAdminKeyIngest = await request
    .post('/api/v1/opportunities/ingest')
    .set('x-admin-key', 'vidyut_admin_secret_key')
    .send({ sources: ['AICTE'] });
  assert.strictEqual(resAdminKeyIngest.status, 200, 'Valid admin key must authorize pipeline ingestion');
  assert.strictEqual(resAdminKeyIngest.body.success, true);
  console.log('  ✅ Admin endpoints strictly guarded against unauthorized callers and students.');

  // ============================================================================
  // TEST 5: Demo Data Integrity & Reset Verification
  // ============================================================================
  console.log('\nTEST 5: Verification of Deterministic Demo Data Integrity & Reset Mechanism...');
  const demoState = await demoService.resetDemoEnvironment();

  assert.strictEqual(demoState.fullName, 'Ananya Sharma');
  assert.strictEqual(demoState.email, 'ananya.sharma@vidyut.ac.in');
  assert.strictEqual(demoState.academicBranchCode, 'CSE');
  assert.strictEqual(demoState.roleName, 'Backend Developer');
  assert.strictEqual(demoState.selectedBranchOption, 'FastAPI');
  assert.strictEqual(demoState.skillStates.length, 3, 'Demo student should have exactly 3 initial assessed skills');

  const progFund = demoState.skillStates.find(s => s.skillName.includes('Programming'));
  assert.strictEqual(progFund?.assessedLevel, 'PROFICIENT', 'Programming Fundamentals must be PROFICIENT');

  const python = demoState.skillStates.find(s => s.skillName.includes('Python'));
  assert.strictEqual(python?.assessedLevel, 'BEGINNER', 'Python must initially be BEGINNER');

  const sql = demoState.skillStates.find(s => s.skillName.includes('SQL'));
  assert.strictEqual(sql?.assessedLevel, 'BEGINNER', 'SQL must initially be BEGINNER');
  console.log('  ✅ Demo student Ananya Sharma initial state verified with zero taxonomy corruption.');

  // ============================================================================
  // TEST 6: Full Demo Student Journey (Adaptive Roadmap Execution)
  // ============================================================================
  console.log('\nTEST 6: Verification of Demo Student Adaptive Roadmap Generation...');
  const roadmapInitial = await generatePersonalizedRoadmap(demoState.studentId, demoState.roleId);

  assert.ok(roadmapInitial.readiness_pct > 0, 'Readiness percentage must be > 0');
  assert.ok(roadmapInitial.next_best_skill !== null, 'Next Best Skill must be deterministically identified');

  // Verify that Programming Fundamentals is mastered (skipped)
  const gapsInitial = await analyzeSkillGaps(demoState.studentId, demoState.roleId);
  const masteredNames = gapsInitial.mastered_skills.map((s: any) => s.name);
  assert.ok(masteredNames.some((n: string) => n.includes('Programming')), 'Programming Fundamentals must be mastered and skipped');

  // Verify that downstream skills with unmet prerequisites are blocked
  assert.ok(gapsInitial.blocked_skills.length > 0, 'Unmet prerequisite skills must be in blocked_skills');
  console.log(`  ✅ Adaptive roadmap generated: Readiness=${roadmapInitial.readiness_pct}%, Next Skill=${roadmapInitial.next_best_skill?.name}, Blocked=${gapsInitial.blocked_skills.length}.`);

  // ============================================================================
  // TEST 7: Scraper Source Failure Isolation
  // ============================================================================
  console.log('\nTEST 7: Verification of Scraper Source Failure Isolation in Ingestion Pipeline...');
  class BrokenAdapter extends BaseAdapter {
    readonly source: OpportunitySource = 'UNSTOP';
    async fetchRawData(): Promise<RawOpportunityItem[]> {
      throw new Error('Simulated network timeout connecting to unstop.com: Connection refused');
    }
  }

  class HealthyAdapter extends BaseAdapter {
    readonly source: OpportunitySource = 'AICTE';
    async fetchRawData(): Promise<RawOpportunityItem[]> {
      return [{
        source: 'AICTE',
        externalId: 'aicte-resilience-01',
        originalUrl: 'https://aicte-india.org',
        title: 'National Cyber Systems Internship',
        organization: 'C-DAC',
        typeRaw: 'INTERNSHIP',
        modeRaw: 'REMOTE',
        locationRaw: 'New Delhi',
        deadlineRaw: '2026-11-30',
        stipendRaw: '₹25,000 / month',
        descriptionRaw: 'Security tools and systems programming.',
        eligibilityRaw: 'B.Tech CSE/IT',
        rawSkills: ['Python', 'Linux'],
      }];
    }
  }

  const customPipeline = new OpportunityIngestionService();
  customPipeline.registerAdapter(new BrokenAdapter());
  customPipeline.registerAdapter(new HealthyAdapter());

  const resilienceResult = await customPipeline.runIngestion(['UNSTOP', 'AICTE']);
  assert.strictEqual(resilienceResult.totalExtracted, 1, 'Healthy source must succeed despite broken source failure');
  const brokenDetail = resilienceResult.details?.find(d => d.source === 'UNSTOP');
  const healthyDetail = resilienceResult.details?.find(d => d.source === 'AICTE');
  assert.strictEqual(brokenDetail?.extracted, 0, 'Broken adapter extracted 0 items');
  assert.strictEqual(healthyDetail?.extracted, 1, 'Healthy adapter extracted 1 item');
  console.log('  ✅ Failure isolation verified: broken scraper did not crash pipeline; healthy sources succeeded.');

  // ============================================================================
  // TEST 8: Fallback Fixture Pipeline Consistency
  // ============================================================================
  console.log('\nTEST 8: Verification that Fallback Fixtures Flow Through Normalization & Matching Pipeline...');
  const { InternshalaAdapter } = await import('../modules/opportunities/pipeline/adapters/internshala.adapter');
  const internshalaAdapter = new InternshalaAdapter();
  const rawFixtures = await internshalaAdapter.fetchRawData();
  assert.ok(rawFixtures.length > 0, 'Adapter fallback fixture must yield records');

  // Verify they normalize through standard normalizer
  const firstRaw = rawFixtures[0];
  const matched = await matchOpportunitySkills(firstRaw.rawSkills, firstRaw.source, firstRaw.title);
  assert.ok(matched.matchedSkillIds.length > 0, 'Fallback fixture skills must match canonical taxonomy');
  console.log(`  ✅ Fallback fixture verified: ${firstRaw.organization} processed through identical normalization pipeline.`);

  // ============================================================================
  // TEST 9: Roadmap Regeneration on Skill Mastery (Python BEGINNER -> PROFICIENT)
  // ============================================================================
  console.log('\nTEST 9: Verification of Dynamic Roadmap Adaptation upon Skill State Update...');
  const preReadiness = roadmapInitial.readiness_pct;

  // Student improves Python to PROFICIENT
  await demoService.advanceDemoStudentSkill('Python', 'PROFICIENT', 0.95);

  const roadmapRegenerated = await generatePersonalizedRoadmap(demoState.studentId, demoState.roleId);
  const gapsRegenerated = await analyzeSkillGaps(demoState.studentId, demoState.roleId);

  // Python is now in mastered_skills
  const regeneratedMastered = gapsRegenerated.mastered_skills.map((s: any) => s.name);
  assert.ok(regeneratedMastered.some((n: string) => n.includes('Python')), 'Python must now be in mastered_skills');

  // Readiness score increased
  assert.ok(
    roadmapRegenerated.readiness_pct > preReadiness,
    `Readiness must increase after mastering Python (${preReadiness}% -> ${roadmapRegenerated.readiness_pct}%)`
  );
  console.log(`  ✅ Roadmap adapted: Python mastered, readiness increased from ${preReadiness}% to ${roadmapRegenerated.readiness_pct}%.`);

  // ============================================================================
  // TEST 10: Recommendation Adaptation After Skill Update
  // ============================================================================
  console.log('\nTEST 10: Verification of Recommendation Engine Adaptation Following Skill State Change...');
  // Opportunity requiring Python
  const pythonOpportunity = {
    id: 'opp-python-payments',
    organization: 'Razorpay',
    title: 'Backend Engineering Intern',
    domainId: demoState.domainId,
    eligibilityRaw: '3rd year B.Tech',
    skillTags: [
      { skillId: 'skill-python', confidence: 1.0, requiredLevel: 'PROFICIENT' as const },
      { skillId: 'skill-sql', confidence: 0.8, requiredLevel: 'BEGINNER' as const },
    ],
  };

  const initialSkillStates = [
    { skillId: 'skill-python', assessedLevel: 'BEGINNER' as const },
    { skillId: 'skill-sql', assessedLevel: 'BEGINNER' as const },
  ];

  const profileContext = {
    selectedDomainId: demoState.domainId,
    yearOfStudy: 3,
    interests: ['Backend Systems'],
  };

  const initialScore = computeCompatibilityScore(
    initialSkillStates,
    [],
    pythonOpportunity as any,
    profileContext
  );

  const advancedSkillStates = [
    { skillId: 'skill-python', assessedLevel: 'PROFICIENT' as const },
    { skillId: 'skill-sql', assessedLevel: 'BEGINNER' as const },
  ];

  const advancedScore = computeCompatibilityScore(
    advancedSkillStates,
    [],
    pythonOpportunity as any,
    profileContext
  );

  assert.ok(
    advancedScore.total > initialScore.total,
    `Score must increase when required skill is mastered (${initialScore.total} -> ${advancedScore.total})`
  );
  assert.ok(
    advancedScore.skillMatch > initialScore.skillMatch,
    'Skill match score component must increase'
  );
  console.log(`  ✅ Recommendation score dynamically increased (${(initialScore.total * 100).toFixed(1)}% ➔ ${(advancedScore.total * 100).toFixed(1)}%).`);

  // ============================================================================
  // TEST 11: Taxonomy Pollution Protection (Unknown Opportunity Skills)
  // ============================================================================
  console.log('\nTEST 11: Verification of Zero Taxonomy Pollution for Unknown Scraped Skills...');
  const unknownSkillString = 'ExoticProprietaryLanguage2026';
  const matchResult = await matchOpportunitySkills([unknownSkillString], 'UNSTOP', 'Emerging Tech Challenge');

  assert.strictEqual(matchResult.matchedSkillIds.length, 0, 'Unknown skill must not match canonical skill IDs');
  assert.ok(matchResult.unmatchedSkills.includes(unknownSkillString), 'Unknown skill must be logged to unmatched list');

  // Verify memoryStore has logged the unmatched skill in the queue
  const queueEntry = memoryStore.unmatched_skills.get(`${unknownSkillString.toLowerCase()}:unstop`);
  assert.ok(queueEntry !== undefined, 'Unmatched skill must exist in unmatched_skills review queue');
  console.log('  ✅ Unknown skill placed strictly in review queue; canonical skill taxonomy untouched.');

  // ============================================================================
  // TEST 12: Safe Rejection of Cyclic/Invalid DAGs
  // ============================================================================
  console.log('\nTEST 12: Verification of Cyclic / Invalid DAG Cycle Detection & Safety Rejection...');
  const cyclicSkills = [
    { id: 'node-A', name: 'Skill A', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT', accuracy: 0.5 },
    { id: 'node-B', name: 'Skill B', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT', accuracy: 0.5 },
    { id: 'node-C', name: 'Skill C', category: 'PROGRAMMING', assessed_level: 'BEGINNER', target_level: 'PROFICIENT', accuracy: 0.5 },
  ];

  // A -> B -> C -> A
  const cyclicEdges = [
    { skill_id: 'node-B', prerequisite_skill_id: 'node-A' },
    { skill_id: 'node-C', prerequisite_skill_id: 'node-B' },
    { skill_id: 'node-A', prerequisite_skill_id: 'node-C' },
  ];

  const dagResult = validateAndSortDAG(cyclicSkills, cyclicEdges);
  assert.strictEqual(dagResult.isValid, false, 'Cyclic DAG must be marked invalid');
  assert.strictEqual(dagResult.hasCycle, true, 'hasCycle flag must be true');
  assert.ok(dagResult.errors.length > 0, 'Cycle errors must be reported');
  assert.ok(dagResult.errors[0].includes('Cycle detected'), 'Error message must state cycle detected');
  console.log('  ✅ Kahn DAG cycle detection successfully flagged cycle nodes without infinite looping.');

  console.log('\n===========================================================');
  console.log('🎉 ALL 12 PHASE 6 HARDENING & DEMO TESTS PASSED CLEANLY!');
  console.log('===========================================================\n');
}

runPhase6Tests().catch(err => {
  console.error('❌ Phase 6 Hardening Test Failed:', err);
  process.exit(1);
});
