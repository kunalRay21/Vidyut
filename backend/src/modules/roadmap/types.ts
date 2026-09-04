export type RoadmapSkillStatus =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface RoadmapSkill {
  id: string;
  name: string;
  category?: string;
  proficiency?: string;
  status: RoadmapSkillStatus;
}

export interface RoadmapMilestone {
  id: string;
  skill_id: string;
  title: string;
  description: string;
  order: number;
}

export interface RoadmapDecisionOption {
  id: string;
  name: string;
}

export interface RoadmapDecisionPoint {
  branch_id: string;
  name: string;
  options: RoadmapDecisionOption[];
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  milestones: RoadmapMilestone[];
  decision_point?: RoadmapDecisionPoint;
}

export interface PersonalizedRoadmap {
  role_id: string;
  role_name: string;
  readiness_pct: number;
  phases: RoadmapPhase[];
}

export interface BranchChoice {
  student_id: string;
  branch_id: string;
  option_id: string;
}