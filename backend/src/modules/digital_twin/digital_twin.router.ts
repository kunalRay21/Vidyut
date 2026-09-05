/**
 * Vidyut Digital Twin Router
 * API endpoints for Career Readiness Digital Twin and 12-Hour Opportunity Prep Plans.
 */

import { Router, Request, Response } from 'express';
import { DigitalTwinService } from './digital_twin.service';
import { verifyToken } from '../../auth/jwt';

export const digitalTwinRouter = Router();

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
 * GET /api/v1/digital-twin/twin
 * Retrieves live explainable Digital Twin profile
 */
digitalTwinRouter.get('/twin', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const twin = await DigitalTwinService.getStudentDigitalTwin(studentId);
    return res.status(200).json({
      success: true,
      data: twin,
    });
  } catch (error: any) {
    console.error('[DigitalTwin API] Error fetching twin:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve career readiness digital twin',
    });
  }
});

/**
 * POST /api/v1/digital-twin/what-if
 * Runs what-if counterfactual scenario projection
 * Body: WhatIfScenarioInput
 */
digitalTwinRouter.post('/what-if', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const input = req.body;

    const result = await DigitalTwinService.simulateWhatIf(studentId, input);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[DigitalTwin API] Error simulating what-if:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run what-if scenario projection',
    });
  }
});

/**
 * GET /api/v1/digital-twin/prep-plan/:opportunityId
 * Returns 12-hour precision interview prep plan
 */
digitalTwinRouter.get('/prep-plan/:opportunityId', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const plan = await DigitalTwinService.getPrepPlan(studentId, req.params.opportunityId);
    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('[DigitalTwin API] Error generating prep plan:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate 12-hour prep plan',
    });
  }
});
