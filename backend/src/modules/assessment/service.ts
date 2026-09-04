import { randomUUID } from 'crypto';
import {
  getAllQuestions,
  getQuestionById,
  inMemorySessions,
  inMemoryResponses,
  inMemorySkillStates,
  inMemorySelfRatings,
  StoredSession,
  StoredResponse,
} from '../../database/store';
import {
  ProficiencyLevel,
  SelfRatingLevel,
  ClientQuestion,
  SelfRatingPayload,
  StartSessionPayload,
  AnswerAutoSavePayload,
  HeartbeatPayload,
  SubmitAssessmentPayload,
  SkillScoreSummary,
  DiscrepancyReport,
  FullExamReport,
  QuestionReviewItem,
} from './types';

// ==============================================================================
// Calibration & Scoring Logic
// ==============================================================================

export function getProficiencyLevel(accuracy: number): ProficiencyLevel {
  if (accuracy <= 20) return 'AWARENESS';
  if (accuracy <= 45) return 'BEGINNER';
  if (accuracy <= 65) return 'INTERMEDIATE';
  if (accuracy <= 85) return 'PROFICIENT';
  return 'EXPERT';
}

const RATING_WEIGHTS: Record<string, number> = {
  NOT_FAMILIAR: 1,
  AWARENESS: 1,
  BEGINNER: 2,
  AVERAGE: 3,
  INTERMEDIATE: 3,
  GOOD: 4,
  PROFICIENT: 4,
  EXPERT: 5,
};

// ==============================================================================
// Assessment Engine Service
// ==============================================================================

export class AssessmentService {
  /**
   * 1. Save Self-Ratings (Intake Step)
   */
  async saveSelfRatings(payload: SelfRatingPayload) {
    const studentId = payload.student_id || 'guest-student-001';
    const ratingsMap: Record<string, string> = {};

    payload.ratings.forEach(r => {
      ratingsMap[r.skill_id] = r.rating;
    });

    inMemorySelfRatings.set(studentId, ratingsMap);

    return {
      student_id: studentId,
      role_id: payload.role_id,
      ratings_count: payload.ratings.length,
    };
  }

  /**
   * 2. Start Assessment Session
   */
  async startSession(payload: StartSessionPayload) {
    const sessionId = randomUUID();
    const studentId = payload.student_id || 'guest-student-001';
    const roleId = payload.role_id || 'role-ml-engineer';
    const totalTime = payload.total_time_seconds || 900; // 15 mins default
    const testTitle = payload.test_title || 'Diagnostic Assessment — Engineering Core';

    const questions = getAllQuestions();
    const questionIds = questions.map(q => q.id);

    // Persist session
    const session: StoredSession = {
      id: sessionId,
      student_id: studentId,
      role_id: roleId,
      test_title: testTitle,
      status: 'STARTED',
      score: 0,
      total_time_seconds: totalTime,
      time_remaining_seconds: totalTime,
      current_question_index: 0,
      tab_switch_count: 0,
      question_ids: questionIds,
      created_at: new Date().toISOString(),
    };
    inMemorySessions.set(sessionId, session);

    // Initialize response records
    for (const qId of questionIds) {
      const respKey = `${sessionId}:${qId}`;
      inMemoryResponses.set(respKey, {
        id: randomUUID(),
        session_id: sessionId,
        question_id: qId,
        selected_option: null,
        is_correct: null,
        is_marked_for_review: false,
        time_spent_seconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Return client-safe questions (omitting correct_option and explanation)
    const clientQuestions: ClientQuestion[] = questions.map(q => ({
      id: q.id,
      skill_id: q.skill_id,
      skill_name: q.skill_name,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      difficulty: q.difficulty,
      question_type: q.question_type,
      code_snippet: q.code_snippet,
      code_language: q.code_language,
      points: q.points,
      tags: q.tags,
    }));

    return {
      session_id: sessionId,
      student_id: studentId,
      role_id: roleId,
      test_title: testTitle,
      total_questions: clientQuestions.length,
      total_time_seconds: totalTime,
      time_remaining_seconds: totalTime,
      questions: clientQuestions,
    };
  }

  /**
   * 3. Fetch Active Session State (State Recovery on Reload)
   */
  async getSessionState(sessionId: string) {
    const session = inMemorySessions.get(sessionId);
    if (!session) {
      throw new Error(`Assessment session '${sessionId}' not found.`);
    }

    const questions = session.question_ids
      .map(id => getQuestionById(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    const clientQuestions: ClientQuestion[] = questions.map(q => ({
      id: q.id,
      skill_id: q.skill_id,
      skill_name: q.skill_name,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      difficulty: q.difficulty,
      question_type: q.question_type,
      code_snippet: q.code_snippet,
      code_language: q.code_language,
      points: q.points,
      tags: q.tags,
    }));

    // Aggregate saved responses
    const savedResponses: Record<string, {
      selected_option: string | null;
      selected_options?: string[];
      is_marked_for_review: boolean;
      time_spent_seconds: number;
    }> = {};

    for (const q of questions) {
      const respKey = `${sessionId}:${q.id}`;
      const resp = inMemoryResponses.get(respKey);
      if (resp) {
        savedResponses[q.id] = {
          selected_option: resp.selected_option,
          selected_options: resp.selected_options,
          is_marked_for_review: resp.is_marked_for_review,
          time_spent_seconds: resp.time_spent_seconds,
        };
      }
    }

    return {
      session_id: session.id,
      student_id: session.student_id,
      role_id: session.role_id,
      test_title: session.test_title,
      status: session.status,
      total_time_seconds: session.total_time_seconds,
      time_remaining_seconds: session.time_remaining_seconds,
      current_question_index: session.current_question_index,
      tab_switch_count: session.tab_switch_count,
      questions: clientQuestions,
      saved_responses: savedResponses,
    };
  }

  /**
   * 4. Real-Time Single Answer Auto-Save
   */
  async saveAnswer(sessionId: string, payload: AnswerAutoSavePayload) {
    const session = inMemorySessions.get(sessionId);
    if (!session) {
      throw new Error(`Assessment session '${sessionId}' not found.`);
    }

    const respKey = `${sessionId}:${payload.question_id}`;
    let resp = inMemoryResponses.get(respKey);

    if (!resp) {
      resp = {
        id: randomUUID(),
        session_id: sessionId,
        question_id: payload.question_id,
        selected_option: payload.selected_option,
        selected_options: payload.selected_options,
        is_correct: null,
        is_marked_for_review: payload.is_marked_for_review ?? false,
        time_spent_seconds: payload.time_spent_delta_seconds ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      resp.selected_option = payload.selected_option;
      if (payload.selected_options) {
        resp.selected_options = payload.selected_options;
      }
      if (typeof payload.is_marked_for_review === 'boolean') {
        resp.is_marked_for_review = payload.is_marked_for_review;
      }
      if (payload.time_spent_delta_seconds) {
        resp.time_spent_seconds += payload.time_spent_delta_seconds;
      }
      resp.updated_at = new Date().toISOString();
    }

    inMemoryResponses.set(respKey, resp);

    return {
      success: true,
      message: 'Answer autosaved successfully',
      question_id: payload.question_id,
    };
  }

  /**
   * 5. Heartbeat & Proctoring Telemetry
   */
  async recordHeartbeat(sessionId: string, payload: HeartbeatPayload) {
    const session = inMemorySessions.get(sessionId);
    if (!session) {
      throw new Error(`Assessment session '${sessionId}' not found.`);
    }

    if (payload.time_remaining_seconds !== undefined) {
      session.time_remaining_seconds = Math.max(0, payload.time_remaining_seconds);
    }
    if (payload.tab_switch_increment) {
      session.tab_switch_count += payload.tab_switch_increment;
    }
    if (payload.current_question_index !== undefined) {
      session.current_question_index = payload.current_question_index;
    }

    return {
      status: 'synced',
      time_remaining_seconds: session.time_remaining_seconds,
      tab_switch_count: session.tab_switch_count,
    };
  }

  /**
   * 6. Submit Entire Assessment & Perform Discrepancy Calibration
   */
  async submitAssessment(sessionId: string, payload: SubmitAssessmentPayload) {
    const session = inMemorySessions.get(sessionId);
    if (!session) {
      throw new Error(`Assessment session '${sessionId}' not found.`);
    }

    // Merge answers
    for (const ans of payload.answers) {
      const respKey = `${sessionId}:${ans.question_id}`;
      let resp = inMemoryResponses.get(respKey);
      if (!resp) {
        resp = {
          id: randomUUID(),
          session_id: sessionId,
          question_id: ans.question_id,
          selected_option: ans.selected_option,
          selected_options: ans.selected_options,
          is_correct: null,
          is_marked_for_review: false,
          time_spent_seconds: ans.time_spent_seconds || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        resp.selected_option = ans.selected_option;
        if (ans.selected_options) resp.selected_options = ans.selected_options;
        if (ans.time_spent_seconds) resp.time_spent_seconds = ans.time_spent_seconds;
        resp.updated_at = new Date().toISOString();
      }
      inMemoryResponses.set(respKey, resp);
    }

    // Grade each question
    const questions = session.question_ids
      .map(id => getQuestionById(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    let correctCount = 0;
    const skillStats: Record<string, { name: string; correct: number; total: number }> = {};

    for (const q of questions) {
      const respKey = `${sessionId}:${q.id}`;
      const resp = inMemoryResponses.get(respKey);

      const isCorrect = resp?.selected_option === q.correct_option;
      if (resp) {
        resp.is_correct = isCorrect;
      }

      if (isCorrect) correctCount++;

      if (!skillStats[q.skill_id]) {
        skillStats[q.skill_id] = { name: q.skill_name, correct: 0, total: 0 };
      }
      skillStats[q.skill_id].total += 1;
      if (isCorrect) {
        skillStats[q.skill_id].correct += 1;
      }
    }

    const totalQuestions = questions.length;
    const overallAccuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Update Session
    session.status = 'COMPLETED';
    session.score = overallAccuracyPct;
    session.completed_at = new Date().toISOString();

    // Skill summaries & Discrepancies
    const studentRatings = inMemorySelfRatings.get(session.student_id) || {};
    const skillScores: SkillScoreSummary[] = [];
    const discrepancies: DiscrepancyReport[] = [];

    for (const [skillId, stats] of Object.entries(skillStats)) {
      const accuracyPct = Math.round((stats.correct / stats.total) * 100);
      const assessedLevel = getProficiencyLevel(accuracyPct);

      skillScores.push({
        skill_id: skillId,
        skill_name: stats.name,
        correct: stats.correct,
        total: stats.total,
        accuracy_pct: accuracyPct,
        proficiency: assessedLevel,
      });

      // Update student_skill_states
      const stateKey = `${session.student_id}:${skillId}`;
      const selfRating = (studentRatings[skillId] as SelfRatingLevel) || 'AVERAGE';

      inMemorySkillStates.set(stateKey, {
        id: randomUUID(),
        student_id: session.student_id,
        skill_id: skillId,
        skill_name: stats.name,
        self_rating: selfRating,
        assessed_level: assessedLevel,
        accuracy: accuracyPct,
        target_level: 'PROFICIENT',
        updated_at: new Date().toISOString(),
      });

      // Discrepancy Calibration Formula
      const selfWeight = RATING_WEIGHTS[selfRating] || 3;
      const assessedWeight = RATING_WEIGHTS[assessedLevel] || 3;
      const delta = assessedWeight - selfWeight;

      if (delta < 0) {
        discrepancies.push({
          skill_id: skillId,
          skill_name: stats.name,
          type: 'GROWTH',
          self_rating: selfRating,
          assessed_level: assessedLevel,
          delta_numeric: delta,
          message: `Growth calibration: In ${stats.name}, you self-rated as ${selfRating}, but empirical diagnostic indicates ${assessedLevel}.`,
          roadmap_action: `Injected foundational remedial milestones into prerequisite DAG before advancing to advanced topics.`,
        });
      } else if (delta > 0) {
        discrepancies.push({
          skill_id: skillId,
          skill_name: stats.name,
          type: 'POSITIVE',
          self_rating: selfRating,
          assessed_level: assessedLevel,
          delta_numeric: delta,
          message: `Positive calibration: In ${stats.name}, your performance (${assessedLevel}) exceeded your self-estimate (${selfRating})!`,
          roadmap_action: `Fast-tracked downstream milestones and elevated verified candidate readiness score.`,
        });
      } else {
        discrepancies.push({
          skill_id: skillId,
          skill_name: stats.name,
          type: 'ALIGNED',
          self_rating: selfRating,
          assessed_level: assessedLevel,
          delta_numeric: 0,
          message: `Accurately calibrated: Self-rating aligns with demonstrated empirical mastery (${assessedLevel}).`,
          roadmap_action: `Maintained standard prerequisite flow.`,
        });
      }
    }

    return {
      session_id: sessionId,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      overall_accuracy_pct: overallAccuracyPct,
      skill_scores: skillScores,
      discrepancies: discrepancies,
    };
  }

  /**
   * 7. Comprehensive Post-Test Report
   */
  async getReport(sessionId: string): Promise<FullExamReport> {
    const session = inMemorySessions.get(sessionId);
    if (!session) {
      throw new Error(`Assessment session '${sessionId}' not found.`);
    }

    const questions = session.question_ids
      .map(id => getQuestionById(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    let correctAnswers = 0;
    let unansweredCount = 0;
    let totalTimeSpent = 0;
    const skillStats: Record<string, { name: string; correct: number; total: number }> = {};
    const questionReviews: QuestionReviewItem[] = [];

    for (const q of questions) {
      const respKey = `${sessionId}:${q.id}`;
      const resp = inMemoryResponses.get(respKey);

      const isCorrect = resp?.selected_option === q.correct_option;
      if (isCorrect) correctAnswers++;
      if (!resp?.selected_option) unansweredCount++;
      if (resp?.time_spent_seconds) totalTimeSpent += resp.time_spent_seconds;

      if (!skillStats[q.skill_id]) {
        skillStats[q.skill_id] = { name: q.skill_name, correct: 0, total: 0 };
      }
      skillStats[q.skill_id].total += 1;
      if (isCorrect) skillStats[q.skill_id].correct += 1;

      questionReviews.push({
        id: q.id,
        question_text: q.question_text,
        code_snippet: q.code_snippet,
        code_language: q.code_language,
        options: [
          { key: 'A', text: q.option_a },
          { key: 'B', text: q.option_b },
          { key: 'C', text: q.option_c },
          { key: 'D', text: q.option_d },
        ],
        selected_option: resp?.selected_option || null,
        correct_option: q.correct_option,
        is_correct: isCorrect,
        explanation: q.explanation,
        time_spent_seconds: resp?.time_spent_seconds || 0,
      });
    }

    const overallAccuracyPct = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    const overallReadinessPct = Math.min(100, Math.round(overallAccuracyPct * 0.95 + 5));

    const studentRatings = inMemorySelfRatings.get(session.student_id) || {};
    const skillScores: SkillScoreSummary[] = [];
    const discrepancies: DiscrepancyReport[] = [];

    for (const [skillId, stats] of Object.entries(skillStats)) {
      const acc = Math.round((stats.correct / stats.total) * 100);
      const level = getProficiencyLevel(acc);

      skillScores.push({
        skill_id: skillId,
        skill_name: stats.name,
        correct: stats.correct,
        total: stats.total,
        accuracy_pct: acc,
        proficiency: level,
      });

      const selfRating = studentRatings[skillId] || 'AVERAGE';
      const selfWeight = RATING_WEIGHTS[selfRating] || 3;
      const assessedWeight = RATING_WEIGHTS[level] || 3;
      const delta = assessedWeight - selfWeight;

      if (delta < 0) {
        discrepancies.push({
          skill_id: skillId,
          skill_name: stats.name,
          type: 'GROWTH',
          self_rating: selfRating,
          assessed_level: level,
          delta_numeric: delta,
          message: `Growth calibration: In ${stats.name}, you self-rated as ${selfRating}, but diagnostic indicates ${level}.`,
          roadmap_action: `Injected foundational remedial milestones into prerequisite DAG before advancing.`,
        });
      } else if (delta > 0) {
        discrepancies.push({
          skill_id: skillId,
          skill_name: stats.name,
          type: 'POSITIVE',
          self_rating: selfRating,
          assessed_level: level,
          delta_numeric: delta,
          message: `Positive calibration: In ${stats.name}, you tested as ${level}, exceeding your self-rating (${selfRating})!`,
          roadmap_action: `Fast-tracked downstream milestones and elevated verified candidate readiness score.`,
        });
      } else {
        discrepancies.push({
          skill_id: skillId,
          skill_name: stats.name,
          type: 'ALIGNED',
          self_rating: selfRating,
          assessed_level: level,
          delta_numeric: 0,
          message: `Accurately calibrated: Self-rating aligns with demonstrated empirical mastery (${level}).`,
          roadmap_action: `Maintained standard prerequisite sequence.`,
        });
      }
    }

    return {
      session_id: session.id,
      test_title: session.test_title,
      role_id: session.role_id,
      status: 'COMPLETED',
      total_questions: questions.length,
      correct_answers: correctAnswers,
      unanswered_count: unansweredCount,
      overall_accuracy_pct: overallAccuracyPct,
      overall_readiness_pct: overallReadinessPct,
      total_time_spent_seconds: totalTimeSpent,
      tab_switch_count: session.tab_switch_count,
      skill_scores: skillScores,
      discrepancies: discrepancies,
      question_reviews: questionReviews,
      completed_at: session.completed_at || new Date().toISOString(),
    };
  }
}

export const assessmentService = new AssessmentService();
