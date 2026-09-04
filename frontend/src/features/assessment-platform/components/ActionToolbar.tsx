import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, XCircle, Send } from 'lucide-react';

interface ActionToolbarProps {
  hasSelectedOption: boolean;
  isMarkedForReview: boolean;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClearOption: () => void;
  onToggleMarkForReview: () => void;
  onOpenSubmitModal: () => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  hasSelectedOption,
  isMarkedForReview,
  isFirstQuestion,
  isLastQuestion,
  onPrev,
  onNext,
  onClearOption,
  onToggleMarkForReview,
  onOpenSubmitModal,
}) => {
  // Global Hotkey listener (Alt + N, Alt + P, Alt + M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          if (isLastQuestion) onOpenSubmitModal();
          else onNext();
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          if (!isFirstQuestion) onPrev();
        } else if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          onToggleMarkForReview();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirstQuestion, isLastQuestion, onPrev, onNext, onToggleMarkForReview, onOpenSubmitModal]);

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3">
      {/* Left Group: Clear & Mark for Review */}
      <div className="flex items-center gap-2">
        {/* Clear Option */}
        <button
          onClick={onClearOption}
          disabled={!hasSelectedOption}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            hasSelectedOption
              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              : 'bg-transparent text-slate-300 border-transparent cursor-not-allowed'
          }`}
          title="Clear selected choice"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Clear Choice</span>
        </button>

        {/* Mark for Review Toggle */}
        <button
          onClick={onToggleMarkForReview}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            isMarkedForReview
              ? 'bg-purple-100 text-purple-800 border-purple-300'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
          }`}
          title="Mark this question to review later (Alt+M)"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-purple-600 text-purple-600' : ''}`} />
          <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">[Alt+M]</span>
        </button>
      </div>

      {/* Right Group: Navigation & Save */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={isFirstQuestion}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
            isFirstQuestion
              ? 'bg-transparent text-slate-300 border-transparent cursor-not-allowed'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
          }`}
          title="Previous question (Alt+P)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">[Alt+P]</span>
        </button>

        {/* Next / Finish */}
        {isLastQuestion ? (
          <button
            onClick={onOpenSubmitModal}
            className="btn-saffron text-xs font-semibold py-2 px-5 flex items-center gap-1.5"
            title="Review and submit assessment"
          >
            <span>Review & Submit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onNext}
            className="btn-green text-xs font-semibold py-2 px-5 flex items-center gap-1.5"
            title="Save answer and go to next (Alt+N)"
          >
            <span>Save & Next</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[10px] text-white/80 font-mono hidden sm:inline">[Alt+N]</span>
          </button>
        )}
      </div>
    </div>
  );
};
