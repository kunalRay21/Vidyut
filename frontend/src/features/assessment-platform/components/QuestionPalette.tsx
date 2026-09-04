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
    <div className="gov-card p-4 flex flex-col h-full bg-[#111D32] border-[#1F3152]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1F3152] mb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
          Question Palette
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {summaryCounts.answered} / {summaryCounts.total} Answered
        </span>
      </div>

      {/* Status Legends */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded-lg bg-[#0A111F]/60 border border-[#1F3152]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm" />
          <span>Answered ({summaryCounts.answered})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-3 h-3 rounded-sm bg-purple-500 shadow-sm" />
          <span>Marked ({summaryCounts.marked})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-3 h-3 rounded-sm bg-amber-500 shadow-sm" />
          <span>Visited ({summaryCounts.visited})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-3 h-3 rounded-sm bg-slate-700 border border-slate-600" />
          <span>Not Visited ({summaryCounts.notVisited})</span>
        </div>
      </div>

      {/* Numbered Buttons Grid */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const status = getQuestionStatus(q.id);
            const isCurrent = idx === currentIndex;

            let statusClasses = 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700';

            if (status === 'ANSWERED') {
              statusClasses = 'bg-emerald-600/90 text-white font-bold border-emerald-400 hover:bg-emerald-500';
            } else if (status === 'MARKED_FOR_REVIEW') {
              statusClasses = 'bg-purple-600/90 text-white font-bold border-purple-400 hover:bg-purple-500';
            } else if (status === 'VISITED') {
              statusClasses = 'bg-amber-600/80 text-white border-amber-400 hover:bg-amber-500';
            }

            return (
              <button
                key={q.id}
                onClick={() => onSelectIndex(idx)}
                className={`relative h-10 w-full rounded-md border flex items-center justify-center text-xs font-mono transition-all duration-150 ${statusClasses} ${
                  isCurrent
                    ? 'ring-2 ring-saffron ring-offset-2 ring-offset-[#111D32] scale-105 z-10 font-black shadow-md'
                    : 'opacity-90 hover:opacity-100'
                }`}
                title={`Question ${idx + 1} (${status.replace(/_/g, ' ')})`}
                aria-label={`Jump to Question ${idx + 1}`}
              >
                {idx + 1}
                {/* Micro-indicator for review badge */}
                {status === 'MARKED_FOR_REVIEW' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-300 border-2 border-[#111D32]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-3 border-t border-[#1F3152]">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Completion Progress</span>
          <span className="font-mono font-bold text-white">
            {Math.round((summaryCounts.answered / Math.max(1, summaryCounts.total)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-[#0A111F] rounded-full h-2 overflow-hidden border border-[#1F3152]">
          <div
            className="bg-gradient-to-r from-saffron to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(summaryCounts.answered / Math.max(1, summaryCounts.total)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
