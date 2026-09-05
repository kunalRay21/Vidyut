/**
 * Vidyut Career Simulator Router
 * API endpoints for "What Should I Do Next?" simulations and transferable skill intelligence.
 */

import { Router, Request, Response } from 'express';
import { SimulatorService } from './simulator.service';
import { verifyToken } from '../../auth/jwt';

export const simulatorRouter = Router();

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
 * GET /api/v1/simulator/roles
 * Lists available target roles for simulation
 */
simulatorRouter.get('/roles', (req: Request, res: Response) => {
  try {
    const roles = SimulatorService.getSimulatableRoles();
    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    console.error('[Simulator API] Error fetching roles:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve simulatable career roles',
    });
  }
});

/**
 * POST /api/v1/simulator/simulate
 * Simulates switching to targetRoleId
 * Body: { targetRoleId: string }
 */
simulatorRouter.post('/simulate', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { targetRoleId } = req.body;

    if (!targetRoleId) {
      return res.status(400).json({
        success: false,
        error: 'targetRoleId is required for career simulation',
      });
    }

    const simulation = await SimulatorService.simulateRoleChange(studentId, targetRoleId);
    return res.status(200).json({
      success: true,
      data: simulation,
    });
  } catch (error: any) {
    console.error('[Simulator API] Simulation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run career simulation',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/simulator/adopt
 * Adopts target role as student's primary career target
 * Body: { targetRoleId: string }
 */
simulatorRouter.post('/adopt', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { targetRoleId } = req.body;

    if (!targetRoleId) {
      return res.status(400).json({
        success: false,
        error: 'targetRoleId is required to adopt career role',
      });
    }

    const result = await SimulatorService.adoptTargetRole(studentId, targetRoleId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Simulator API] Adoption error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to adopt career target',
    });
  }
});
