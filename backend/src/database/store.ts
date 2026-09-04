// In-memory store for offline development when PostgreSQL is not running
export interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  role: 'STUDENT' | 'INSTITUTION' | 'INDUSTRY' | 'ADMIN';
  created_at: string;
}

export interface StoredStudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  institution: string;
  degree: string;
  year_of_study: number;
  interests: string[];
  selected_role_id?: string;
  readiness_pct: number;
}

export interface StoredInstitution {
  id: string;
  user_id: string;
  college_name: string;
  aishe_code: string;
  officer_name: string;
  departments: string[];
}

export interface StoredCompany {
  id: string;
  user_id: string;
  company_name: string;
  sector: string;
  website?: string;
}

export interface StoredSkillState {
  student_id: string;
  skill_id: string;
  self_rating?: string;
  assessed_level: string;
  accuracy: number;
}

export const memoryStore = {
  users: new Map<string, StoredUser>(),
  profiles: new Map<string, StoredStudentProfile>(),
  institutions: new Map<string, StoredInstitution>(),
  companies: new Map<string, StoredCompany>(),
  skill_states: new Map<string, StoredSkillState>(),
};
