/**
 * Vidyut Skill Passport Types
 * Cryptographically-traceable, continuously verified student skill profile.
 */

export type AuthenticityLevel = 
  | 'UNVERIFIED_CLAIM'     // Only on resume (Low, ~15%)
  | 'SELF_ATTESTED'        // Claimed in onboarding (Low, ~20%)
  | 'CREDENTIAL_BACKED'    // Certificate uploaded (Medium, ~35-50%)
  | 'PROJECT_PROVEN'       // GitHub repo / code project verified (Medium-High, ~55-70%)
  | 'ASSESSMENT_VERIFIED'  // Proctored diagnostic test passed (High, ~80-88%)
  | 'SIMULATION_VALIDATED' // Real-world troubleshooting / job simulation passed (Very High, ~92-96%)
  | 'INDUSTRY_ENDORSED';   // Employer / internship verified (Ultimate, 100%)

export type SkillProficiency = 'AWARENESS' | 'NOVICE' | 'COMPETENT' | 'PROFICIENT' | 'EXPERT';

export interface EvidenceItem {
  id: string;
  type: 
    | 'RESUME_PARSED'
    | 'CERTIFICATE'
    | 'GITHUB_REPOSITORY'
    | 'DIAGNOSTIC_ASSESSMENT'
    | 'PRACTICAL_SIMULATION'
    | 'EMPLOYER_VERIFICATION';
  title: string;
  sourceUrl?: string;
  score?: number; // 0 - 100 if applicable
  verifiedAt: string; // ISO string
  verifiedBy: string; // e.g. "Vidyut AI Engine", "GitHub Webhook", "Infosys Internship"
  weight: number; // 0.0 - 1.0 contribution
  meta?: Record<string, any>;
}

export interface DecayStatus {
  isDecayed: boolean;
  monthsSinceLastVerification: number;
  originalConfidence: number;
  currentConfidence: number;
  decayPercentage: number;
  refresherRecommended: boolean;
  recommendedRefresherTimeMinutes: number;
  lastActiveDate: string;
}

export interface PassportSkillEntry {
  skillId: string;
  skillName: string;
  category: string; // e.g., 'Backend Architecture', 'Database Engineering', 'AI/ML'
  level: SkillProficiency;
  confidenceScore: number; // 0 - 100%
  authenticityLevel: AuthenticityLevel;
  evidenceItems: EvidenceItem[];
  evidenceBreakdown: {
    assessmentPct: number;
    practicalProjectsPct: number;
    credentialsPct: number;
    industryEndorsementPct: number;
  };
  decay: DecayStatus;
  lastVerifiedAt: string;
  verificationBadgeUrl?: string;
}

export interface SkillPassport {
  passportId: string; // Unique permanent ID, e.g. "VY-PASS-2026-8942"
  passportToken: string; // Public verification token for recruiters
  studentId: string;
  studentName: string;
  institutionName: string;
  degree: string;
  targetRole: string;
  overallAuthenticityScore: number; // 0 - 100%
  totalVerifiedSkills: number;
  skills: PassportSkillEntry[];
  issuedAt: string;
  lastUpdatedAt: string;
  verificationUrl: string;
  digitalSignature: string; // SHA-256 integrity hash
}
