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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="gov-card max-w-lg w-full p-6 border-slate-200 bg-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Confirm Assessment Submission
            </h3>
            <p className="text-xs text-slate-500">
              Please review your question breakdown before finalizing your diagnostic calibration.
            </p>
          </div>
        </div>

        {/* Summary Card Grid */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {/* Answered */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs mb-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Answered</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-800">
              {summaryCounts.answered}
            </div>
            <div className="text-[10px] text-slate-500">questions</div>
          </div>

          {/* Marked for Review */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-700 text-xs mb-1 font-medium">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Marked</span>
            </div>
            <div className="text-2xl font-bold font-mono text-purple-800">
              {summaryCounts.marked}
            </div>
            <div className="text-[10px] text-slate-500">for review</div>
          </div>

          {/* Unanswered */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-700 text-xs mb-1 font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Unanswered</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-800">
              {unanswered}
            </div>
            <div className="text-[10px] text-slate-500">blank</div>
          </div>
        </div>

        {/* Warning if unanswered */}
        {unanswered > 0 && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              You have <span className="font-bold font-mono">{unanswered}</span> unanswered question(s). Unanswered questions will count as incorrect in diagnostic calibration.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            Return to Exam
          </button>

          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="btn-saffron text-xs font-semibold py-2 px-5 shadow-xs flex items-center gap-2"
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
