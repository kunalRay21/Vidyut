import React from 'react';
import { Maximize2, ShieldAlert, Monitor } from 'lucide-react';

interface FullscreenGateModalProps {
  isOpen: boolean;
  onEnterFullscreen: () => void;
  hasStarted: boolean;
}

export const FullscreenGateModal: React.FC<FullscreenGateModalProps> = ({
  isOpen,
  onEnterFullscreen,
  hasStarted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="max-w-md w-full bg-white rounded-2xl p-7 border border-slate-200 shadow-2xl text-center space-y-5 relative overflow-hidden">
        {/* Top subtle tricolor stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-700 to-emerald-600" />

        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
          <Monitor className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            Mandatory Proctoring Policy
          </span>
          <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
            {hasStarted ? 'Fullscreen Mode Exited' : 'Fullscreen Mode Required'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {hasStarted
              ? 'You have exited fullscreen mode. In accordance with examination regulations, you must remain in fullscreen until your test is submitted.'
              : 'The Vidyut Calibrated Diagnostic Examination must be taken in continuous fullscreen mode from start to finish.'}
          </p>
        </div>

        {/* Rules Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 text-slate-700">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
            Examination Integrity Rules:
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
            <li>Continuous fullscreen enforced until test submission</li>
            <li>Tab switching strictly monitored (Strict 4-strike limit)</li>
            <li>4th tab switch triggers <strong className="text-rose-700">forceful auto-submission</strong></li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onEnterFullscreen}
          className="w-full py-3 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span>{hasStarted ? 'Re-enter Fullscreen to Continue' : 'Enter Fullscreen & Begin Assessment'}</span>
        </button>
      </div>
    </div>
  );
};
