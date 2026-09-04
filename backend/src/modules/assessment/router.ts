import { Router } from 'express';
import {
  generateAssessmentSession,
  submitAssessment,
} from './service';

const router = Router();

/**
 * POST /api/v1/assessments/start
 *
 * Body:
 * {
 *   "student_id": "student-uuid",
 *   "role_id": "role-uuid"
 * }
 */
router.post('/start', async (req, res) => {
  try {
    const { student_id, role_id } = req.body;

    if (!student_id || !role_id) {
      return res.status(400).json({
        message: 'student_id and role_id are required',
      });
    }

    const result = await generateAssessmentSession(
      student_id,
      role_id
    );

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('[Assessment Start Error]', error);

    return res.status(500).json({
      message: error.message || 'Failed to start assessment',
    });
  }
});

/**
 * POST /api/v1/assessments/:session_id/submit
 *
 * Body:
 * {
 *   "answers": [
 *     {
 *       "question_id": "uuid",
 *       "selected_option": "A"
 *     }
 *   ]
 * }
 */
router.post('/:session_id/submit', async (req, res) => {
  try {
    const { session_id } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: 'answers must be an array',
      });
    }

    const result = await submitAssessment(
      session_id,
      answers
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Assessment Submit Error]', error);

    return res.status(500).json({
      message: error.message || 'Failed to submit assessment',
    });
  }
});

export default router;