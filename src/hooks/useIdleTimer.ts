import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION_MS = 60 * 1000; // 60 seconds warning
const IDLE_WARNING_THRESHOLD_MS = IDLE_TIMEOUT_MS - WARNING_DURATION_MS; // 14 minutes

export interface IdleTimerResult {
  showWarning: boolean;
  secondsRemaining: number;
  extendSession: () => void;
}

export const useIdleTimer = (): IdleTimerResult => {
  const { currentUser, logout } = useAuthStore();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<number | null>(null);

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(60);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setShowWarning(false);
      return;
    }

    const handleActivity = () => {
      // Only reset activity if warning modal is not currently open
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    const checkIdleInterval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Auto-logout after 15 minutes idle
        setShowWarning(false);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        logout();
      } else if (elapsed >= IDLE_WARNING_THRESHOLD_MS && !showWarning) {
        // Trigger 60-second warning modal
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setSecondsRemaining(remaining);

        countdownIntervalRef.current = window.setInterval(() => {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 2000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearInterval(checkIdleInterval);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [currentUser, logout, showWarning]);

  return { showWarning, secondsRemaining, extendSession };
};
