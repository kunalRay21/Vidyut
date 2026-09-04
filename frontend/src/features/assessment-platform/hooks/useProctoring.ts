import { useState, useEffect, useCallback } from 'react';
import { assessmentApi } from '../../../services/api';

interface UseProctoringProps {
  sessionId: string | null;
  maxStrikes?: number;
  onMaxStrikesReached?: () => void;
}

export function useProctoring({
  sessionId,
  maxStrikes = 3,
  onMaxStrikesReached,
}: UseProctoringProps) {
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Visibility change & window blur detection
  useEffect(() => {
    if (!sessionId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const nextCount = prev + 1;
          setShowAlertModal(true);

          // Report telemetry to backend
          assessmentApi.recordHeartbeat(sessionId, {
            time_remaining_seconds: 0, // Heartbeat service ignores 0 or keeps existing
            tab_switch_increment: 1,
          }).catch(err => {
            console.warn('[Proctoring Telemetry] Sync issue:', err.message);
          });

          if (nextCount >= maxStrikes && onMaxStrikesReached) {
            onMaxStrikesReached();
          }
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, maxStrikes, onMaxStrikesReached]);

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request dismissed or blocked:', err);
    }
  }, []);

  const dismissAlert = useCallback(() => {
    setShowAlertModal(false);
  }, []);

  return {
    tabSwitchCount,
    showAlertModal,
    isFullscreen,
    maxStrikes,
    requestFullscreen,
    dismissAlert,
  };
}
