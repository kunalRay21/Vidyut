export type SimulationDifficulty = 'INTERMEDIATE' | 'ADVANCED' | 'PRODUCTION_CRITICAL';

export interface SystemLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  service: string;
  message: string;
  context?: Record<string, any>;
}

export interface MetricDataPoint {
  time: string;
  cpuPercent: number;
  memoryPercent: number;
  activeDbConnections: number;
  latencyMs: number;
  errorRatePercent: number;
}

export interface JobSimulationScenario {
  id: string;
  title: string;
  targetRole: string;
  difficulty: SimulationDifficulty;
  timeLimitMinutes: number;
  incidentBrief: string;
  impactStatement: string;
  telemetryLogs: SystemLogEntry[];
  metricsTimeline: MetricDataPoint[];
  configFile: {
    filename: string;
    language: string;
    content: string;
  };
  flawedSourceCode: {
    filename: string;
    language: string;
    content: string;
  };
  rootCauseOptions: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  operationalActions: Array<{
    id: string;
    label: string;
    isOptimal: boolean;
    rationale: string;
  }>;
  expectedPatchKeywords: string[];
}

export interface SimulationSubmission {
  scenarioId: string;
  selectedRootCauseId: string;
  selectedActionId: string;
  patchCode: string;
  investigationNotes: string;
}

export interface SimulationEvaluation {
  scenarioId: string;
  overallScore: number;
  logAnalysisScore: number;
  rootCauseScore: number;
  patchScore: number;
  operationalJudgmentScore: number;
  readinessTier: 'INDUSTRY_READY' | 'INTERN_READY' | 'NEEDS_PRACTICE';
  passed: boolean;
  feedback: {
    rootCauseFeedback: string;
    operationalFeedback: string;
    patchFeedback: string;
  };
  passportEvidenceAwarded: boolean;
}
