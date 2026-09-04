export type ProficiencyLevel =
  | 'AWARENESS'
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'PROFICIENT'
  | 'EXPERT';

export type SelfRating =
  | 'AWARENESS'
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'PROFICIENT'
  | 'EXPERT';

export interface SelfRatingInput {
  skill_id: string;
  rating: SelfRating;
}

export interface StartAssessmentInput {
  student_id: string;
  role_id: string;
  self_ratings: SelfRatingInput[];
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
  correct: number;
  total: number;
  accuracy_pct: number;
  proficiency: ProficiencyLevel;
}

export interface Discrepancy {
  skill_id: string;
  self_rating: SelfRating | null;
  assessed_level: ProficiencyLevel;
  message: string;
}

export interface AssessmentResult {
  session_id: string;
  total_questions: number;
  correct_answers: number;
  overall_accuracy_pct: number;
  skill_scores: SkillScore[];
  discrepancies: Discrepancy[];
}