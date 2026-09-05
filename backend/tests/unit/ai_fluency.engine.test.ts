import { AIFluencyEngine } from '../../src/modules/ai_fluency/ai_fluency.engine';
import { AIFluencyService } from '../../src/modules/ai_fluency/ai_fluency.service';
import { PassportService } from '../../src/modules/passport/passport.service';

describe('Feature 8: AI Usage & AI Fluency Score Engine', () => {
  it('retrieves AI coding challenges with embedded latent traps', () => {
    const challenges = AIFluencyEngine.getChallenges();
    expect(challenges.length).toBeGreaterThanOrEqual(2);

    const raceChallenge = challenges.find(c => c.id === 'challenge-concurrency-race');
    expect(raceChallenge).toBeDefined();
    expect(raceChallenge?.embeddedTraps.length).toBeGreaterThanOrEqual(2);
    expect(raceChallenge?.aiGeneratedResponse.code).toContain('wallet.balance - amount');
    expect(raceChallenge?.promptImprovementOptions.length).toBeGreaterThan(1);
  });

  it('evaluates critical audit and awards AI_AUGMENTED_ARCHITECT tier for safe remediation', () => {
    const evaluation = AIFluencyEngine.evaluateAudit({
      challengeId: 'challenge-concurrency-race',
      identifiedTrapIds: ['trap-race-condition', 'trap-missing-transaction'],
      selectedPromptOptionId: 'p-opt-atomic',
      candidateCritique: 'The AI draft contains a critical check-then-act race condition causing double-spend under concurrent requests. Needs atomic balance decrement.',
      remediatedCode: `
        return await db.$transaction(async (tx) => {
          const result = await tx.$executeRaw\`
            UPDATE wallets SET balance = balance - \${amount}
            WHERE user_id = \${userId} AND balance >= \${amount}
          \`;
          if (result === 0) throw new Error('Insufficient funds');
        });
      `,
    });

    expect(evaluation.passed).toBe(true);
    expect(evaluation.overallFluencyScore).toBeGreaterThanOrEqual(85);
    expect(evaluation.fluencyTier).toBe('AI_AUGMENTED_ARCHITECT');
    expect(evaluation.trapsDetectedCount).toBe(2);
    expect(evaluation.passportEvidenceAwarded).toBe(true);
  });

  it('penalizes blind acceptance of flawed AI drafts with HIGH_HALLUCINATION_RISK', () => {
    const evaluation = AIFluencyEngine.evaluateAudit({
      challengeId: 'challenge-concurrency-race',
      identifiedTrapIds: [], // caught nothing
      selectedPromptOptionId: 'p-opt-vague',
      candidateCritique: 'The code looks fine, maybe just rename wallet to userWallet.',
      remediatedCode: '// No changes needed',
    });

    expect(evaluation.passed).toBe(false);
    expect(evaluation.overallFluencyScore).toBeLessThan(50);
    expect(evaluation.fluencyTier).toBe('HIGH_HALLUCINATION_RISK');
    expect(evaluation.passportEvidenceAwarded).toBe(false);
  });

  it('records verified AI fluency evidence in Skill Passport upon passing', async () => {
    const studentId = 'student-ai-fluency-test';

    const evaluation = await AIFluencyService.evaluateAndRecord(studentId, {
      challengeId: 'challenge-redos-regex',
      identifiedTrapIds: ['trap-redos'],
      selectedPromptOptionId: 'p-opt-redos-safe',
      candidateCritique: 'Nested quantifiers cause exponential ReDoS backtracking. Must bound length and use non-backtracking pattern.',
      remediatedCode: `
        if (username.length > 30) return false;
        return /^[a-zA-Z0-9]{3,30}$/.test(username);
      `,
    });

    expect(evaluation.passed).toBe(true);
    expect(evaluation.passportEvidenceAwarded).toBe(true);

    const passport = await PassportService.getOrCreatePassport(studentId);
    const gitSkill = passport.skills.find((s: any) => s.skillId === 'skill-git');
    expect(gitSkill).toBeDefined();
    const aiProof = gitSkill?.evidenceItems.find((e: any) => e.title.includes('AI Fluency Verified'));
    expect(aiProof).toBeDefined();
  });
});
