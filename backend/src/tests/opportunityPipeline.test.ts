import assert from 'assert';
import { InternshalaAdapter } from '../modules/opportunities/pipeline/adapters/internshala.adapter';
import { UnstopAdapter } from '../modules/opportunities/pipeline/adapters/unstop.adapter';
import { AicteAdapter } from '../modules/opportunities/pipeline/adapters/aicte.adapter';
import {
  normalizeOpportunityType,
  normalizeWorkMode,
  normalizeStipend,
  normalizeLocation,
} from '../modules/opportunities/pipeline/normalizer';
import { generateFingerprint } from '../modules/opportunities/pipeline/deduplicator';
import { matchOpportunitySkills } from '../modules/opportunities/pipeline/skillMatcher';
import { opportunityIngestionService } from '../modules/opportunities/pipeline/ingestion.service';
import { memoryStore } from '../database/store';

async function runOpportunityPipelineTests() {
  console.log('🧪 Starting Phase 3 Opportunity Data Pipeline Verification Suite...\n');

  // Test 1: Adapters Extraction Test
  console.log('Test 1: Verification of Source Adapters Extraction...');
  const internshalaAdapter = new InternshalaAdapter();
  const unstopAdapter = new UnstopAdapter();
  const aicteAdapter = new AicteAdapter();

  const ishData = await internshalaAdapter.fetchRawData();
  const unstopData = await unstopAdapter.fetchRawData();
  const aicteData = await aicteAdapter.fetchRawData();

  assert.ok(ishData.length > 0, 'Internshala adapter returned 0 raw items');
  assert.strictEqual(ishData[0].source, 'INTERNSHALA', 'Source mismatch for Internshala');

  assert.ok(unstopData.length > 0, 'Unstop adapter returned 0 raw items');
  assert.strictEqual(unstopData[0].source, 'UNSTOP', 'Source mismatch for Unstop');

  assert.ok(aicteData.length > 0, 'AICTE adapter returned 0 raw items');
  assert.strictEqual(aicteData[0].source, 'AICTE', 'Source mismatch for AICTE');
  console.log(`  ✅ Adapters successfully extracted raw feeds (Internshala: ${ishData.length}, Unstop: ${unstopData.length}, AICTE: ${aicteData.length}).`);

  // Test 2: Field Normalizer Test
  console.log('\nTest 2: Verification of Opportunity Field Normalizer...');
  assert.strictEqual(normalizeOpportunityType('Full-Stack Hackathon 2026'), 'HACKATHON');
  assert.strictEqual(normalizeOpportunityType('Software Development Intern'), 'INTERNSHIP');
  assert.strictEqual(normalizeOpportunityType('Full-Time Backend Engineer'), 'JOB');

  assert.strictEqual(normalizeWorkMode('Work from Home / Remote'), 'REMOTE');
  assert.strictEqual(normalizeWorkMode('Hybrid (2 days office)'), 'HYBRID');
  assert.strictEqual(normalizeWorkMode('On-site Bengaluru'), 'ON_SITE');

  assert.strictEqual(normalizeStipend('35000'), '₹35,000 / month');
  assert.strictEqual(normalizeLocation('  Bengaluru, Karnataka  '), 'Bengaluru, Karnataka');
  console.log('  ✅ Field normalizers correctly standardized types, work modes, stipends, and locations.');

  // Test 3: Fingerprinting & Deduplication Test
  console.log('\nTest 3: Verification of SHA-256 Fingerprinting...');
  const fp1 = generateFingerprint('UNSTOP', 'ext-101', 'Razorpay', 'Backend Engineering Intern', 'Bengaluru');
  const fp2 = generateFingerprint('UNSTOP', 'ext-101', 'Razorpay', 'Backend Engineering Intern', 'Bengaluru');
  const fp3 = generateFingerprint('UNSTOP', 'ext-102', 'Razorpay', 'Backend Engineering Intern', 'Bengaluru');

  assert.strictEqual(fp1, fp2, 'Identical inputs generated different fingerprints');
  assert.notStrictEqual(fp1, fp3, 'Different external IDs generated identical fingerprint');
  console.log(`  ✅ SHA-256 fingerprint generated deterministically (${fp1}).`);

  // Test 4: Canonical Skill & Skill Alias Resolution vs Unmatched Queue
  console.log('\nTest 4: Verification of Skill Alias Resolver & Unmatched Queue...');
  const rawSkills = ['Python', 'reactjs', 'postgres', 'SuperUnknownSkill2026'];
  const matched = await matchOpportunitySkills(rawSkills, 'UNSTOP', 'Test Hackathon');

  assert.ok(matched.unmatchedSkills.includes('SuperUnknownSkill2026'), 'Unknown skill failed to enter unmatched queue');

  // Verify unknown skill did NOT get inserted into canonical skills table or memory store
  const isUnknownInSkills = Array.from(memoryStore.skill_states.values()).some(
    s => s.skill_name === 'SuperUnknownSkill2026'
  );
  assert.strictEqual(isUnknownInSkills, false, 'CRITICAL SECURITY VIOLATION: Unknown skill polluted skills store!');

  // Check unmatched queue entry
  const unmatchedKey = 'superunknownskill2026:unstop';
  const unmatchedEntry = memoryStore.unmatched_skills.get(unmatchedKey);
  assert.ok(unmatchedEntry !== undefined, 'Unmatched skill was not logged into unmatched_skills memory queue');
  assert.strictEqual(unmatchedEntry?.raw_skill_string, 'SuperUnknownSkill2026');
  console.log('  ✅ Canonical skill taxonomy preserved intact; unmatched string routed to unmatched_skills queue.');

  // Test 5: End-to-End Pipeline Execution Test
  console.log('\nTest 5: Verification of End-to-End Ingestion Pipeline...');
  const ingestionResult = await opportunityIngestionService.runIngestion(['INTERNSHALA', 'UNSTOP', 'AICTE']);

  assert.ok(ingestionResult.totalExtracted > 0, 'Total extracted should be > 0');
  assert.ok(ingestionResult.totalNormalized > 0, 'Total normalized should be > 0');
  assert.strictEqual(ingestionResult.sourcesProcessed.length, 3, 'All 3 sources should be processed');
  console.log('  ✅ Pipeline execution report summary:');
  console.log(`     - Total Extracted: ${ingestionResult.totalExtracted}`);
  console.log(`     - Total Normalized: ${ingestionResult.totalNormalized}`);
  console.log(`     - Total Saved: ${ingestionResult.totalSaved}`);
  console.log(`     - Total Duplicates Handled: ${ingestionResult.totalDuplicates}`);
  console.log(`     - Unmatched Skills Logged: ${ingestionResult.unmatchedSkillsLogged}`);

  console.log('\n🎉 ALL PHASE 3 OPPORTUNITY PIPELINE TESTS PASSED CLEANLY!\n');
}

runOpportunityPipelineTests().catch(err => {
  console.error('❌ Opportunity Pipeline Test Failed:', err);
  process.exit(1);
});
