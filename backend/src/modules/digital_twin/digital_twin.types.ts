/**
 * Vidyut Digital Twin & 12-Hour Crunch Prep Types
 * Holistic explainable readiness modeling and precision opportunity prep plans.
 */

export interface PrepPlanHourBlock {
  hourRange: string; // e.g. "Hour 1 - 3"
  phaseTitle: string; // e.g. "High-Yield Architectural Concepts"
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
  impactPercent: number; // e.g. +14 or -8
  title: string;
  explanation: string;
  actionableStep: string;
}

export interface DigitalTwinPillars {
  foundationalSyllabus: number; // 0 - 100
  evidenceAuthenticity: number; // 0 - 100
  operationalSandbox: number; // 0 - 100
  recencyVelocity: number; // 0 - 100
}

export interface DigitalTwinProfile {
  studentId: string;
  targetRole: string;
  overallReadinessScore: number; // 0 - 100
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
