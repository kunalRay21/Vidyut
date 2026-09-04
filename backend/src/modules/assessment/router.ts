import { Router, Request, Response } from 'express';
import { assessmentService } from './service';
import { query } from '../../database/db';
import { apiSuccess, apiError } from '../../core/responses';

const router = Router();

async function resolveStudentId(req: Request): Promise<string | undefined> {
  if (req.body && req.body.student_id) {
    return req.body.student_id;
  }
  const studentHeader = req.headers['x-student-id'];
  if (studentHeader && typeof studentHeader === 'string') {
    return studentHeader;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'vidyut_jwt_super_secret_signing_key_2026';
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded?.id) {
        const profileRes = await query<{ id: string }>(
          `SELECT id FROM student_profiles WHERE user_id = $1`,
          [decoded.id]
        );
        if (profileRes.rows.length > 0) {
          return profileRes.rows[0].id;
        }
        return decoded.id;
      }
    } catch {
      // Fallback
    }
  }
  return undefined;
}

/**
 * 1. Save Self-Ratings
 * POST /api/v1/assessments/self
 */
router.post('/self', async (req: Request, res: Response) => {
  try {
    const studentId = await resolveStudentId(req);
    const { role_id, ratings } = req.body;

    if (!role_id || !Array.isArray(ratings)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: role_id and ratings array.',
      });
    }

    const data = await assessmentService.saveSelfRatings({
      student_id: studentId,
      role_id,
      ratings,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in POST /self:', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * 2. Start Assessment Session
 * POST /api/v1/assessments/start
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const studentId = await resolveStudentId(req);
    const { role_id, test_title, total_time_seconds } = req.body;

    const data = await assessmentService.startSession({
      student_id: studentId,
      role_id,
      test_title,
      total_time_seconds,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in POST /start:', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * 3. Fetch Active Session State (State Recovery on Reload)
 * GET /api/v1/assessments/session/:session_id
 */
router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const data = await assessmentService.getSessionState(session_id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`Error in GET /session/${req.params.session_id}:`, error);
    return res.status(404).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * 4. Real-Time Single Answer Auto-Save
 * PUT /api/v1/assessments/session/:session_id/answer
 */
router.put('/session/:session_id/answer', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const { question_id, selected_option, selected_options, is_marked_for_review, time_spent_delta_seconds, coding_language, code_solution } = req.body;

    if (!question_id) {
      return res.status(400).json({
        success: false,
        error: 'question_id is required for autosave',
      });
    }

    const data = await assessmentService.saveAnswer(session_id, {
      question_id,
      selected_option,
      selected_options,
      is_marked_for_review,
      time_spent_delta_seconds,
      coding_language,
      code_solution,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error in PUT /session/${req.params.session_id}/answer:`, error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * 5. Heartbeat & Proctoring Telemetry
 * POST /api/v1/assessments/session/:session_id/heartbeat
 */
router.post('/session/:session_id/heartbeat', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const { time_remaining_seconds, tab_switch_increment, current_question_index } = req.body;

    const data = await assessmentService.recordHeartbeat(session_id, {
      time_remaining_seconds,
      tab_switch_increment,
      current_question_index,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error in POST /session/${req.params.session_id}/heartbeat:`, error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * 6. Submit Entire Assessment
 * POST /api/v1/assessments/:session_id/submit
 */
router.post('/:session_id/submit', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const { answers } = req.body;

    const data = await assessmentService.submitAssessment(session_id, {
      answers: Array.isArray(answers) ? answers : [],
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`Error in POST /${req.params.session_id}/submit:`, error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * 7. Comprehensive Post-Test Report
 * GET /api/v1/assessments/session/:session_id/report
 */
router.get('/session/:session_id/report', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const data = await assessmentService.getReport(session_id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`Error in GET /session/${req.params.session_id}/report:`, error);
    return res.status(404).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;

