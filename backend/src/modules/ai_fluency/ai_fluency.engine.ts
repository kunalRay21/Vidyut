/**
 * Vidyut AI Fluency Engine
 * Simulates collaboration with generative AI models and evaluates student's critical audit, hallucination detection, and prompt refinement.
 */

import {
  AIFluencyChallenge,
  AIFluencyAuditSubmission,
  AIFluencyEvaluation,
} from './ai_fluency.types';

const AI_CHALLENGES: AIFluencyChallenge[] = [
  {
    id: 'challenge-concurrency-race',
    title: 'Audit AI Code: Wallet Deduction & Concurrency Race Condition',
    taskPrompt: 'Write a high-throughput Node.js microservice endpoint to deduct funds from a user’s digital wallet when an order is placed.',
    aiGeneratedResponse: {
      model: 'Claude 3.5 / GPT-4o Generated Draft',
      aiExplanation: 'Here is a clean and simple solution. It first checks if the user has enough balance, and if so, updates the balance and records the transaction.',
      code: `export async function deductWalletBalance(userId: string, amount: number) {
  // 1. Fetch current wallet balance
  const wallet = await db.wallet.findUnique({ where: { userId } });
  
  if (!wallet || wallet.balance < amount) {
    throw new Error('Insufficient wallet funds');
  }

  // 2. Compute new balance and update
  const updatedBalance = wallet.balance - amount;
  return await db.wallet.update({
    where: { userId },
    data: { balance: updatedBalance }
  });
}`
    },
    embeddedTraps: [
      {
        id: 'trap-race-condition',
        trapType: 'CONCURRENCY_RACE',
        description: 'Check-then-act race condition: Two concurrent requests can both read balance $100, pass the check, and deduct $50, leaving the balance at $50 instead of $0 (double-spend).',
        lineRange: 'Lines 2-11',
        severity: 'CRITICAL',
      },
      {
        id: 'trap-missing-transaction',
        trapType: 'SECURITY_VULNERABILITY',
        description: 'Missing ACID database transaction: Ledger audit record is not atomically coupled with the balance reduction.',
        lineRange: 'Lines 9-13',
        severity: 'HIGH',
      }
    ],
    promptImprovementOptions: [
      {
        id: 'p-opt-atomic',
        promptText: 'Implement wallet deduction in PostgreSQL using an atomic decrement statement with a WHERE balance >= :amount constraint, wrapped in a SERIALIZABLE transaction.',
        isOptimal: true,
        rationale: 'Specifies the exact atomic concurrency primitive and transaction isolation level to eliminate race conditions.',
      },
      {
        id: 'p-opt-vague',
        promptText: 'Make this code faster and use better variable names.',
        isOptimal: false,
        rationale: 'Does not specify concurrency constraints or transactional integrity requirements.',
      },
      {
        id: 'p-opt-cache',
        promptText: 'Store the balance in a Redis cache before writing to the database.',
        isOptimal: false,
        rationale: 'Caching without distributed locking worsens the double-spend race condition.',
      }
    ]
  },
  {
    id: 'challenge-redos-regex',
    title: 'Audit AI Code: Catastrophic Backtracking (ReDoS) Vulnerability',
    taskPrompt: 'Generate a regular expression to validate user input usernames allowing alphanumeric characters and dashes.',
    aiGeneratedResponse: {
      model: 'Codex / Gemini Pro Draft',
      aiExplanation: 'Here is an expressive regex pattern that matches alphanumeric sequences grouped with optional dashes.',
      code: `export function validateUsername(username: string): boolean {
  // Nested quantifiers cause exponential O(2^N) backtracking on non-matching strings!
  const pattern = /^([a-zA-Z0-9]+)+$/;
  return pattern.test(username);
}`
    },
    embeddedTraps: [
      {
        id: 'trap-redos',
        trapType: 'PERFORMANCE_REDOS',
        description: 'Catastrophic backtracking vulnerability: `([a-zA-Z0-9]+)+$` freezes the Node.js event loop for seconds/minutes when tested against long invalid strings like "aaaaaaaaaaaaaa!".',
        lineRange: 'Line 3',
        severity: 'CRITICAL',
      }
    ],
    promptImprovementOptions: [
      {
        id: 'p-opt-redos-safe',
        promptText: 'Write a non-backtracking regex for usernames (e.g. `^[a-zA-Z0-9]{3,30}$`) and enforce maximum length check before regex execution.',
        isOptimal: true,
        rationale: 'Eliminates nested quantifiers and bounds input length to prevent CPU exhaustion.',
      },
      {
        id: 'p-opt-regex-more',
        promptText: 'Add more special characters into the inner group `([a-zA-Z0-9!@#]+)+$`.',
        isOptimal: false,
        rationale: 'Keeps nested quantifiers, maintaining catastrophic vulnerability.',
      }
    ]
  }
];

export class AIFluencyEngine {
  /**
   * Retrieves all available AI Fluency evaluation challenges.
   */
  public static getChallenges(): AIFluencyChallenge[] {
    return AI_CHALLENGES;
  }

  /**
   * Retrieves a challenge by ID.
   */
  public static getChallengeById(id: string): AIFluencyChallenge | null {
    return AI_CHALLENGES.find(c => c.id === id) || null;
  }

  /**
   * Evaluates candidate audit submission against embedded traps and prompt refinement standards.
   */
  public static evaluateAudit(submission: AIFluencyAuditSubmission): AIFluencyEvaluation {
    const challenge = this.getChallengeById(submission.challengeId) || AI_CHALLENGES[0];

    // 1. Hallucination / Trap Catch Score (35 pts)
    let caughtCount = 0;
    for (const trapId of submission.identifiedTrapIds) {
      if (challenge.embeddedTraps.some(t => t.id === trapId)) {
        caughtCount++;
      }
    }
    const totalTraps = Math.max(1, challenge.embeddedTraps.length);
    const hallucinationCatchScore = Math.round((caughtCount / totalTraps) * 35);

    // 2. Prompt Precision Score (25 pts)
    const selectedPrompt = challenge.promptImprovementOptions.find(p => p.id === submission.selectedPromptOptionId);
    const promptPrecisionScore = selectedPrompt && selectedPrompt.isOptimal ? 25 : 8;
    const promptFeedback = selectedPrompt
      ? selectedPrompt.rationale
      : 'No prompt improvement selected.';

    // 3. Critique Analysis (25 pts)
    let codeVerificationScore = 10;
    const critiqueLower = (submission.candidateCritique || '').toLowerCase();
    if (critiqueLower.includes('race') || critiqueLower.includes('atomic') || critiqueLower.includes('redos') || critiqueLower.includes('backtrack') || critiqueLower.includes('concurren')) {
      codeVerificationScore += 8;
    }
    if (critiqueLower.includes('transaction') || critiqueLower.includes('lock') || critiqueLower.includes('decrement') || critiqueLower.includes('quantifier') || critiqueLower.includes('exponential')) {
      codeVerificationScore += 7;
    }

    // 4. Code Remediated Quality (15 pts)
    let refinementVelocityScore = 5;
    const codeLower = (submission.remediatedCode || '').toLowerCase();
    if (codeLower.includes('decrement') || codeLower.includes('where') || codeLower.includes('transaction') || codeLower.includes('atomic') || codeLower.includes('length')) {
      refinementVelocityScore = 15;
    } else if (codeLower.length > 30) {
      refinementVelocityScore = 10;
    }

    const overallFluencyScore = hallucinationCatchScore + promptPrecisionScore + codeVerificationScore + refinementVelocityScore;
    const passed = overallFluencyScore >= 70;

    let fluencyTier: AIFluencyEvaluation['fluencyTier'] = 'HIGH_HALLUCINATION_RISK';
    if (overallFluencyScore >= 85) fluencyTier = 'AI_AUGMENTED_ARCHITECT';
    else if (overallFluencyScore >= 70) fluencyTier = 'CRITICAL_VERIFIER';
    else if (overallFluencyScore >= 50) fluencyTier = 'DEVELOPING_AUDITOR';

    const critiqueFeedback = codeVerificationScore >= 20
      ? 'Exceptional critical acuity! You correctly analyzed the latent architectural risk embedded in the AI response.'
      : 'You noted general feedback, but missed identifying the subtle concurrency or security hazard.';

    return {
      challengeId: challenge.id,
      overallFluencyScore,
      hallucinationCatchScore,
      promptPrecisionScore,
      codeVerificationScore,
      refinementVelocityScore,
      fluencyTier,
      passed,
      trapsDetectedCount: caughtCount,
      totalTrapsCount: totalTraps,
      critiqueFeedback,
      promptFeedback,
      passportEvidenceAwarded: passed,
    };
  }
}
