import React from 'react';
import { ExamQuestion, QuestionStatus } from '../types/exam';

interface QuestionPaletteProps {
  questions: ExamQuestion[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  getQuestionStatus: (id: string) => QuestionStatus;
  summaryCounts: {
    answered: number;
    marked: number;
    visited: number;
    notVisited: number;
    total: number;
  };
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  onSelectIndex,
  getQuestionStatus,
  summaryCounts,
}) => {
  return (
    <div className="gov-card p-4 flex flex-col h-full bg-white border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
          Question Palette
        </h3>
        <span className="text-xs text-slate-500 font-mono font-medium">
          {summaryCounts.answered} / {summaryCounts.total} Answered
        </span>
      </div>

      {/* Status Legends */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-3 h-3 rounded-xs bg-emerald-600" />
          <span>Answered ({summaryCounts.answered})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-3 h-3 rounded-xs bg-purple-600" />
          <span>Marked ({summaryCounts.marked})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-3 h-3 rounded-xs bg-amber-500" />
          <span>Visited ({summaryCounts.visited})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-3 h-3 rounded-xs bg-slate-200 border border-slate-300" />
          <span>Not Visited ({summaryCounts.notVisited})</span>
        </div>
      </div>

      {/* Numbered Buttons Grid */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const status = getQuestionStatus(q.id);
            const isCurrent = idx === currentIndex;

            let statusClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';

            if (status === 'ANSWERED') {
              statusClasses = 'bg-emerald-600 text-white font-bold border-emerald-600 hover:bg-emerald-700';
            } else if (status === 'MARKED_FOR_REVIEW') {
              statusClasses = 'bg-purple-600 text-white font-bold border-purple-600 hover:bg-purple-700';
            } else if (status === 'VISITED') {
              statusClasses = 'bg-amber-500 text-white font-bold border-amber-500 hover:bg-amber-600';
            }

            return (
              <button
                key={q.id}
                onClick={() => onSelectIndex(idx)}
                className={`relative h-10 w-full rounded-md border flex items-center justify-center text-xs font-mono transition-colors ${statusClasses} ${
                  isCurrent
                    ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-white z-10 font-black shadow-xs'
                    : ''
                }`}
                title={`Question ${idx + 1} (${status.replace(/_/g, ' ')})`}
                aria-label={`Jump to Question ${idx + 1}`}
              >
                {idx + 1}
                {status === 'MARKED_FOR_REVIEW' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-300 border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
          <span>Completion Progress</span>
          <span className="font-mono font-bold text-slate-800">
            {Math.round((summaryCounts.answered / Math.max(1, summaryCounts.total)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="bg-amber-500 h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(summaryCounts.answered / Math.max(1, summaryCounts.total)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
