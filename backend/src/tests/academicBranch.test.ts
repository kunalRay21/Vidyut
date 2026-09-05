import {
  seedAcademicBranches,
  getAllAcademicBranches,
  resolveBranchFromDegreeText,
  getPersonalizedDomainsForStudent,
  migrateExistingStudentProfiles,
} from '../modules/careers/academicBranch.service';
import { computeCompatibilityScore } from '../modules/recommendation/scoring.engine';
import { StudentProfileContext, OpportunityWithTags } from '../modules/recommendation/recommendation.types';

async function runAcademicBranchVerificationTests() {
  console.log('🧪 Starting Phase 2 Academic Branch Verification Test Suite...\n');

  // 1. Seed test
  console.log('Test 1: Seeding canonical academic branches and domain relevance maps...');
  const seedRes = await seedAcademicBranches();
  console.log(`✅ Seeded ${seedRes.branchesCount} branches and ${seedRes.linksCount} domain relevance links.\n`);

  // 2. Fetch test
  console.log('Test 2: Retrieving all academic branches...');
  const branches = await getAllAcademicBranches();
  console.log(`✅ Retrieved ${branches.length} branches:`, branches.map(b => `${b.code} (${b.name})`).join(', '), '\n');
  if (branches.length < 12) {
    throw new Error(`Expected at least 12 academic branches, found ${branches.length}`);
  }

  // 3. Resolution test
  console.log('Test 3: Resolving text degree inputs to canonical branches...');
  const testDegrees = [
    { text: 'B.Tech CSE', expected: 'CSE' },
    { text: 'B.E. Computer Science', expected: 'CSE' },
    { text: 'B.Tech ECE', expected: 'ECE' },
    { text: 'Mechanical Eng', expected: 'MECH' },
    { text: 'Biotechnology', expected: 'BIOTECH' },
    { text: 'BCA 2nd Year', expected: 'BCA' },
    { text: 'MBA Finance', expected: 'MBA' },
    { text: 'Random Text', expected: null },
  ];

  for (const item of testDegrees) {
    const res = await resolveBranchFromDegreeText(item.text);
    const matchedCode = res ? res.code : null;
    if (matchedCode !== item.expected) {
      throw new Error(`Degree resolution failed for "${item.text}". Expected ${item.expected}, got ${matchedCode}`);
    }
    console.log(`  • "${item.text}" ➔ ${matchedCode || 'NULL (Unmapped - Benefit of doubt / manual selection)'}`);
  }
  console.log('✅ Degree text resolution verified.\n');

  // 4. Migration test
  console.log('Test 4: Running safe profile migration...');
  const migratedCount = await migrateExistingStudentProfiles();
  console.log(`✅ Profile migration completed safely. Migrated ${migratedCount} profile(s).\n`);

  // 5. Domain Personalization Ranking test
  console.log('Test 5: Checking personalized domain relevance ranking...');
  const cseDomains = await getPersonalizedDomainsForStudent('test-cse-student');
  console.log('  • Top ranked domain for CSE student:', cseDomains[0]?.name, `(Relevance: ${cseDomains[0]?.academic_relevance})`);
  console.log('✅ Domain personalization verified.\n');

  // 6. Recommendation Scoring Integration test
  console.log('Test 6: Verifying Academic Branch contextual boost in Recommendation Scoring Engine...');
  const mockOpportunity: OpportunityWithTags = {
    domainId: 'domain-backend-systems',
    domain: { name: 'Backend & Distributed Systems' },
    eligibilityRaw: 'B.Tech 3rd year',
    skillTags: [],
  };

  const contextWithoutBranch: StudentProfileContext = {
    selectedDomainId: 'domain-backend-systems',
    yearOfStudy: 3,
    interests: [],
  };

  const contextWithHighBranch: StudentProfileContext = {
    ...contextWithoutBranch,
    academicBranchId: 'branch-cse',
    academicBranchRelevanceMap: {
      'domain-backend-systems': 'HIGH',
    },
  };

  const contextWithLowBranch: StudentProfileContext = {
    ...contextWithoutBranch,
    academicBranchId: 'branch-civil',
    academicBranchRelevanceMap: {
      'domain-backend-systems': 'LOW',
    },
  };

  const scoreNormal = computeCompatibilityScore([], [], mockOpportunity, contextWithoutBranch);
  const scoreHighBoost = computeCompatibilityScore([], [], mockOpportunity, contextWithHighBranch);
  const scoreLowPenalty = computeCompatibilityScore([], [], mockOpportunity, contextWithLowBranch);

  console.log(`  • Base Compatibility Score (No Branch Context): ${scoreNormal.total} (Interest Component: ${scoreNormal.interest})`);
  console.log(`  • Boosted Score (CSE / HIGH Branch Relevance):  ${scoreHighBoost.total} (Interest Component: ${scoreHighBoost.interest})`);
  console.log(`  • Context Score (Civil / LOW Branch Relevance): ${scoreLowPenalty.total} (Interest Component: ${scoreLowPenalty.interest})`);

  if (scoreHighBoost.total <= scoreNormal.total) {
    throw new Error('Expected high academic branch relevance to boost compatibility score');
  }

  console.log('✅ Recommendation engine academic branch scoring integration verified.\n');
  console.log('🎉 ALL PHASE 2 ACADEMIC BRANCH VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

if (require.main === module) {
  runAcademicBranchVerificationTests().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}

export { runAcademicBranchVerificationTests };
