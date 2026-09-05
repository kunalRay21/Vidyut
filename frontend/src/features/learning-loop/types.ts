export interface DiagnosticConceptGap {
  conceptId: string;
  conceptTitle: string;
  category: string;
  errorPattern: string;
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
  misunderstoodPrinciple: string;
}

export interface MicroLearningDrill {
  id: string;
  conceptId: string;
  title: string;
  readingMinutes: number;
  coreRule: string;
  codeSnippet: {
    language: string;
    flawedCode: string;
    correctedCode: string;
    explanation: string;
  };
  checkpointQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface ReassessmentQuestion {
  id: string;
  conceptId: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  weight: number;
}

export interface DiagnosticRemediationPackage {
  loopId: string;
  studentId: string;
  sourceExamId: string;
  sourceExamTitle: string;
  skillId: string;
  skillName: string;
  initialScore: number;
  status: 'PENDING_REVIEW' | 'DRILL_IN_PROGRESS' | 'READY_FOR_REASSESSMENT' | 'MASTERED';
  conceptGaps: DiagnosticConceptGap[];
  microDrill: MicroLearningDrill;
  reassessmentQuestions: ReassessmentQuestion[];
  createdTimestamp: string;
  reassessmentScore?: number;
  masteryAchieved?: boolean;
}
