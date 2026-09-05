/**
 * Vidyut AI Fluency Service
 * Manages challenge dispatch, audit submissions, and Skill Passport AI Augmented badge minting.
 */

import { AIFluencyEngine } from './ai_fluency.engine';
import {
  AIFluencyChallenge,
  AIFluencyAuditSubmission,
  AIFluencyEvaluation,
} from './ai_fluency.types';
import { PassportService } from '../passport/passport.service';

export class AIFluencyService {
  /**
   * Retrieves all available AI Fluency evaluation challenges.
   */
  public static getChallenges(): AIFluencyChallenge[] {
    return AIFluencyEngine.getChallenges();
  }

  /**
   * Evaluates candidate audit and attaches verified AI Fluency proof to Skill Passport if passed.
   */
  public static async evaluateAndRecord(
    studentId: string,
    submission: AIFluencyAuditSubmission
  ): Promise<AIFluencyEvaluation> {
    const evaluation = AIFluencyEngine.evaluateAudit(submission);
    const challenge = AIFluencyEngine.getChallengeById(submission.challengeId);

    if (evaluation.passed && challenge) {
      try {
        await PassportService.addEvidence(studentId, 'skill-git', {
          type: 'PRACTICAL_SIMULATION',
          title: `AI Fluency Verified: ${challenge.title}`,
          sourceUrl: `/ai-fluency/verify/${challenge.id}`,
          verifiedBy: 'Vidyut AI Fluency & Augmented Engineering Engine',
          score: evaluation.overallFluencyScore,
          meta: {
            challengeId: challenge.id,
            fluencyTier: evaluation.fluencyTier,
            trapsDetected: `${evaluation.trapsDetectedCount}/${evaluation.totalTrapsCount}`,
          },
        });
        evaluation.passportEvidenceAwarded = true;
      } catch (err) {
        console.warn('[AIFluencyService] Could not auto-record passport evidence:', err);
      }
    }

    return evaluation;
  }
}
