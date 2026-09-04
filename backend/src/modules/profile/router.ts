import { Router } from 'express';
import { query } from '../../database/db';

const router = Router();

router.get('/me/skills', async (req, res) => {
  try {
    const { student_id, role_id } = req.query;

    if (!student_id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id and role_id are required'
      });
    }

    const result = await query(
      `
      SELECT
        s.id AS skill_id,
        s.name AS skill_name,
        s.category,
        COALESCE(ss.assessed_level, 'AWARENESS') AS assessed_level,
        COALESCE(ss.accuracy, 0) AS accuracy
      FROM skills s
      LEFT JOIN student_skill_states ss
        ON ss.skill_id = s.id
       AND ss.student_id = $1
      WHERE s.role_id = $2
      ORDER BY s.name
      `,
      [student_id, role_id]
    );

    const totalSkills = result.rows.length;

    const completedSkills = result.rows.filter(
      (skill) =>
        ['PROFICIENT', 'EXPERT'].includes(skill.assessed_level)
    ).length;

    const readinessPct =
      totalSkills === 0
        ? 0
        : Math.round((completedSkills / totalSkills) * 100);

    res.json({
      success: true,
      data: {
        student_id,
        role_id,
        readiness_pct: readinessPct,
        total_skills: totalSkills,
        completed_skills: completedSkills,
        skills: result.rows
      }
    });
  } catch (error) {
    console.error('Profile skills API error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch student skills'
    });
  }
});

export default router;