/**
 * Vidyut Job Readiness Simulation Router
 * API endpoints for real-world sandbox incident scenarios and multi-vector evaluations.
 */

import { Router, Request, Response } from 'express';
import { SimulationService } from './simulation.service';
import { verifyToken } from '../../auth/jwt';

export const simulationRouter = Router();

function resolveStudentId(req: Request): string {
  const directId = (req.headers['x-student-id'] as string) || (req.query['studentId'] as string);
  if (directId && directId.trim()) return directId.trim();

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) return decoded.id;
    } catch {
      // ignore
    }
  }

  return 'student-demo';
}

/**
 * GET /api/v1/job-simulations/scenarios
 * Returns all active simulation scenarios
 */
simulationRouter.get('/scenarios', (req: Request, res: Response) => {
  try {
    const scenarios = SimulationService.getScenarios();
    return res.status(200).json({
      success: true,
      data: scenarios,
    });
  } catch (error: any) {
    console.error('[Simulation API] Error fetching scenarios:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve simulation scenarios',
    });
  }
});

/**
 * GET /api/v1/job-simulations/scenario/:id
 * Returns a single scenario by ID
 */
simulationRouter.get('/scenario/:id', (req: Request, res: Response) => {
  try {
    const scenario = SimulationService.getScenario(req.params.id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Simulation scenario not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: scenario,
    });
  } catch (error: any) {
    console.error('[Simulation API] Error fetching scenario:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve scenario details',
    });
  }
});

/**
 * POST /api/v1/job-simulations/evaluate
 * Evaluates candidate submission and records to Skill Passport
 * Body: SimulationSubmission
 */
simulationRouter.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const submission = req.body;

    if (!submission || !submission.scenarioId || !submission.selectedRootCauseId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission payload. scenarioId and selectedRootCauseId are required.',
      });
    }

    const evaluation = await SimulationService.evaluateAndRecord(studentId, submission);
    return res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error('[Simulation API] Error evaluating submission:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate simulation submission',
    });
  }
});
