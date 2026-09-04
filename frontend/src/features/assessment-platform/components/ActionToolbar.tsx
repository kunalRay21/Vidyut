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
    <div className="border-t border-[#1F3152] bg-[#0E1726] p-4 flex flex-wrap items-center justify-between gap-3">
      {/* Left Group: Clear & Mark for Review */}
      <div className="flex items-center gap-2">
        {/* Clear Option */}
        <button
          onClick={onClearOption}
          disabled={!hasSelectedOption}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
            hasSelectedOption
              ? 'bg-[#111D32] hover:bg-[#172540] text-slate-300 border-[#1F3152] hover:text-white'
              : 'bg-transparent text-slate-600 border-transparent cursor-not-allowed'
          }`}
          title="Clear selected choice"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Clear Choice</span>
        </button>

        {/* Mark for Review Toggle */}
        <button
          onClick={onToggleMarkForReview}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
            isMarkedForReview
              ? 'bg-purple-600/30 text-purple-300 border-purple-500 shadow-sm'
              : 'bg-[#111D32] hover:bg-[#172540] text-slate-300 border-[#1F3152] hover:text-white'
          }`}
          title="Mark this question to review later (Alt+M)"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-purple-400 text-purple-400' : ''}`} />
          <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">[Alt+M]</span>
        </button>
      </div>

      {/* Right Group: Navigation & Save */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={isFirstQuestion}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            isFirstQuestion
              ? 'bg-transparent text-slate-600 border-transparent cursor-not-allowed'
              : 'bg-[#111D32] hover:bg-[#172540] text-slate-200 border-[#1F3152] hover:border-slate-500'
          }`}
          title="Previous question (Alt+P)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">[Alt+P]</span>
        </button>

        {/* Next / Finish */}
        {isLastQuestion ? (
          <button
            onClick={onOpenSubmitModal}
            className="btn-saffron text-xs font-bold py-2 px-5 shadow-sm flex items-center gap-1.5"
            title="Review and submit assessment"
          >
            <span>Review & Submit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onNext}
            className="btn-green text-xs font-bold py-2 px-5 shadow-sm flex items-center gap-1.5"
            title="Save answer and go to next (Alt+N)"
          >
            <span>Save & Next</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[10px] text-white/70 font-mono hidden sm:inline">[Alt+N]</span>
          </button>
        )}
      </div>
    </div>
  );
};
