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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="gov-card max-w-md w-full p-6 border-red-300 bg-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
            <AlertOctagon className="w-6 h-6 text-red-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Proctoring Warning
              </h3>
              <span className="gov-badge text-[10px] bg-red-50 text-red-700 border-red-200 font-mono">
                Strike {strikeCount} of {maxStrikes}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
              Window focus loss or tab switching has been detected and recorded in your examination telemetry log.
            </p>

            <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4 text-xs text-red-800">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Examination Integrity Policy</span>
              </div>
              <p className="text-red-700 text-[11px] leading-normal">
                {isCritical
                  ? 'Maximum tab-switch strikes reached. Telemetry is permanently tagged on candidate calibration report.'
                  : `Please remain inside the examination tab. Reaching ${maxStrikes} strikes may invalidate diagnostic certification.`}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onDismiss}
                className="btn-saffron text-xs font-semibold py-2 px-5 w-full"
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
