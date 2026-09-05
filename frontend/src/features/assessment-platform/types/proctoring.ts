// ==============================================================================
// Assessment Platform Audio-Visual Proctoring Domain Types
// ==============================================================================

export type ProctoringEventType =
  | 'FACE_NOT_DETECTED'
  | 'MULTIPLE_FACES'
  | 'LOOKING_AWAY'
  | 'CANDIDATE_RETURNED'
  | 'LIGHTING_ANOMALY'
  | 'AUDIO_NOISE_SPIKE'
  | 'CANDIDATE_TALKING'
  | 'BACKGROUND_NOISE'
  | 'DEVICE_DISCONNECTED'
  | 'DEVICE_RESTORED'
  | 'PROCTORING_INITIALIZED';

export type ProctoringSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProctoringEvent {
  id: string;
  timestamp: number;
  type: ProctoringEventType;
  confidence: number; // 0.0 to 1.0
  severity: ProctoringSeverity;
  message: string;
  details?: Record<string, any>;
}

export interface ProctoringStatus {
  cameraOk: boolean;
  micOk: boolean;
  faceDetected: boolean;
  multipleFacesDetected: boolean;
  attentionOk: boolean;
  audioLevel: number; // 0 to 100
  isLookingAway: boolean;
  lightingOk: boolean;
  isTalking: boolean;
  isQuiet: boolean;
  activeWarning: string | null;
}

export interface ProctoringConsentState {
  hasRequestedPermissions: boolean;
  cameraGranted: boolean;
  micGranted: boolean;
  consentAgreed: boolean;
  isReady: boolean;
}

export interface VisionDetectionResult {
  faceDetected: boolean;
  faceCount: number;
  isLookingAway: boolean;
  gazeDirection: 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UNKNOWN';
  gazeConfidence: number;
  lightingScore: number; // 0 to 100
  isSceneChanged: boolean;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AudioDetectionResult {
  volumeRms: number; // 0 to 100
  peakFrequency: number;
  isSustainedNoise: boolean;
  isSpeechLikely: boolean;
  isTalking: boolean;
  isBackgroundNoise: boolean;
}
