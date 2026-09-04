export interface Explanation {
  summary: string;
  matching_skills: string[];
  gap_skills: string[];
  gap_severity?: string;
  career_alignment?: string;
  eligibility_status?: string;
}

export interface CompatibilityScores {
  total: number;
  skillMatch: number;
  careerAlignment: number;
  eligibility: number;
  interest: number;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  compatibility_score: number;
  source?: string;
  original_url?: string;
  type?: string;
  mode?: string;
  location?: string | null;
  deadline?: string | null;
  stipend?: string | null;
  scores?: CompatibilityScores;
  explanation: Explanation;
}
