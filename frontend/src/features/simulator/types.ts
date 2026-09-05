export interface TransferableSkillMatch {
  sourceSkillId: string;
  sourceSkillName: string;
  targetSkillId: string;
  targetSkillName: string;
  transferRatio: number;
  rationale: string;
}

export interface CareerGapSkill {
  skillId: string;
  skillName: string;
  category: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  prerequisites: string[];
}

export interface CareerSimulationResult {
  sourceRoleId: string;
  sourceRoleName: string;
  targetRoleId: string;
  targetRoleName: string;
  targetRoleDescription: string;
  currentReadinessPct: number;
  projectedReadinessPct: number;
  transferabilityIndex: number;
  transferableSkills: TransferableSkillMatch[];
  gapSkills: CareerGapSkill[];
  totalAdditionalSkills: number;
  totalEstimatedHours: number;
  estimatedWeeksAt10HoursPerWeek: number;
  unlockedOpportunitiesEstimate: {
    count: number;
    sampleRoles: string[];
    averageStipend: string;
  };
  executiveSummary: string;
}

export interface SimulatableRole {
  id: string;
  name: string;
  description: string;
  skillCount: number;
}
