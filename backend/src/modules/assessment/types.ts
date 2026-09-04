// ==============================================================================
// Assessment Subsystem Domain Models & Integration Contracts
// ==============================================================================

export type ProficiencyLevel = 'AWARENESS' | 'BEGINNER' | 'INTERMEDIATE' | 'PROFICIENT' | 'EXPERT';
export type SelfRatingLevel = 'NOT_FAMILIAR' | 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODE_SNIPPET' | 'CODING_PROBLEM';
export type OptionChoice = 'A' | 'B' | 'C' | 'D';
export type CodingLanguage = 'python' | 'java' | 'cpp' | 'c';

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
  is_hidden?: boolean;
}

export interface StarterCodeMap {
  python: string;
  java: string;
  cpp: string;
  c: string;
}

export interface ClientQuestion {
  id: string;
  section: 'MCQ' | 'CODING';
  skill_id: string;
  skill_name?: string;
  question_text: string;
  problem_description?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  difficulty: QuestionDifficulty;
  question_type: QuestionType;
  code_snippet?: string;
  code_language?: string;
  points: number;
  tags?: string[];
  constraints?: string[];
  test_cases?: TestCase[];
  starter_code?: StarterCodeMap;
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
  selected_option?: OptionChoice | null;
  selected_options?: OptionChoice[];
  is_marked_for_review?: boolean;
  time_spent_delta_seconds?: number;
  coding_language?: CodingLanguage;
  code_solution?: string;
}

export interface HeartbeatPayload {
  time_remaining_seconds: number;
  tab_switch_increment?: number;
  current_question_index?: number;
}

export interface SubmissionAnswer {
  question_id: string;
  selected_option?: OptionChoice | null;
  selected_options?: OptionChoice[];
  time_spent_seconds?: number;
  coding_language?: CodingLanguage;
  code_solution?: string;
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
  section: 'MCQ' | 'CODING';
  question_text: string;
  code_snippet?: string;
  code_language?: string;
  options?: {
    key: OptionChoice;
    text: string;
  }[];
  selected_option?: OptionChoice | null;
  correct_option?: OptionChoice;
  code_solution?: string;
  coding_language?: CodingLanguage;
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
  mcq_count: number;
  coding_count: number;
  coding_completed_count: number;
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

// ------------------------------------------------------------------------------
// Legacy compatibility types
// ------------------------------------------------------------------------------
export type SelfRating = ProficiencyLevel | SelfRatingLevel;

export interface StartAssessmentInput {
  student_id: string;
  role_id: string;
  self_ratings: {
    skill_id: string;
    rating: SelfRating;
  }[];
}

export interface Question {
  id: string;
  skill_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  difficulty: number;
  explanation?: string;
}

export interface AssessmentQuestion {
  id: string;
  skill_id: string;
  question_text: string;
  options: string[];
  difficulty: number;
}

export interface AssessmentSession {
  id: string;
  student_id: string;
  role_id: string;
  questions: AssessmentQuestion[];
  status: 'STARTED' | 'SUBMITTED';
}

export interface AnswerInput {
  question_id: string;
  selected_answer: number;
}

export interface SubmitAssessmentInput {
  answers: AnswerInput[];
}

export interface SkillScore {
  skill_id: string;
  skill_name?: string;
  correct: number;
  total: number;
  accuracy_pct: number;
  proficiency: ProficiencyLevel;
}

export interface Discrepancy {
  skill_id: string;
  skill_name?: string;
  type?: 'GROWTH' | 'POSITIVE' | 'ALIGNED';
  self_rating: SelfRating | null | string;
  assessed_level: ProficiencyLevel;
  delta_numeric?: number;
  message: string;
  roadmap_action?: string;
}

export interface AssessmentResult {
  session_id: string;
  total_questions: number;
  correct_answers: number;
  overall_accuracy_pct: number;
  skill_scores: SkillScore[];
  discrepancies: Discrepancy[];
}


