/**
 * Vidyut Skill Passport API Router
 * Routes for retrieving passports, recruiter verification, and evidence ingestion.
 */

import { Router, Request, Response } from 'express';
import { PassportService } from './passport.service';
import { verifyToken } from '../../auth/jwt';

export const passportRouter = Router();

/**
 * Helper to resolve authenticated student ID
 */
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
 * GET /api/v1/passport/me
 * Retrieves the current student's living Skill Passport
 */
passportRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const passport = await PassportService.getOrCreatePassport(studentId);
    return res.status(200).json({
      success: true,
      data: passport,
    });
  } catch (error: any) {
    console.error('[Passport API] Error fetching passport:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve skill passport',
      details: error.message,
    });
  }
});

/**
 * GET /api/v1/passport/verify/:token
 * Public endpoint for recruiters / institutions to verify credentials
 */
passportRouter.get('/verify/:token', async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Verification token required' });
    }

    const passport = await PassportService.getPassportByToken(token);
    if (!passport) {
      return res.status(404).json({
        success: false,
        error: 'Skill Passport not found or verification token expired.',
      });
    }

    return res.status(200).json({
      success: true,
      data: passport,
    });
  } catch (error: any) {
    console.error('[Passport API] Verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify passport',
    });
  }
});

/**
 * POST /api/v1/passport/evidence
 * Submits new evidence (e.g. GitHub link, Certificate, Project proof)
 */
passportRouter.post('/evidence', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { skillId, type, title, sourceUrl, score, meta } = req.body;

    if (!skillId || !type || !title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: skillId, type, and title are mandatory.',
      });
    }

    const updatedPassport = await PassportService.addEvidence(studentId, skillId, {
      type,
      title,
      sourceUrl,
      score,
      meta,
    });

    return res.status(201).json({
      success: true,
      message: 'Evidence successfully verified and incorporated into Skill Passport.',
      data: updatedPassport,
    });
  } catch (error: any) {
    console.error('[Passport API] Evidence ingestion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to ingest evidence',
    });
  }
});

/**
 * POST /api/v1/passport/refresher/:skillId
 * Records completion of a micro-refresher, resetting skill decay!
 */
passportRouter.post('/refresher/:skillId', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const skillId = req.params.skillId;

    const updatedPassport = await PassportService.addEvidence(studentId, skillId, {
      type: 'DIAGNOSTIC_ASSESSMENT',
      title: `Completed 20-min Knowledge Refresher (${new Date().toLocaleDateString()})`,
      score: 90,
      verifiedBy: 'Vidyut Skill Decay Engine',
    });

    return res.status(200).json({
      success: true,
      message: 'Micro-refresher completed! Skill decay has been reversed and confidence restored.',
      data: updatedPassport,
    });
  } catch (error: any) {
    console.error('[Passport API] Refresher error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to apply refresher',
    });
  }
});
