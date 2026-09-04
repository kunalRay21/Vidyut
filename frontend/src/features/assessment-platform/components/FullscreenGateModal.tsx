import React, { useState, useEffect } from 'react';
import { Maximize2, ShieldAlert, Monitor, Clock, AlertTriangle, Layers } from 'lucide-react';

interface FullscreenGateModalProps {
  isOpen: boolean;
  onEnterFullscreen: () => void;
  hasStarted: boolean;
  onTimeoutAutoSubmit?: () => void;
  timeoutSeconds?: number;
  otherTabsDetected?: boolean;
}

export const FullscreenGateModal: React.FC<FullscreenGateModalProps> = ({
  isOpen,
  onEnterFullscreen,
  hasStarted,
  onTimeoutAutoSubmit,
  timeoutSeconds = 180, // 3 minutes window
  otherTabsDetected = false,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeoutSeconds);
  const [isTabsClosedConfirmed, setIsTabsClosedConfirmed] = useState(false);

  // 3-Minute countdown timer when gate is triggered during an active test
  useEffect(() => {
    if (!isOpen || !hasStarted) {
      setSecondsRemaining(timeoutSeconds);
      return;
    }

    setSecondsRemaining(timeoutSeconds);

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeoutAutoSubmit) {
            onTimeoutAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, hasStarted, timeoutSeconds, onTimeoutAutoSubmit]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = secondsRemaining < 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="max-w-md w-full bg-white rounded-2xl p-7 border border-slate-200 shadow-2xl text-center space-y-4 relative overflow-hidden">
        {/* Top subtle tricolor stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-700 to-emerald-600" />

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs ${
          hasStarted ? 'bg-blue-50 border border-blue-200 text-blue-600' : 'bg-amber-50 border border-amber-200 text-amber-700'
        }`}>
          {hasStarted ? <Monitor className="w-7 h-7" /> : <Layers className="w-7 h-7" />}
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            {hasStarted ? 'Integrity Timeout Active' : 'Single-Tab Assessment Policy'}
          </span>
          <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
            {hasStarted ? 'Fullscreen Mode Exited' : 'Close All Other Tabs to Begin'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {hasStarted
              ? 'You have exited fullscreen mode. You have a strict 3-minute grace window to re-enter fullscreen, after which your assessment will be forcefully auto-submitted.'
              : 'Examination proctoring requires all other browser tabs, windows, and applications to be closed. Only this single examination tab is permitted.'}
          </p>
        </div>

        {/* Other Tabs Detected Alert */}
        {!hasStarted && otherTabsDetected && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-left text-xs text-amber-900 flex items-start gap-2.5 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Other browser tabs or windows detected!</span>
              <span>Please close all other tabs and windows before starting your assessment.</span>
            </div>
          </div>
        )}

        {/* 3-Minute Grace Countdown Box */}
        {hasStarted && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
              isUrgent
                ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              {isUrgent ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
              <span>Auto-Submit Countdown:</span>
            </div>
            <div className="font-mono text-base font-bold tracking-wider">
              {formattedCountdown}
            </div>
          </div>
        )}

        {/* Rules Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 text-slate-700">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
            Examination Security Checklist:
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
            <li><strong>All other tabs & windows must be closed</strong> before entering</li>
            <li>Continuous fullscreen enforced throughout assessment</li>
            <li>Strict 3-minute grace timer to resume if fullscreen is exited</li>
            <li>Tab switches strictly limited to 4 before automatic termination</li>
          </ul>
        </div>

        {/* Mandatory Pre-Start Confirmation Checkbox */}
        {!hasStarted && (
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer text-left select-none hover:bg-blue-50 transition-colors">
            <input
              type="checkbox"
              checked={isTabsClosedConfirmed}
              onChange={(e) => setIsTabsClosedConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[11px] text-blue-900 leading-snug font-medium">
              I confirm that <strong>I have closed all other browser tabs and applications</strong>. I understand that opening or switching tabs will incur immediate proctoring penalties.
            </span>
          </label>
        )}

        {/* Action Button */}
        <button
          onClick={onEnterFullscreen}
          disabled={!hasStarted && !isTabsClosedConfirmed}
          className={`w-full py-3 px-6 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            !hasStarted && !isTabsClosedConfirmed
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span>{hasStarted ? 'Resume Fullscreen Immediately' : 'Enter Fullscreen & Begin Assessment'}</span>
        </button>
      </div>
    </div>
  );
};
