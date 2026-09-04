import React from 'react';
import { AlertOctagon, ShieldAlert } from 'lucide-react';

interface ProctorAlertModalProps {
  isOpen: boolean;
  strikeCount: number;
  maxStrikes: number;
  onDismiss: () => void;
}

export const ProctorAlertModal: React.FC<ProctorAlertModalProps> = ({
  isOpen,
  strikeCount,
  maxStrikes,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const isCritical = strikeCount >= maxStrikes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="gov-card max-w-md w-full p-6 border-red-500/50 bg-[#0E1726] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500 animate-pulse" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <AlertOctagon className="w-6 h-6 text-red-400" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading font-bold text-lg text-white">
                Proctoring Warning
              </h3>
              <span className="gov-badge text-[10px] bg-red-500/15 text-red-300 border-red-500/30 font-mono">
                Strike {strikeCount} of {maxStrikes}
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Window focus loss or tab switching has been detected and recorded in your telemetry log.
            </p>

            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 mb-5 text-xs text-red-200">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Examination Integrity Policy</span>
              </div>
              <p className="text-red-300/90 text-[11px] leading-normal">
                {isCritical
                  ? 'Maximum tab-switch strikes reached. Telemetry is permanently tagged on candidate calibration report.'
                  : `Please remain inside the examination tab. Reaching ${maxStrikes} strikes may invalidate diagnostic certification.`}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onDismiss}
                className="btn-saffron text-xs font-bold py-2.5 px-6 w-full"
              >
                I Understand, Return to Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
