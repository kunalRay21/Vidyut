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
  const raw = localStorage.getItem('demo_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  localStorage.setItem('demo_user', JSON.stringify(user));
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

  const url = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json();
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
// 4. Assessment Engine
// ----------------------------------------------------
export const assessmentApi = {
  saveSelfRatings: async (roleId: string, ratings: Array<{ skill_id: string; rating: string }>, studentId?: string) => {
    const user = getStoredUser();
    const resolvedStudentId = studentId || user?.id || user?.student_id;
    return await request('/api/v1/assessments/self', {
      method: 'POST',
      body: JSON.stringify({
        student_id: resolvedStudentId,
        role_id: roleId,
        ratings,
      }),
    });
  },

  startSession: async (roleId: string, studentId?: string) => {
    const user = getStoredUser();
    const resolvedStudentId = studentId || user?.id || user?.student_id || 'student-demo';
    return await request('/api/v1/assessments/start', {
      method: 'POST',
      body: JSON.stringify({
        student_id: resolvedStudentId,
        role_id: roleId,
      }),
    });
  },

  submitSession: async (sessionId: string, answers: Array<{ question_id: string; selected_option: string }>) => {
    return await request(`/api/v1/assessments/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
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
};

// ----------------------------------------------------
// 6. Adaptive Roadmap & Branches
// ----------------------------------------------------
export const roadmapApi = {
  getRoadmap: async (studentId?: string, roleId?: string) => {
    const user = getStoredUser();
    const sid = studentId || user?.id || user?.student_id || 'student-demo';
    const rid = roleId || user?.selected_role_id || 'role-ml';
    return await request(`/api/v1/roadmap?student_id=${encodeURIComponent(sid)}&role_id=${encodeURIComponent(rid)}`);
  },

  selectBranch: async (branchId: string, optionId?: string, studentId?: string) => {
    const user = getStoredUser();
    const sid = studentId || user?.id || user?.student_id || 'student-demo';
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
    const sid = data.student_id || user?.id || user?.student_id || 'student-demo';
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
