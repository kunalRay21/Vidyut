/**
 * Centralized Vidyut API Client & Services
 * Communicates with backend endpoints (/api/v1/...) with automatic token injection
 * and graceful fallback resilience.
 */

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

export function getStoredToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function getStoredUser(): any | null {
  const raw = localStorage.getItem('vidyut_user') || localStorage.getItem('demo_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  localStorage.setItem('vidyut_user', JSON.stringify(user));
  localStorage.setItem('demo_user', JSON.stringify(user));
}

export function getStoredResume(): any | null {
  const raw = localStorage.getItem('student_resume');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredResume(resume: any) {
  localStorage.setItem('student_resume', JSON.stringify(resume));
}

export function clearStoredResume() {
  localStorage.removeItem('student_resume');
}

export function clearStoredAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('vidyut_user');
  localStorage.removeItem('demo_user');
  localStorage.removeItem('student_resume');
  localStorage.removeItem('institution_token');
  localStorage.removeItem('industry_token');
  localStorage.removeItem('industry_company');
  localStorage.removeItem('assessment_result');
  localStorage.removeItem('self_assessment');
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; error?: any }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const user = getStoredUser();
  const studentId = user?.student_profile_id || user?.student_id || user?.id;
  if (studentId && !headers['x-student-id']) {
    headers['x-student-id'] = studentId;
  }

  const url = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const text = await res.text();
    
    // Handle empty responses
    if (!text) {
      if (!res.ok) {
        return {
          success: false,
          data: null as any,
          error: { message: `Request failed with status ${res.status}` },
        };
      }
      return { success: true, data: {} as any };
    }

    let json: any;
    try {
      json = JSON.parse(text);
    } catch (e: any) {
      // If the response is not valid JSON, it's likely an error HTML page or plain text error from a proxy
      return {
        success: false,
        data: null as any,
        error: { message: res.ok ? 'Invalid JSON response from server' : `Server error (${res.status}): ${text.slice(0, 100)}...` },
      };
    }

    if (!res.ok || json.success === false) {
      return {
        success: false,
        data: json.data || null,
        error: json.error || { message: json.message || `Request failed with status ${res.status}` },
      };
    }

    return {
      success: true,
      data: json.data !== undefined ? json.data : json,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null as any,
      error: { message: err.message || 'Network connection failed' },
    };
  }
}

// ----------------------------------------------------
// 1. Authentication
// ----------------------------------------------------
export const authApi = {
  login: async (email: string, password: string) => {
    return await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    institution: string;
    degree: string;
    year_of_study: number;
    interests?: string[];
    resume?: {
      filename?: string;
      raw_text?: string;
      parsed_skills?: string[];
      matched_role?: string;
      match_score?: number;
      parsed_data?: any;
    };
  }) => {
    return await request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'STUDENT' }),
    });
  },
};

// ----------------------------------------------------
// 2. Career Domains & Roles
// ----------------------------------------------------
export const careersApi = {
  getDomains: async () => {
    return await request('/api/v1/careers/domains');
  },

  getRoleDetails: async (roleId: string) => {
    return await request(`/api/v1/careers/roles/${roleId}`);
  },
};

// ----------------------------------------------------
// 3. Skill Graph DAG
// ----------------------------------------------------
export const skillGraphApi = {
  getGraph: async (roleId: string) => {
    return await request(`/api/v1/skill-graph/roles/${roleId}/graph`);
  },
};

// ----------------------------------------------------
// 4. Assessment Subsystem Contracts & API
// ----------------------------------------------------
export interface SelfRatingRequest {
  student_id?: string;
  role_id: string;
  ratings: {
    skill_id: string;
    rating: 'NOT_FAMILIAR' | 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT' | string;
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

export const assessmentApi = {
  /**
   * Save initial self-ratings
   */
  saveSelfRatings: async (
    roleOrPayload: string | SelfRatingRequest,
    ratings?: Array<{ skill_id: string; rating: string }>,
    studentId?: string
  ) => {
    let body: any;
    if (typeof roleOrPayload === 'string') {
      const user = getStoredUser();
      body = {
        role_id: roleOrPayload,
        ratings: ratings || [],
        student_id: studentId || user?.id || user?.student_id,
      };
    } else {
      const user = getStoredUser();
      body = {
        student_id: user?.id || user?.student_id,
        ...roleOrPayload,
      };
    }
    const res = await request('/api/v1/assessments/self', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data !== undefined ? res.data : res;
  },

  /**
   * Start or create a new assessment session
   */
  startSession: async (roleOrPayload?: string | StartSessionRequest, studentId?: string) => {
    let body: any = {};
    if (typeof roleOrPayload === 'string') {
      const user = getStoredUser();
      const resolvedStudentId = studentId || user?.student_profile_id || user?.student_id || user?.id;
      body = {
        role_id: roleOrPayload,
        student_id: resolvedStudentId,
      };
    } else if (typeof roleOrPayload === 'object' && roleOrPayload !== null) {
      const user = getStoredUser();
      const resolvedStudentId = user?.student_profile_id || user?.student_id || user?.id;
      body = {
        student_id: resolvedStudentId,
        ...roleOrPayload,
      };
    }

    const res = await request<any>('/api/v1/assessments/start', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const payloadData = res.data || {};
    return {
      success: res.success,
      data: payloadData,
      ...payloadData,
    };
  },

  /**
   * Fetch active session state (State recovery on reload)
   */
  getSession: async (sessionId: string) => {
    const res = await request<any>(`/api/v1/assessments/session/${sessionId}`);
    if (!res.success) {
      throw new Error(res.error?.message || `Failed to fetch session ${sessionId}`);
    }
    const payloadData = res.data || {};
    return {
      success: true,
      data: payloadData,
      ...payloadData,
    };
  },

  /**
   * Real-time autosave of single question answer
   */
  saveAnswer: async (sessionId: string, payload: AnswerAutoSaveRequest) => {
    const res = await request<any>(`/api/v1/assessments/session/${sessionId}/answer`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data !== undefined ? res.data : res;
  },

  /**
   * Proctoring & timer heartbeat sync
   */
  recordHeartbeat: async (sessionId: string, payload: HeartbeatRequest) => {
    const res = await request<any>(`/api/v1/assessments/session/${sessionId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data !== undefined ? res.data : res;
  },

  /**
   * Submit complete assessment
   */
  submitAssessment: async (sessionId: string, payload: SubmitAssessmentRequest) => {
    const res = await request<any>(`/api/v1/assessments/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.success) {
      throw new Error(res.error?.message || `Failed to submit assessment ${sessionId}`);
    }
    const payloadData = res.data || {};
    return {
      success: true,
      data: payloadData,
      ...payloadData,
    };
  },

  /**
   * Submit session alias for legacy QuizEngine
   */
  submitSession: async (sessionId: string, answers: Array<{ question_id: string; selected_option: string }>) => {
    return await assessmentApi.submitAssessment(sessionId, { answers: answers as any });
  },

  /**
   * Fetch comprehensive post-test report
   */
  getReport: async (sessionId: string) => {
    const res = await request<any>(`/api/v1/assessments/session/${sessionId}/report`);
    if (!res.success) {
      throw new Error(res.error?.message || `Failed to fetch report for session ${sessionId}`);
    }
    const payloadData = res.data || {};
    return {
      success: true,
      data: payloadData,
      ...payloadData,
    };
  },
};

// ----------------------------------------------------
// 5. Student Profile & Evaluated Skills
// ----------------------------------------------------
export const profileApi = {
  getMe: async () => {
    return await request('/api/v1/profile/me');
  },

  getSkills: async (studentId?: string, roleId?: string) => {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (roleId) params.append('role_id', roleId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/api/v1/profile/me/skills${qs}`);
  },

  updateProfile: async (fields: any) => {
    return await request('/api/v1/profile/me', {
      method: 'PUT',
      body: JSON.stringify(fields),
    });
  },

  uploadResume: async (data: {
    filename?: string;
    raw_text?: string;
    parsed_skills?: string[];
    matched_role?: string;
    match_score?: number;
    parsed_data?: any;
  }) => {
    return await request('/api/v1/profile/me/resume', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteResume: async () => {
    return await request('/api/v1/profile/me/resume', {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// 6. Adaptive Roadmap & Branches
// ----------------------------------------------------
export const roadmapApi = {
  getRoadmap: async (studentId?: string, roleId?: string) => {
    const user = getStoredUser();
    const sid = studentId || user?.student_profile_id || user?.id || user?.student_id;
    const rid = roleId || user?.selected_role_id;
    const params = new URLSearchParams();
    if (sid) params.append('student_id', sid);
    if (rid) params.append('role_id', rid);
    const qs = params.toString();
    return await request(`/api/v1/roadmap${qs ? `?${qs}` : ''}`);
  },

  selectBranch: async (branchId: string, optionId?: string, studentId?: string) => {
    const user = getStoredUser();
    const sid = studentId || user?.student_profile_id || user?.id || user?.student_id;
    return await request('/api/v1/roadmap/branch', {
      method: 'POST',
      body: JSON.stringify({
        student_id: sid,
        branch_id: branchId,
        option_id: optionId,
      }),
    });
  },
};

// ----------------------------------------------------
// 7. Portfolio & Evidence
// ----------------------------------------------------
export const portfolioApi = {
  submitEvidence: async (data: {
    skill_id: string;
    type: string;
    title?: string;
    url?: string;
    description?: string;
    student_id?: string;
  }) => {
    const user = getStoredUser();
    const sid = data.student_id || user?.student_profile_id || user?.id || user?.student_id;
    return await request('/api/v1/portfolio/evidence', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        student_id: sid,
      }),
    });
  },
};

// ----------------------------------------------------
// 8. Opportunities Index & Direct Postings
// ----------------------------------------------------
export const opportunitiesApi = {
  getOpportunities: async (filters: {
    source?: string;
    type?: string;
    mode?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.source) params.append('source', filters.source);
    if (filters.type) params.append('type', filters.type);
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/api/v1/opportunities${qs}`);
  },

  postDirect: async (opportunityData: any) => {
    return await request('/api/v1/opportunities/direct', {
      method: 'POST',
      body: JSON.stringify(opportunityData),
    });
  },
};

// ----------------------------------------------------
// 8.1 Role 5: AI & Recommendation Engine
// ----------------------------------------------------
export const recommendationsApi = {
  getOpportunities: async (params?: { refresh?: boolean; studentId?: string }) => {
    const q = new URLSearchParams();
    if (params?.refresh) q.append('refresh', 'true');
    if (params?.studentId) q.append('studentId', params.studentId);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<any>(`/api/v1/recommendations/opportunities${qs}`);
  },

  getResources: async (params?: { skillId?: string; studentId?: string }) => {
    const q = new URLSearchParams();
    if (params?.skillId) q.append('skillId', params.skillId);
    if (params?.studentId) q.append('studentId', params.studentId);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<any>(`/api/v1/recommendations/resources${qs}`);
  },
};

// ----------------------------------------------------
// 9. Industry Recruiter Portal
// ----------------------------------------------------
export const industryApi = {
  register: async (data: { company_name: string; sector: string; website?: string }) => {
    return await request('/api/v1/industry/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTalentPool: async (minScore = 70) => {
    return await request(`/api/v1/industry/talent?min_score=${minScore}`);
  },
};

// ----------------------------------------------------
// 10. Academic Institution Portal
// ----------------------------------------------------
export const institutionApi = {
  register: async (data: { college_name: string; aishe_code?: string; officer_name: string; departments: string[] }) => {
    return await request('/api/v1/institution/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDashboard: async () => {
    return await request('/api/v1/institution/dashboard');
  },
};

