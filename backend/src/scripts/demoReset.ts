/**
 * Standalone Demo Reset Script
 * Role: SIH 2026 Phase 6 Demonstration Readiness
 * 
 * Usage: npm run demo:reset
 * 
 * Safely restores the deterministic demonstration state for Ananya Sharma
 * without dropping the database or modifying canonical production taxonomy.
 */

import { demoService } from '../modules/demo/demoService';
import { logger } from '../core/logger';

async function main() {
  console.log('===========================================================');
  console.log('⚡ Vidyut SIH 2026 — Deterministic Demo Environment Reset');
  console.log('===========================================================');

  try {
    const result = await demoService.resetDemoEnvironment();

    console.log('\n✅ Demo Environment Successfully Initialized:');
    console.log(`   Student Name:           ${result.fullName}`);
    console.log(`   Login Email:            ${result.email}`);
    console.log(`   Password:               Password@123`);
    console.log(`   Academic Branch:        ${result.academicBranchName} (${result.academicBranchCode})`);
    console.log(`   Selected Career Domain: ${result.domainName}`);
    console.log(`   Selected Target Role:   ${result.roleName}`);
    console.log(`   Technology Branch:      ${result.selectedBranchOption}`);
    console.log('\n📊 Initial Skill States:');
    for (const s of result.skillStates) {
      console.log(`   - ${s.skillName.padEnd(26)} : ${s.assessedLevel.padEnd(12)} (Target: ${s.targetLevel}, Accuracy: ${(s.accuracy * 100).toFixed(0)}%)`);
    }

    console.log('\n🎯 Expected Adaptive Roadmap Behavior:');
    console.log('   - Programming Fundamentals : MASTERED (Skipped automatically)');
    console.log('   - Python & SQL             : ACTIVE FOCUS (Skill Gap to PROFICIENT)');
    console.log('   - HTTP                     : ELIGIBLE (Next candidate in topological order)');
    console.log('   - REST API & Docker        : LOCKED (Unmet prerequisites)');
    console.log('\n✨ Demo environment is 100% ready for judge presentation.\n');
    process.exit(0);
  } catch (err: any) {
    logger.error('DemoResetScript', 'Failed to reset demo state', { error: err.message });
    console.error('\n❌ Demo reset failed:', err.message);
    process.exit(1);
  }
}

main();
