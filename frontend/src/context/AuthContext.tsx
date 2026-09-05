import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  clearStoredAuth,
  authApi,
} from '../services/api';

export type UserRole = 'STUDENT' | 'INDUSTRY' | 'INSTITUTION' | 'ADMIN';

export interface UserProfile {
  id: string;
  student_profile_id?: string;
  email: string;
  role: UserRole;
  full_name?: string;
  institution?: string;
  degree?: string;
  year_of_study?: number;
  company_name?: string;
  college_name?: string;
  aishe_code?: string;
  officer_name?: string;
  sector?: string;
  website?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => void;
  registerStudent: (data: {
    email: string;
    password: string;
    full_name: string;
    institution: string;
    degree: string;
    academic_branch_id?: string;
    year_of_study: number;
    interests?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  loginIndustry: (companyData: { companyName: string; sector: string; website?: string }) => void;
  loginInstitution: (institutionData: { collegeName: string; aisheCode?: string; officerName?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser({
          ...storedUser,
          role: (storedUser.role as UserRole) || 'STUDENT',
        });
      }
    } catch (e) {
      console.warn('Error reading stored auth credentials:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await authApi.login(email, password);

      if (res.success && res.data) {
        const receivedToken = res.data.access_token || 'bearer-token';
        const receivedUser: UserProfile = {
          id: res.data.user?.id || 'usr-1',
          student_profile_id: res.data.user?.student_profile_id,
          email: res.data.user?.email || email,
          role: (res.data.user?.role as UserRole) || 'STUDENT',
          full_name: res.data.user?.full_name || 'Vidyut Scholar',
          institution: res.data.user?.institution || '',
          degree: res.data.user?.degree || '',
          year_of_study: res.data.user?.year_of_study || 1,
          selected_role_id: res.data.user?.selected_role_id,
          readiness_pct: res.data.user?.readiness_pct,
        };

        setStoredToken(receivedToken);
        setStoredUser(receivedUser);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      } else {
        const errorMessage =
          res.error?.message ||
          (typeof res.error === 'string' ? res.error : 'Invalid email or password.');
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = (demoRole: UserRole) => {
    if (demoRole === 'STUDENT') {
      const demoStudent: UserProfile = {
        id: 'student-demo',
        email: 'priya.sharma@vitchennai.edu.in',
        role: 'STUDENT',
        full_name: 'Priya Sharma',
        institution: 'VIT Chennai',
        degree: 'B.Tech Computer Science & Engineering',
        year_of_study: 3,
      };
      const tokenStr = 'demo-jwt-student-token';
      setStoredToken(tokenStr);
      setStoredUser(demoStudent);
      setToken(tokenStr);
      setUser(demoStudent);
    } else if (demoRole === 'INDUSTRY') {
      const demoIndustry: UserProfile = {
        id: 'ind-bangalore-analytics',
        email: 'talent@bangaloreanalytics.io',
        role: 'INDUSTRY',
        full_name: 'Aditi Nair',
        company_name: 'Bangalore Analytics Co.',
        sector: 'AI & Data Engineering',
        website: 'https://bangaloreanalytics.io',
      };
      const tokenStr = 'demo-jwt-industry-token';
      localStorage.setItem('industry_token', tokenStr);
      setStoredToken(tokenStr);
      setStoredUser(demoIndustry);
      setToken(tokenStr);
      setUser(demoIndustry);
    } else if (demoRole === 'INSTITUTION') {
      const demoInstitution: UserProfile = {
        id: 'inst-vit-chennai',
        email: 'academics@vitchennai.edu.in',
        role: 'INSTITUTION',
        full_name: 'Dr. Ramesh Rao',
        college_name: 'VIT Chennai',
        aishe_code: 'C-36944',
      };
      const tokenStr = 'demo-jwt-institution-token';
      localStorage.setItem('institution_token', tokenStr);
      setStoredToken(tokenStr);
      setStoredUser(demoInstitution);
      setToken(tokenStr);
      setUser(demoInstitution);
    }
  };

  const registerStudent = async (data: {
    email: string;
    password: string;
    full_name: string;
    institution: string;
    degree: string;
    academic_branch_id?: string;
    year_of_study: number;
    interests?: string[];
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await authApi.register(data);

      if (res.success && res.data?.access_token) {
        const receivedToken = res.data.access_token;
        const receivedUser: UserProfile = {
          id: res.data?.user?.id || 'usr-reg-1',
          student_profile_id: res.data?.user?.student_profile_id,
          email: data.email,
          role: 'STUDENT',
          full_name: data.full_name,
          institution: data.institution,
          degree: data.degree,
          year_of_study: data.year_of_study,
        };

        setStoredToken(receivedToken);
        setStoredUser(receivedUser);
        setToken(receivedToken);
        setUser(receivedUser);

        return { success: true };
      } else {
        const errorMessage =
          res.error?.message ||
          (typeof res.error === 'string' ? res.error : 'Registration failed.');
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginIndustry = (companyData: { companyName: string; sector: string; website?: string }) => {
    const indUser: UserProfile = {
      id: `ind-${Date.now()}`,
      email: 'recruiter@' + (companyData.website ? companyData.website.replace(/^https?:\/\//, '') : 'company.com'),
      role: 'INDUSTRY',
      full_name: 'Recruiter / Hiring Lead',
      company_name: companyData.companyName,
      sector: companyData.sector,
      website: companyData.website,
    };
    const indToken = `industry-jwt-${Date.now()}`;
    localStorage.setItem('industry_token', indToken);
    localStorage.setItem('industry_company', JSON.stringify(companyData));
    setStoredToken(indToken);
    setStoredUser(indUser);
    setToken(indToken);
    setUser(indUser);
  };

  const loginInstitution = (institutionData: { collegeName: string; aisheCode?: string; officerName?: string }) => {
    const instUser: UserProfile = {
      id: `inst-${Date.now()}`,
      email: 'officer@' + institutionData.collegeName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.edu.in',
      role: 'INSTITUTION',
      full_name: institutionData.officerName || 'Placement & Academic Dean',
      college_name: institutionData.collegeName,
      aishe_code: institutionData.aisheCode || 'C-10001',
    };
    const instToken = `inst-jwt-${Date.now()}`;
    localStorage.setItem('institution_token', instToken);
    setStoredToken(instToken);
    setStoredUser(instUser);
    setToken(instToken);
    setUser(instUser);
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    role: user?.role || null,
    login,
    loginAsDemo,
    registerStudent,
    loginIndustry,
    loginInstitution,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
