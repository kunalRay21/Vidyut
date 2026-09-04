// ==============================================================================
// Assessment Subsystem Domain Models & Integration Contracts
// ==============================================================================

export type ProficiencyLevel = 'AWARENESS' | 'BEGINNER' | 'INTERMEDIATE' | 'PROFICIENT' | 'EXPERT';
export type SelfRatingLevel = 'NOT_FAMILIAR' | 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODE_SNIPPET';
export type OptionChoice = 'A' | 'B' | 'C' | 'D';

export interface ClientQuestion {
  id: string;
  skill_id: string;
  skill_name?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: QuestionDifficulty;
  question_type: QuestionType;
  code_snippet?: string;
  code_language?: string;
  points: number;
  tags?: string[];
}

export interface SelfRatingInput {
  skill_id: string;
  rating: SelfRatingLevel;
}

export interface SelfRatingPayload {
  student_id?: string;
  role_id: string;
  ratings: SelfRatingInput[];
}

export interface StartSessionPayload {
  student_id?: string;
  role_id?: string;
  test_title?: string;
  total_time_seconds?: number;
}

export interface AnswerAutoSavePayload {
  question_id: string;
  selected_option: OptionChoice | null;
  selected_options?: OptionChoice[];
  is_marked_for_review?: boolean;
  time_spent_delta_seconds?: number;
}

export interface HeartbeatPayload {
  time_remaining_seconds: number;
  tab_switch_increment?: number;
  current_question_index?: number;
}

export interface SubmissionAnswer {
  question_id: string;
  selected_option: OptionChoice | null;
  selected_options?: OptionChoice[];
  time_spent_seconds?: number;
}

export interface SubmitAssessmentPayload {
  answers: SubmissionAnswer[];
}

export interface SkillScoreSummary {
  skill_id: string;
  skill_name: string;
  correct: number;
  total: number;
  accuracy_pct: number;
  proficiency: ProficiencyLevel;
}

export interface DiscrepancyReport {
  skill_id: string;
  skill_name: string;
  type: 'GROWTH' | 'POSITIVE' | 'ALIGNED';
  self_rating: string;
  assessed_level: ProficiencyLevel;
  delta_numeric: number;
  message: string;
  roadmap_action: string;
}

export interface QuestionReviewItem {
  id: string;
  question_text: string;
  code_snippet?: string;
  code_language?: string;
  options: {
    key: OptionChoice;
    text: string;
  }[];
  selected_option: OptionChoice | null;
  correct_option: OptionChoice;
  is_correct: boolean;
  explanation: string;
  time_spent_seconds: number;
}

export interface FullExamReport {
  session_id: string;
  test_title: string;
  role_id: string;
  status: 'COMPLETED';
  total_questions: number;
  correct_answers: number;
  unanswered_count: number;
  overall_accuracy_pct: number;
  overall_readiness_pct: number;
  total_time_spent_seconds: number;
  tab_switch_count: number;
  skill_scores: SkillScoreSummary[];
  discrepancies: DiscrepancyReport[];
  question_reviews: QuestionReviewItem[];
  completed_at: string;
}
