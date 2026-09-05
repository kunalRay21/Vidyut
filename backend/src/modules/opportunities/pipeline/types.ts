export type OpportunitySource = 'INTERNSHALA' | 'UNSTOP' | 'AICTE' | 'DIRECT';
export type OpportunityType = 'INTERNSHIP' | 'JOB' | 'HACKATHON' | 'PROJECT';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE';

export interface RawOpportunityItem {
  source: OpportunitySource;
  externalId: string;
  originalUrl: string;
  title: string;
  organization: string;
  typeRaw?: string;
  modeRaw?: string;
  locationRaw?: string;
  deadlineRaw?: string;
  stipendRaw?: string;
  descriptionRaw?: string;
  eligibilityRaw?: string;
  rawSkills: string[];
}

export interface NormalizedOpportunityItem {
  id: string;
  externalId: string;
  source: OpportunitySource;
  originalUrl: string;
  title: string;
  organization: string;
  type: OpportunityType;
  mode: WorkMode;
  location: string;
  deadline: string;
  stipend: string;
  descriptionRaw: string;
  eligibilityRaw: string;
  domainId?: string;
  roleId?: string;
  matchedSkillIds: string[];
  unmatchedSkills: string[];
  fingerprint: string;
}

export interface IngestionResult {
  totalExtracted: number;
  totalNormalized: number;
  totalSaved: number;
  totalDuplicates: number;
  unmatchedSkillsLogged: number;
  sourcesProcessed: OpportunitySource[];
  timestamp: string;
  details?: Array<{
    source: OpportunitySource;
    extracted: number;
    saved: number;
    duplicates: number;
  }>;
}
