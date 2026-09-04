import { useState, useEffect, useRef, useCallback } from 'react';
import { assessmentApi } from '../../../services/api';

interface UseExamTimerProps {
  sessionId: string | null;
  initialTimeSeconds: number;
  onExpire: () => void;
  syncIntervalSeconds?: number;
}

export function useExamTimer({
  sessionId,
  initialTimeSeconds,
  onExpire,
  syncIntervalSeconds = 15,
}: UseExamTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTimeSeconds);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Sync initial time when provided from session
  useEffect(() => {
    setTimeRemaining(initialTimeSeconds);
  }, [initialTimeSeconds]);

  // Decrement timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      onExpireRef.current();
      return;
    }

    setIsWarning(timeRemaining <= 300); // < 5 mins
    setIsUrgent(timeRemaining <= 120);  // < 2 mins red pulse

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Periodic heartbeat sync to server
  useEffect(() => {
    if (!sessionId || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      assessmentApi.recordHeartbeat(sessionId, {
        time_remaining_seconds: timeRemaining,
      }).catch(err => {
        console.warn('[Timer Sync] Offline / failed heartbeat:', err.message);
      });
    }, syncIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [sessionId, timeRemaining, syncIntervalSeconds]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isWarning,
    isUrgent,
    setTimeRemaining,
  };
}
