import { query } from '../../database/db';
import { AssessmentQuestion, AssessmentResult } from './types';


export async function generateAssessmentSession(
  studentId: string,
  roleId: string
) {
  // Select 20 questions for the selected role
  const questions = await query<AssessmentQuestion>(
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
    questions: questions.rows
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
      answer.selected_option.toUpperCase() ===
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
        answer.selected_option.toUpperCase(),
        isCorrect,
        sessionId,
        answer.question_id
      ]
    );
  }

  const total = answers.length;
  const accuracy = total === 0 ? 0 : (correct / total) * 100;

  const assessedLevel = getProficiencyLevel(accuracy);

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
    accuracy: number;
  }>(
    `
    SELECT
      q.skill_id,
      AVG(
        CASE
          WHEN qr.is_correct = TRUE THEN 100
          ELSE 0
        END
      ) AS accuracy
    FROM question_responses qr
    JOIN questions q ON q.id = qr.question_id
    WHERE qr.session_id = $1
    GROUP BY q.skill_id
    `,
    [sessionId]
  );

  for (const skill of skillScores.rows) {
    const skillAccuracy = Number(skill.accuracy);
    const level = getProficiencyLevel(skillAccuracy);

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
        level,
        skillAccuracy
      ]
    );
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
      proficiency: getProficiencyLevel(skillAccuracy) as any
    };
  }),
  discrepancies: []
};
}


function getProficiencyLevel(accuracy: number): string {
  if (accuracy <= 20) return 'AWARENESS';
  if (accuracy <= 45) return 'BEGINNER';
  if (accuracy <= 65) return 'INTERMEDIATE';
  if (accuracy <= 85) return 'PROFICIENT';
  return 'EXPERT';
}