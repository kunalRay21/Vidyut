import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, RotateCcw, Send } from 'lucide-react';

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
    <footer className="h-16 border-t border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between z-10 flex-shrink-0">
      {/* Left Group: Clear & Mark for Review */}
      <div className="flex items-center gap-2.5">
        {/* Clear Option */}
        <button
          onClick={onClearOption}
          disabled={!hasSelectedOption}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            hasSelectedOption
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Clear selected option"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        {/* Mark for Review Toggle */}
        <button
          onClick={onToggleMarkForReview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isMarkedForReview
              ? 'bg-purple-50 text-purple-700 border-purple-300'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
          }`}
          title="Mark for Review (Alt+M)"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-purple-600 text-purple-600' : ''}`} />
          <span>{isMarkedForReview ? 'Marked' : 'Mark for Review'}</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">[Alt+M]</span>
        </button>
      </div>

      {/* Right Group: Navigation & Save */}
      <div className="flex items-center gap-2.5">
        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={isFirstQuestion}
          className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
            isFirstQuestion
              ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
              : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
          }`}
          title="Previous (Alt+P)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Next / Submit */}
        {isLastQuestion ? (
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            title="Review & Submit"
          >
            <span>Finish & Submit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            title="Save & Next (Alt+N)"
          >
            <span>Save & Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </footer>
  );
};
