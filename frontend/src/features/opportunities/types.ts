export interface Explanation {
  summary: string;
  matching_skills: string[];
  gap_skills: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  compatibility_score: number;
  source?: string;
  original_url?: string;
  explanation: Explanation;
}
