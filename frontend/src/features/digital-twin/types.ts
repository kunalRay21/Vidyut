export interface PrepPlanHourBlock {
  hourRange: string;
  phaseTitle: string;
  durationMinutes: number;
  topicsCovered: string[];
  keyQuestionsToMaster: string[];
  recommendedAction: string;
}

export interface Opportunity12HourPlan {
  opportunityId: string;
  roleTitle: string;
  companyName: string;
  stipendOrSalary: string;
  applicationDeadlineHoursRemaining: number;
  currentMatchPercentage: number;
  projectedMatchPercentageAfterPlan: number;
  identifiedGaps: Array<{
    skillName: string;
    priority: 'HIGH' | 'MEDIUM';
    interviewFrequency: string;
  }>;
  schedule: PrepPlanHourBlock[];
  cheatSheetSummary: {
    coreFormulas: string[];
    commonGotchas: string[];
    architectureTip: string;
  };
}

export interface ExplainableReadinessFactor {
  pillar: 'FOUNDATIONAL' | 'AUTHENTICITY' | 'OPERATIONAL_SANDBOX' | 'RECENCY_HEALTH';
  impactPercent: number;
  title: string;
  explanation: string;
  actionableStep: string;
}

export interface DigitalTwinPillars {
  foundationalSyllabus: number;
  evidenceAuthenticity: number;
  operationalSandbox: number;
  recencyVelocity: number;
}

export interface DigitalTwinProfile {
  studentId: string;
  targetRole: string;
  overallReadinessScore: number;
  readinessBand: 'INTERVIEW_READY' | 'COMPETITIVE_CANDIDATE' | 'FOUNDATION_BUILDER';
  pillars: DigitalTwinPillars;
  attributionFactors: ExplainableReadinessFactor[];
  unlockedOpportunityCount: number;
  lastSimulatedTimestamp: string;
}

export interface WhatIfScenarioInput {
  refreshDecayedSkills: boolean;
  completeSandboxSimulation: boolean;
  masterTwoGapSkills: boolean;
  verifyGithubEvidence: boolean;
}

export interface WhatIfScenarioResult {
  currentScore: number;
  projectedScore: number;
  scoreDelta: number;
  newReadinessBand: string;
  newUnlockedOpportunities: number;
  timeInvestmentHours: number;
  actionSummary: string;
}
