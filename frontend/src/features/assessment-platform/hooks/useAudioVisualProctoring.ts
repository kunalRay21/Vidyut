import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProctoringEvent,
  ProctoringStatus,
  ProctoringConsentState,
  VisionDetectionResult,
} from '../types/proctoring';
import { VisionDetector } from '../proctoring/visionDetector';
import { AudioDetector } from '../proctoring/audioDetector';

interface UseAudioVisualProctoringProps {
  sessionId: string | null;
  isActive: boolean;
}

const STORAGE_KEY_PREFIX = 'vidyut_proctoring_events_';

export function useAudioVisualProctoring({
  sessionId,
  isActive,
}: UseAudioVisualProctoringProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [consentState, setConsentState] = useState<ProctoringConsentState>({
    hasRequestedPermissions: false,
    cameraGranted: false,
    micGranted: false,
    consentAgreed: false,
    isReady: false,
  });

  const [status, setStatus] = useState<ProctoringStatus>({
    cameraOk: false,
    micOk: false,
    faceDetected: false,
    multipleFacesDetected: false,
    attentionOk: true,
    audioLevel: 0,
    isLookingAway: false,
    lightingOk: true,
    isTalking: false,
    isQuiet: true,
    activeWarning: null,
  });

  const [events, setEvents] = useState<ProctoringEvent[]>(() => {
    if (typeof window !== 'undefined' && sessionId) {
      try {
        const stored = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
        if (stored) return JSON.parse(stored);
      } catch {
        // Fallback to empty
      }
    }
    return [];
  });

  const [latestVision, setLatestVision] = useState<VisionDetectionResult | null>(null);

  // References for detectors and video
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const visionDetectorRef = useRef<VisionDetector | null>(null);
  const audioDetectorRef = useRef<AudioDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Tracking buffers for multi-frame thresholding to avoid false positives
  const consecutiveMissingFaceFrames = useRef<number>(0);
  const consecutiveMultipleFaceFrames = useRef<number>(0);
  const wasCandidateAbsent = useRef<boolean>(false);
  const gazeBuffer = useRef<boolean[]>([]); // Rolling window of gaze away flags
  const lastWarningTimestamp = useRef<Record<string, number>>({});
  const warningDismissTimer = useRef<any>(null);

  // Save events to session storage
  const recordEvent = useCallback(
    (
      type: ProctoringEvent['type'],
      severity: ProctoringEvent['severity'],
      confidence: number,
      message: string,
      details?: Record<string, any>
    ) => {
      const newEvent: ProctoringEvent = {
        id: `pevt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        type,
        severity,
        confidence,
        message,
        details,
      };

      setEvents((prev) => {
        const updated = [...prev, newEvent];
        if (typeof window !== 'undefined' && sessionId) {
          try {
            sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${sessionId}`, JSON.stringify(updated));
          } catch {
            // Ignore quota errors
          }
        }
        return updated;
      });
    },
    [sessionId]
  );

  // Show a gentle non-disruptive warning with auto-dismiss
  const showWarning = useCallback((warning: string, cooldownKey?: string, cooldownMs = 8000) => {
    const now = Date.now();
    if (cooldownKey) {
      const last = lastWarningTimestamp.current[cooldownKey] || 0;
      if (now - last < cooldownMs) {
        return; // Suppress redundant alerts during cooldown
      }
      lastWarningTimestamp.current[cooldownKey] = now;
    }

    setStatus((prev) => ({ ...prev, activeWarning: warning }));

    if (warningDismissTimer.current) {
      clearTimeout(warningDismissTimer.current);
    }
    warningDismissTimer.current = setTimeout(() => {
      setStatus((prev) => ({ ...prev, activeWarning: null }));
    }, 5000);
  }, []);

  const dismissActiveWarning = useCallback(() => {
    if (warningDismissTimer.current) {
      clearTimeout(warningDismissTimer.current);
    }
    setStatus((prev) => ({ ...prev, activeWarning: null }));
  }, []);

  // Stop all media streams and detectors cleanly
  const stopMonitoring = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Track stop fallback
        }
      });
      streamRef.current = null;
    }

    if (audioDetectorRef.current) {
      audioDetectorRef.current.destroy();
      audioDetectorRef.current = null;
    }

    if (visionDetectorRef.current) {
      visionDetectorRef.current.destroy();
      visionDetectorRef.current = null;
    }

    if (warningDismissTimer.current) {
      clearTimeout(warningDismissTimer.current);
    }

    setStream(null);
    setStatus((prev) => ({
      ...prev,
      cameraOk: false,
      micOk: false,
      activeWarning: null,
    }));
  }, []);

  // Request camera and microphone permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showWarning('Your browser does not support media device capture.');
        return false;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 20 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // We want to detect ambient noise
          autoGainControl: true,
        },
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();

      const cameraGranted = videoTracks.length > 0 && videoTracks[0].readyState === 'live';
      const micGranted = audioTracks.length > 0 && audioTracks[0].readyState === 'live';

      // Attach video to internal hidden/visible video element once
      if (!videoElementRef.current) {
        const vid = document.createElement('video');
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;
        vid.srcObject = mediaStream;
        vid.play().catch(() => {});
        videoElementRef.current = vid;
      } else if (videoElementRef.current.srcObject !== mediaStream) {
        videoElementRef.current.srcObject = mediaStream;
        videoElementRef.current.play().catch(() => {});
      }

      // Initialize detectors
      visionDetectorRef.current = new VisionDetector(160, 120);

      const audioDet = new AudioDetector();
      const audioInitSuccess = audioDet.initialize(mediaStream);
      if (audioInitSuccess) {
        audioDetectorRef.current = audioDet;
        await audioDet.resume();
      }

      // Track disconnection events on tracks
      videoTracks.forEach((t) => {
        t.onended = () => {
          setStatus((prev) => ({ ...prev, cameraOk: false }));
          recordEvent('DEVICE_DISCONNECTED', 'HIGH', 0.95, 'Camera disconnected or video stream ended.');
          showWarning('Camera disconnected. Please reconnect your video device.');
        };
      });

      audioTracks.forEach((t) => {
        t.onended = () => {
          setStatus((prev) => ({ ...prev, micOk: false }));
          recordEvent('DEVICE_DISCONNECTED', 'HIGH', 0.95, 'Microphone disconnected or audio stream ended.');
          showWarning('Microphone disconnected. Please reconnect your audio device.');
        };
      });

      setConsentState((prev) => ({
        ...prev,
        hasRequestedPermissions: true,
        cameraGranted,
        micGranted,
        isReady: cameraGranted && micGranted && prev.consentAgreed,
      }));

      setStatus((prev) => ({
        ...prev,
        cameraOk: cameraGranted,
        micOk: micGranted,
      }));

      recordEvent(
        'PROCTORING_INITIALIZED',
        'INFO',
        1.0,
        'Camera and microphone permissions granted and proctoring initialized.'
      );

      return true;
    } catch (err: any) {
      console.warn('[Proctoring] Permission or media error:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      showWarning(
        isDenied
          ? 'Camera or microphone permission was denied. Please allow access in your browser settings.'
          : 'Could not access camera or microphone devices.'
      );
      setConsentState((prev) => ({
        ...prev,
        hasRequestedPermissions: true,
        cameraGranted: false,
        micGranted: false,
        isReady: false,
      }));
      return false;
    }
  }, [recordEvent, showWarning]);

  // Set user consent acknowledgment
  const setConsentAgreed = useCallback((agreed: boolean) => {
    setConsentState((prev) => ({
      ...prev,
      consentAgreed: agreed,
      isReady: agreed && prev.cameraGranted && prev.micGranted,
    }));
  }, []);

  // Listen for physical device connect/disconnect
  useEffect(() => {
    const handleDeviceChange = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            const hasVideo = devices.some((d) => d.kind === 'videoinput');
            const hasAudio = devices.some((d) => d.kind === 'audioinput');
            setStatus((prev) => {
              const cameraStillPresent = prev.cameraOk && hasVideo;
              const micStillPresent = prev.micOk && hasAudio;
              if (!cameraStillPresent && prev.cameraOk) {
                recordEvent('DEVICE_DISCONNECTED', 'HIGH', 0.9, 'Camera device removed.');
                showWarning('Camera device removed. Please reconnect your camera.');
              }
              return {
                ...prev,
                cameraOk: cameraStillPresent,
                micOk: micStillPresent,
              };
            });
          })
          .catch(() => {});
      }
    };

    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    }
    return () => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
    };
  }, [recordEvent, showWarning]);

  // ----------------------------------------------------------------------------
  // 1. High-Frequency Real-Time Audio Monitoring Loop (60ms / ~16 FPS)
  // Runs whenever media stream is active so voice fluctuation is fluid in preview & exam
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!stream) return;

    let isSubscribed = true;

    const audioInterval = setInterval(() => {
      if (!isSubscribed || !audioDetectorRef.current) return;

      const audioResult = audioDetectorRef.current.analyzeAudio();
      const isQuiet = audioResult.volumeRms < 16 && !audioResult.isTalking;

      // Guarded state update: only triggers React re-render if meaningful change occurred
      setStatus((prev) => {
        if (
          Math.abs(prev.audioLevel - audioResult.volumeRms) < 2 &&
          prev.isTalking === audioResult.isTalking &&
          prev.isQuiet === isQuiet
        ) {
          return prev;
        }
        return {
          ...prev,
          audioLevel: audioResult.volumeRms,
          isTalking: audioResult.isTalking,
          isQuiet,
        };
      });

      // Active exam proctoring violation alerts for speech & background noise
      if (isActive && consentState.isReady) {
        if (audioResult.isTalking) {
          recordEvent(
            'CANDIDATE_TALKING',
            'HIGH',
            0.9,
            'Candidate verbal communication or speech detected.',
            { volume: audioResult.volumeRms, peakFrequency: audioResult.peakFrequency }
          );
          showWarning(
            'Candidate speech detected: Talking or reading questions aloud is strictly prohibited!',
            'TALKING_ALERT',
            7000
          );
        } else if (audioResult.isBackgroundNoise) {
          recordEvent(
            'BACKGROUND_NOISE',
            'MEDIUM',
            0.82,
            'Sustained ambient background noise detected.',
            { volume: audioResult.volumeRms }
          );
          showWarning(
            'Elevated background noise detected: Please maintain a quiet testing environment.',
            'BACKGROUND_NOISE_ALERT',
            9000
          );
        }
      }
    }, 100);

    return () => {
      isSubscribed = false;
      clearInterval(audioInterval);
    };
  }, [stream, isActive, consentState.isReady, recordEvent, showWarning]);

  // ----------------------------------------------------------------------------
  // 2. Vision & Face Analysis Loop (2.5 FPS / 400ms for lightweight CPU footprint)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!stream || !isActive || !consentState.isReady) return;

    let isSubscribed = true;

    const intervalId = setInterval(async () => {
      if (!isSubscribed) return;

      try {
        let visionRes: VisionDetectionResult | null = null;
        if (visionDetectorRef.current && videoElementRef.current) {
          visionRes = await visionDetectorRef.current.analyzeFrame(videoElementRef.current);
          setLatestVision(visionRes);
        }

        if (!visionRes) return;

        // 3. Multi-Signal Thresholding & False-Positive Mitigation

        // A. Face Absence / Candidate Leaving
        if (!visionRes.faceDetected) {
          consecutiveMissingFaceFrames.current++;
          // ~12 consecutive ticks at 400ms = ~5 seconds of face absence
          if (consecutiveMissingFaceFrames.current >= 12) {
            wasCandidateAbsent.current = true;
            recordEvent(
              'FACE_NOT_DETECTED',
              'MEDIUM',
              0.88,
              'Candidate face not detected in camera frame for over 5 seconds.'
            );
            showWarning(
              'Face not detected: Please ensure your face is clearly visible to the camera.',
              'FACE_MISSING_ALERT',
              10000
            );
          }
        } else {
          // If candidate was previously absent and now returns
          if (wasCandidateAbsent.current) {
            wasCandidateAbsent.current = false;
            recordEvent('CANDIDATE_RETURNED', 'INFO', 0.95, 'Candidate returned to camera view.');
          }
          consecutiveMissingFaceFrames.current = 0;
        }

        // B. Multiple Faces in Frame
        if (visionRes.faceCount > 1) {
          consecutiveMultipleFaceFrames.current++;
          // Require 3 consecutive frames (~1.2s) to confirm multiple people
          if (consecutiveMultipleFaceFrames.current >= 3) {
            recordEvent(
              'MULTIPLE_FACES',
              'HIGH',
              0.9,
              `Multiple individuals detected in camera frame (${visionRes.faceCount} faces).`,
              { faceCount: visionRes.faceCount }
            );
            showWarning(
              'Multiple faces detected: Only the candidate taking the assessment is permitted.',
              'MULTIPLE_FACES_ALERT',
              12000
            );
          }
        } else {
          consecutiveMultipleFaceFrames.current = 0;
        }

        // C. Gaze / Attention Tracking (Rolling Window of 15 samples)
        if (visionRes.faceDetected) {
          gazeBuffer.current.push(visionRes.isLookingAway);
          if (gazeBuffer.current.length > 15) {
            gazeBuffer.current.shift();
          }

          // Count how many times candidate looked away in recent window
          const lookingAwayCount = gazeBuffer.current.filter(Boolean).length;
          const lookingAwayRatio = lookingAwayCount / gazeBuffer.current.length;

          // Flag only sustained looking away (>60% of last 15 checks, ~6 seconds)
          if (gazeBuffer.current.length >= 12 && lookingAwayRatio >= 0.6) {
            recordEvent(
              'LOOKING_AWAY',
              'LOW',
              Math.min(0.9, visionRes.gazeConfidence + 0.05),
              'Candidate frequently or sustainedly looking away from the assessment screen.',
              { direction: visionRes.gazeDirection, lookingAwayRatio: Math.round(lookingAwayRatio * 100) }
            );
            showWarning(
              'Attention check: Please keep your focus oriented toward the assessment screen.',
              'GAZE_AWAY_ALERT',
              14000
            );
            // Reset part of buffer so we don't spam
            gazeBuffer.current = gazeBuffer.current.slice(6);
          }
        }

        // D. Lighting / Scene Occlusion
        if (visionRes.lightingScore < 12 || visionRes.isSceneChanged) {
          recordEvent(
            'LIGHTING_ANOMALY',
            'LOW',
            0.82,
            'Significant lighting change or camera feed occlusion detected.',
            { lightingScore: visionRes.lightingScore }
          );
        }

        // Update consolidated proctoring status only if values actually changed
        setStatus((prev) => {
          const faceDetected = visionRes ? visionRes.faceDetected : false;
          const multipleFacesDetected = visionRes ? visionRes.faceCount > 1 : false;
          const attentionOk = visionRes ? !visionRes.isLookingAway : true;
          const isLookingAway = visionRes ? visionRes.isLookingAway : false;
          const lightingOk = visionRes ? visionRes.lightingScore >= 15 : true;

          if (
            prev.faceDetected === faceDetected &&
            prev.multipleFacesDetected === multipleFacesDetected &&
            prev.attentionOk === attentionOk &&
            prev.isLookingAway === isLookingAway &&
            prev.lightingOk === lightingOk
          ) {
            return prev;
          }

          return {
            ...prev,
            faceDetected,
            multipleFacesDetected,
            attentionOk,
            isLookingAway,
            lightingOk,
          };
        });
      } catch (err) {
        console.warn('[Proctoring Engine] Cycle error:', err);
      }
    }, 400);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [stream, isActive, recordEvent, showWarning]);

  // Teardown when component unmounts
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    stream,
    consentState,
    status,
    events,
    latestVision,
    requestPermissions,
    setConsentAgreed,
    stopMonitoring,
    dismissActiveWarning,
  };
}
