import { query } from '../../database/db';
import { AssessmentQuestion, AssessmentResult, Discrepancy, ProficiencyLevel } from './types';

export function getProficiencyLevel(accuracy: number): ProficiencyLevel {
  if (accuracy <= 20) return 'AWARENESS';
  if (accuracy <= 45) return 'BEGINNER';
  if (accuracy <= 65) return 'INTERMEDIATE';
  if (accuracy <= 85) return 'PROFICIENT';
  return 'EXPERT';
}

const levelNumeric: Record<string, number> = {
  NOT_FAMILIAR: 0,
  AWARENESS: 1,
  BEGINNER: 2,
  AVERAGE: 3,
  INTERMEDIATE: 3,
  PROFICIENT: 4,
  EXPERT: 5
};

export async function saveSelfAssessment(
  studentId: string,
  roleId: string,
  ratings: Array<{ skill_id: string; rating: string }>
) {
  // Update student profile selected role if not set
  await query(
    `UPDATE student_profiles SET selected_role_id = COALESCE(selected_role_id, $1) WHERE id = $2`,
    [roleId, studentId]
  );

  for (const item of ratings) {
    await query(
      `
      INSERT INTO student_skill_states
        (student_id, skill_id, self_rating, assessed_level, accuracy)
      VALUES ($1, $2, $3, 'AWARENESS', 0)
      ON CONFLICT (student_id, skill_id)
      DO UPDATE SET
        self_rating = EXCLUDED.self_rating,
        updated_at = NOW()
      `,
      [studentId, item.skill_id, item.rating.toUpperCase()]
    );
  }

  return {
    student_id: studentId,
    role_id: roleId,
    ratings_count: ratings.length,
    message: 'Self-assessment ratings recorded successfully'
  };
}

export async function generateAssessmentSession(
  studentId: string,
  roleId: string
) {
  // Select up to 20 questions for the selected role
  const questions = await query<any>(
    `
    SELECT
      q.id,
      q.skill_id,
      q.question_text,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      q.difficulty,
      q.explanation
    FROM questions q
    JOIN skills s ON s.id = q.skill_id
    WHERE s.role_id = $1
    ORDER BY RANDOM()
    LIMIT 20
    `,
    [roleId]
  );

  if (questions.rows.length === 0) {
    throw new Error('No assessment questions available for this role');
  }

  const session = await query<{ id: string }>(
    `
    INSERT INTO assessment_sessions
      (student_id, role_id, status, score)
    VALUES ($1, $2, 'STARTED', 0)
    RETURNING id
    `,
    [studentId, roleId]
  );

  const sessionId = session.rows[0].id;

  for (const question of questions.rows) {
    await query(
      `
      INSERT INTO question_responses
        (session_id, question_id)
      VALUES ($1, $2)
      ON CONFLICT (session_id, question_id) DO NOTHING
      `,
      [sessionId, question.id]
    );
  }

  return {
    session_id: sessionId,
    total_questions: questions.rows.length,
    questions: questions.rows.map((q) => ({
      id: q.id,
      skill_id: q.skill_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      difficulty: q.difficulty
    }))
  };
}

export async function submitAssessment(
  sessionId: string,
  answers: Array<{
    question_id: string;
    selected_option: string;
  }>
): Promise<AssessmentResult> {
  const session = await query<{
    student_id: string;
    role_id: string;
  }>(
    `
    SELECT student_id, role_id
    FROM assessment_sessions
    WHERE id = $1
    `,
    [sessionId]
  );

  if (session.rows.length === 0) {
    throw new Error('Assessment session not found');
  }

  const { student_id, role_id } = session.rows[0];

  let correct = 0;

  for (const answer of answers) {
    const question = await query<{
      correct_option: string;
      skill_id: string;
    }>(
      `
      SELECT correct_option, skill_id
      FROM questions
      WHERE id = $1
      `,
      [answer.question_id]
    );

    if (question.rows.length === 0) continue;

    const isCorrect =
      answer.selected_option.trim().toUpperCase() ===
      question.rows[0].correct_option.trim().toUpperCase();

    if (isCorrect) correct++;

    await query(
      `
      UPDATE question_responses
      SET
        selected_option = $1,
        is_correct = $2
      WHERE session_id = $3
        AND question_id = $4
      `,
      [
        answer.selected_option.trim().toUpperCase(),
        isCorrect,
        sessionId,
        answer.question_id
      ]
    );
  }

  const total = answers.length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  await query(
    `
    UPDATE assessment_sessions
    SET
      status = 'COMPLETED',
      score = $1,
      completed_at = NOW()
    WHERE id = $2
    `,
    [accuracy, sessionId]
  );

  // Update skill states
  const skillScores = await query<{
    skill_id: string;
    skill_name: string;
    accuracy: number;
    self_rating: string | null;
  }>(
    `
    SELECT
      q.skill_id,
      s.name AS skill_name,
      AVG(
        CASE
          WHEN qr.is_correct = TRUE THEN 100
          ELSE 0
        END
      ) AS accuracy,
      ss.self_rating
    FROM question_responses qr
    JOIN questions q ON q.id = qr.question_id
    JOIN skills s ON s.id = q.skill_id
    LEFT JOIN student_skill_states ss
      ON ss.skill_id = q.skill_id AND ss.student_id = $2
    WHERE qr.session_id = $1
    GROUP BY q.skill_id, s.name, ss.self_rating
    `,
    [sessionId, student_id]
  );

  const discrepancies: Discrepancy[] = [];

  for (const skill of skillScores.rows) {
    const skillAccuracy = Number(skill.accuracy);
    const assessedLevel = getProficiencyLevel(skillAccuracy);

    await query(
      `
      INSERT INTO student_skill_states
        (student_id, skill_id, assessed_level, accuracy)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, skill_id)
      DO UPDATE SET
        assessed_level = EXCLUDED.assessed_level,
        accuracy = EXCLUDED.accuracy,
        updated_at = NOW()
      `,
      [
        student_id,
        skill.skill_id,
        assessedLevel,
        skillAccuracy
      ]
    );

    // Compute discrepancies if student had a self-rating
    if (skill.self_rating) {
      const selfVal = levelNumeric[skill.self_rating.toUpperCase()] ?? 2;
      const assessedVal = levelNumeric[assessedLevel] ?? 1;

      if (assessedVal < selfVal) {
        discrepancies.push({
          skill_id: skill.skill_id,
          self_rating: skill.self_rating as any,
          assessed_level: assessedLevel,
          message: `Growth calibration: In ${skill.skill_name}, you self-rated as ${skill.self_rating}, but assessment indicates ${assessedLevel}. Key prerequisite modules will be scheduled in your roadmap to solidify your fundamentals.`
        });
      } else if (assessedVal > selfVal) {
        discrepancies.push({
          skill_id: skill.skill_id,
          self_rating: skill.self_rating as any,
          assessed_level: assessedLevel,
          message: `Positive calibration: Excellent performance! You exceeded your self-estimate in ${skill.skill_name} (${assessedLevel} vs ${skill.self_rating}).`
        });
      }
    }
  }

  // Update overall profile readiness percentage
  try {
    const allSkillsRes = await query<{ assessed_level: string }>(
      `SELECT assessed_level FROM student_skill_states WHERE student_id = $1`,
      [student_id]
    );
    if (allSkillsRes.rows.length > 0) {
      const completed = allSkillsRes.rows.filter(r => ['PROFICIENT', 'EXPERT'].includes(r.assessed_level)).length;
      const newReadiness = Math.round((completed / allSkillsRes.rows.length) * 100);
      await query(
        `UPDATE student_profiles SET readiness_pct = $1 WHERE id = $2`,
        [newReadiness, student_id]
      );
    }
  } catch (err) {
    // Non-fatal if student_profiles row doesn't exist yet in standalone test
  }

  return {
    session_id: sessionId,
    total_questions: total,
    correct_answers: correct,
    overall_accuracy_pct: accuracy,
    skill_scores: skillScores.rows.map((skill) => {
      const skillAccuracy = Number(skill.accuracy);
      return {
        skill_id: skill.skill_id,
        correct: Math.round(skillAccuracy / 100),
        total: 1,
        accuracy_pct: skillAccuracy,
        proficiency: getProficiencyLevel(skillAccuracy)
      };
    }),
    discrepancies
  };
}

export async function getStudentEvaluatedSkills(studentId: string) {
  const result = await query(
    `
    SELECT
      s.id AS skill_id,
      s.name,
      s.category,
      COALESCE(ss.self_rating, 'AWARENESS') AS self_rating,
      COALESCE(ss.assessed_level, 'AWARENESS') AS assessed_level,
      COALESCE(ss.accuracy, 0) AS accuracy
    FROM student_skill_states ss
    JOIN skills s ON s.id = ss.skill_id
    WHERE ss.student_id = $1
    `,
    [studentId]
  );
  return result.rows;
}