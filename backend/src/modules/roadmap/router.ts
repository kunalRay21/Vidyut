import {
  Router,
  Request,
  Response,
} from 'express';

import {
  generatePersonalizedRoadmap,
  recordBranchChoice,
} from './service';

const router = Router();


// GET ROADMAP
router.get(
  '/',
  async (req: Request, res: Response) => {
    try {
      const studentId = String(
        req.query.student_id || ''
      );

      const roleId = String(
        req.query.role_id || ''
      );

      if (!studentId || !roleId) {
        return res.status(400).json({
          success: false,
          message:
            'student_id and role_id are required',
        });
      }

      const roadmap =
        await generatePersonalizedRoadmap(
          studentId,
          roleId
        );

      return res.status(200).json({
        success: true,
        data: roadmap,
      });

    } catch (error: any) {
      console.error(
        '[Roadmap Error]',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          'Failed to generate roadmap',
      });
    }
  }
);


// TECHNOLOGY BRANCH SELECTION

router.post(
  '/branch',
  async (req: Request, res: Response) => {
    try {
      const {
        student_id,
        branch_id,
        option_id,
      } = req.body;

      if (
        !student_id ||
        !branch_id ||
        !option_id
      ) {
        return res.status(400).json({
          success: false,
          message:
            'student_id, branch_id and option_id are required',
        });
      }

      const result =
        await recordBranchChoice(
          student_id,
          branch_id,
          option_id
        );

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error: any) {
      console.error(
        '[Roadmap Branch Error]',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          'Failed to select branch',
      });
    }
  }
);


export default router;