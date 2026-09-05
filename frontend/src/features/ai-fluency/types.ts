export type AIFluencyTier = 'AI_AUGMENTED_ARCHITECT' | 'CRITICAL_VERIFIER' | 'DEVELOPING_AUDITOR' | 'HIGH_HALLUCINATION_RISK';

export interface HallucinationTrap {
  id: string;
  trapType: 'SECURITY_VULNERABILITY' | 'CONCURRENCY_RACE' | 'PERFORMANCE_REDOS' | 'API_DEPRECATION';
  description: string;
  lineRange: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface AIFluencyChallenge {
  id: string;
  title: string;
  taskPrompt: string;
  aiGeneratedResponse: {
    model: string;
    code: string;
    aiExplanation: string;
  };
  embeddedTraps: HallucinationTrap[];
  promptImprovementOptions: Array<{
    id: string;
    promptText: string;
    isOptimal: boolean;
    rationale: string;
  }>;
}

export interface AIFluencyAuditSubmission {
  challengeId: string;
  identifiedTrapIds: string[];
  candidateCritique: string;
  selectedPromptOptionId: string;
  remediatedCode: string;
}

export interface AIFluencyEvaluation {
  challengeId: string;
  overallFluencyScore: number;
  hallucinationCatchScore: number;
  promptPrecisionScore: number;
  codeVerificationScore: number;
  refinementVelocityScore: number;
  fluencyTier: AIFluencyTier;
  passed: boolean;
  trapsDetectedCount: number;
  totalTrapsCount: number;
  critiqueFeedback: string;
  promptFeedback: string;
  passportEvidenceAwarded: boolean;
}
