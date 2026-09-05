import { useState, useEffect, useCallback } from 'react';
import { assessmentApi } from '../../../services/api';

interface UseProctoringProps {
  sessionId: string | null;
  maxStrikes?: number;
  onMaxStrikesReached?: () => void;
  isActive?: boolean;
}

export function useProctoring({
  sessionId,
  maxStrikes = 4,
  onMaxStrikesReached,
  isActive = true,
}: UseProctoringProps) {
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return Boolean(document.fullscreenElement);
  });
  const [hasEnteredFullscreenOnce, setHasEnteredFullscreenOnce] = useState<boolean>(false);
  const [isForceSubmitted, setIsForceSubmitted] = useState<boolean>(false);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (active) {
        setHasEnteredFullscreenOnce(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Request fullscreen function
  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setHasEnteredFullscreenOnce(true);
    } catch (err) {
      console.warn('Fullscreen request dismissed or blocked:', err);
      setIsFullscreen(true);
      setHasEnteredFullscreenOnce(true);
    }
  }, []);

  // Tab switch & visibility change listener
  useEffect(() => {
    if (!sessionId || !isActive || isForceSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const nextCount = prev + 1;
          setShowAlertModal(true);

          // Report telemetry to backend
          assessmentApi.recordHeartbeat(sessionId, {
            time_remaining_seconds: 0,
            tab_switch_increment: 1,
          }).catch(err => {
            console.warn('[Proctoring Telemetry] Sync issue:', err.message);
          });

          // Forceful auto-submission at 4 strikes
          if (nextCount >= maxStrikes) {
            setIsForceSubmitted(true);
            if (onMaxStrikesReached) {
              onMaxStrikesReached();
            }
          }
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, isActive, isForceSubmitted, maxStrikes, onMaxStrikesReached]);

  const dismissAlert = useCallback(() => {
    setShowAlertModal(false);
  }, []);

  return {
    tabSwitchCount,
    showAlertModal,
    isFullscreen,
    hasEnteredFullscreenOnce,
    maxStrikes,
    isForceSubmitted,
    requestFullscreen,
    dismissAlert,
  };
}
