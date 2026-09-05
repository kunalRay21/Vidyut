export type AuthenticityLevel = 
  | 'UNVERIFIED_CLAIM'
  | 'SELF_ATTESTED'
  | 'CREDENTIAL_BACKED'
  | 'PROJECT_PROVEN'
  | 'ASSESSMENT_VERIFIED'
  | 'SIMULATION_VALIDATED'
  | 'INDUSTRY_ENDORSED';

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
  score?: number;
  verifiedAt: string;
  verifiedBy: string;
  weight: number;
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
  category: string;
  level: SkillProficiency;
  confidenceScore: number;
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
  passportId: string;
  passportToken: string;
  studentId: string;
  studentName: string;
  institutionName: string;
  degree: string;
  targetRole: string;
  overallAuthenticityScore: number;
  totalVerifiedSkills: number;
  skills: PassportSkillEntry[];
  issuedAt: string;
  lastUpdatedAt: string;
  verificationUrl: string;
  digitalSignature: string;
}
