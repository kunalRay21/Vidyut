/**
 * Vidyut Simulation Service
 * Handles scenario dispatch, candidate evaluation, and Skill Passport simulation proof minting.
 */

import { SimulationEngine } from './simulation.engine';
import {
  JobSimulationScenario,
  SimulationSubmission,
  SimulationEvaluation,
} from './job_simulation.types';
import { PassportService } from '../passport/passport.service';

export class SimulationService {
  /**
   * Retrieves all available scenarios.
   */
  public static getScenarios(): JobSimulationScenario[] {
    return SimulationEngine.getAllScenarios();
  }

  /**
   * Retrieves details for a specific scenario.
   */
  public static getScenario(id: string): JobSimulationScenario | null {
    return SimulationEngine.getScenarioById(id);
  }

  /**
   * Evaluates submission and attaches verified simulation evidence to student passport if passed.
   */
  public static async evaluateAndRecord(
    studentId: string,
    submission: SimulationSubmission
  ): Promise<SimulationEvaluation> {
    const evaluation = SimulationEngine.evaluateSubmission(submission);
    const scenario = SimulationEngine.getScenarioById(submission.scenarioId);

    if (evaluation.passed && scenario) {
      try {
        const skillTargetId = scenario.id === 'sec-invoice-idor' ? 'skill-auth-jwt' : 'skill-sql';

        await PassportService.addEvidence(studentId, skillTargetId, {
          type: 'PRACTICAL_SIMULATION',
          title: `Real-World Simulation Passed: ${scenario.title}`,
          sourceUrl: `/simulations/proof/${scenario.id}`,
          verifiedBy: 'Vidyut Production Simulation Sandbox',
          score: evaluation.overallScore,
          meta: {
            scenarioId: scenario.id,
            readinessTier: evaluation.readinessTier,
            difficulty: scenario.difficulty,
          },
        });
        evaluation.passportEvidenceAwarded = true;
      } catch (err) {
        console.warn('[SimulationService] Could not auto-record passport evidence:', err);
      }
    }

    return evaluation;
  }
}
