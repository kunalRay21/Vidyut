// ==============================================================================
// Assessment Platform Exam Domain Types
// ==============================================================================

export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODE_SNIPPET';
export type ProficiencyLevel = 'AWARENESS' | 'BEGINNER' | 'INTERMEDIATE' | 'PROFICIENT' | 'EXPERT';

export type QuestionStatus = 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'VISITED' | 'NOT_VISITED';

export interface ExamQuestion {
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

export interface QuestionUserResponse {
  selected_option: OptionKey | null;
  selected_options?: OptionKey[];
  is_marked_for_review: boolean;
  time_spent_seconds: number;
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
    key: OptionKey;
    text: string;
  }[];
  selected_option: OptionKey | null;
  correct_option: OptionKey;
  is_correct: boolean;
  explanation: string;
  time_spent_seconds: number;
}

export interface ExamReport {
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
