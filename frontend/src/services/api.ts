// ==============================================================================
// Vidyut Centralized API Service Layer
// Safe fallbacks and typed interfaces for Vidyut Assessment Platform
// ==============================================================================

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface SelfRatingRequest {
  student_id?: string;
  role_id: string;
  ratings: {
    skill_id: string;
    rating: 'NOT_FAMILIAR' | 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT';
  }[];
}

export interface StartSessionRequest {
  student_id?: string;
  role_id?: string;
  test_title?: string;
  total_time_seconds?: number;
}

export interface AnswerAutoSaveRequest {
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  selected_options?: ('A' | 'B' | 'C' | 'D')[];
  is_marked_for_review?: boolean;
  time_spent_delta_seconds?: number;
  coding_language?: string;
  code_solution?: string;
}

export interface HeartbeatRequest {
  time_remaining_seconds: number;
  tab_switch_increment?: number;
  current_question_index?: number;
}

export interface SubmitAssessmentRequest {
  answers: {
    question_id: string;
    selected_option: 'A' | 'B' | 'C' | 'D' | null;
    selected_options?: ('A' | 'B' | 'C' | 'D')[];
    time_spent_seconds?: number;
    coding_language?: string;
    code_solution?: string;
  }[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || errorBody.message || `Request failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const assessmentApi = {
  /**
   * Save initial self-ratings
   */
  async saveSelfRatings(payload: SelfRatingRequest) {
    const res = await fetch(`${API_BASE_URL}/assessments/self`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  /**
   * Start or create a new assessment session
   */
  async startSession(payload: StartSessionRequest = {}) {
    const res = await fetch(`${API_BASE_URL}/assessments/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  /**
   * Fetch active session state (State recovery on reload)
   */
  async getSession(sessionId: string) {
    const res = await fetch(`${API_BASE_URL}/assessments/session/${sessionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<any>(res);
  },

  /**
   * Real-time autosave of single question answer
   */
  async saveAnswer(sessionId: string, payload: AnswerAutoSaveRequest) {
    const res = await fetch(`${API_BASE_URL}/assessments/session/${sessionId}/answer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  /**
   * Proctoring & timer heartbeat sync
   */
  async recordHeartbeat(sessionId: string, payload: HeartbeatRequest) {
    const res = await fetch(`${API_BASE_URL}/assessments/session/${sessionId}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  /**
   * Submit complete assessment
   */
  async submitAssessment(sessionId: string, payload: SubmitAssessmentRequest) {
    const res = await fetch(`${API_BASE_URL}/assessments/${sessionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  /**
   * Fetch comprehensive post-test report
   */
  async getReport(sessionId: string) {
    const res = await fetch(`${API_BASE_URL}/assessments/session/${sessionId}/report`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<any>(res);
  },
};
