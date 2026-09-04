import React from 'react';
import { Send, AlertCircle, CheckCircle2, Bookmark, HelpCircle } from 'lucide-react';

interface SubmitConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  summaryCounts: {
    answered: number;
    marked: number;
    visited: number;
    notVisited: number;
    total: number;
  };
}

export const SubmitConfirmation: React.FC<SubmitConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  isSubmitting,
  summaryCounts,
}) => {
  if (!isOpen) return null;

  const unanswered = summaryCounts.total - summaryCounts.answered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="gov-card max-w-lg w-full p-6 border-saffron/40 bg-[#0E1726] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron via-white to-indiaGreen" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-saffron/15 border border-saffron/30 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Confirm Assessment Submission
            </h3>
            <p className="text-xs text-slate-400">
              Please review your summary before finalizing your diagnostic calibration.
            </p>
          </div>
        </div>

        {/* Summary Card Grid */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {/* Answered */}
          <div className="p-3 rounded-xl bg-[#111D32] border border-[#1F3152] text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Answered</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {summaryCounts.answered}
            </div>
            <div className="text-[10px] text-slate-400">questions</div>
          </div>

          {/* Marked for Review */}
          <div className="p-3 rounded-xl bg-[#111D32] border border-[#1F3152] text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400 text-xs mb-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Marked</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {summaryCounts.marked}
            </div>
            <div className="text-[10px] text-slate-400">for review</div>
          </div>

          {/* Unanswered */}
          <div className="p-3 rounded-xl bg-[#111D32] border border-[#1F3152] text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Unanswered</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {unanswered}
            </div>
            <div className="text-[10px] text-slate-400">blank</div>
          </div>
        </div>

        {/* Warning if unanswered */}
        {unanswered > 0 && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              You have <span className="font-bold font-mono">{unanswered}</span> unanswered question(s). Unanswered questions will be evaluated as incorrect in diagnostic scoring.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-[#111D32] hover:bg-[#172540] border border-[#1F3152] transition-colors"
          >
            Return to Exam
          </button>

          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="btn-saffron text-xs font-bold py-2.5 px-6 shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>Confirm & Grade</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
