import React from 'react';
import { AlertOctagon, ShieldAlert, XCircle } from 'lucide-react';

interface ProctorAlertModalProps {
  isOpen: boolean;
  strikeCount: number;
  maxStrikes: number;
  onDismiss: () => void;
  isForceSubmitted?: boolean;
}

export const ProctorAlertModal: React.FC<ProctorAlertModalProps> = ({
  isOpen,
  strikeCount,
  maxStrikes,
  onDismiss,
  isForceSubmitted = false,
}) => {
  if (!isOpen) return null;

  const isTerminated = strikeCount >= maxStrikes || isForceSubmitted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn select-none">
      <div className="gov-card max-w-md w-full p-6 border-rose-300 bg-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600 animate-pulse" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
            {isTerminated ? (
              <XCircle className="w-7 h-7 text-rose-600" />
            ) : (
              <AlertOctagon className="w-7 h-7 text-rose-600" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {isTerminated ? 'Assessment Terminated' : 'Tab Switch Warning'}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isTerminated
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {isTerminated ? 'TERMINATED' : `Strike ${strikeCount} of ${maxStrikes}`}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isTerminated
                ? `You have exceeded the maximum permitted tab switches (${maxStrikes} of ${maxStrikes}). Your examination has been forcefully completed and submitted.`
                : `Leaving or switching away from the examination tab is prohibited. You have received strike ${strikeCount} of ${maxStrikes}.`}
            </p>

            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Zero-Tolerance Integrity Rule</span>
              </div>
              <p className="text-rose-700 text-[11px] leading-normal">
                {isTerminated
                  ? 'All recorded answers have been locked and submitted for calibrated scoring.'
                  : `A total of ${maxStrikes} tab switches will immediately trigger an automatic forceful completion of your exam.`}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onDismiss}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isTerminated
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'btn-saffron'
                }`}
              >
                {isTerminated ? 'View Diagnostic Results' : 'I Understand, Return to Assessment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
