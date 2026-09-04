import React from 'react';
import { ExamQuestion, QuestionStatus } from '../types/exam';
import { Cloud, ShieldCheck } from 'lucide-react';

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
  const percentComplete = Math.round(
    (summaryCounts.answered / Math.max(1, summaryCounts.total)) * 100
  );

  return (
    <aside className="w-80 h-full flex flex-col bg-slate-50/60 border-l border-slate-200 flex-shrink-0 select-none">
      {/* Header & Progress */}
      <div className="p-5 border-b border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
            Question Navigator
          </h3>
          <span className="text-xs font-semibold text-blue-600 font-mono">
            {percentComplete}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          {summaryCounts.answered} of {summaryCounts.total} questions answered
        </div>
      </div>

      {/* Status Legends */}
      <div className="p-4 border-b border-slate-200 bg-white/50 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Answered ({summaryCounts.answered})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span>Review ({summaryCounts.marked})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Visited ({summaryCounts.visited})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span>Not Visited ({summaryCounts.notVisited})</span>
        </div>
      </div>

      {/* Numbered Buttons Grid */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-5 gap-2.5">
          {questions.map((q, idx) => {
            const status = getQuestionStatus(q.id);
            const isCurrent = idx === currentIndex;

            let statusClasses =
              'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50';

            if (status === 'ANSWERED') {
              statusClasses = 'bg-emerald-600 text-white font-bold border-emerald-600';
            } else if (status === 'MARKED_FOR_REVIEW') {
              statusClasses = 'bg-purple-600 text-white font-bold border-purple-600';
            } else if (status === 'VISITED') {
              statusClasses = 'bg-amber-100 text-amber-900 font-bold border-amber-300';
            }

            return (
              <button
                key={q.id}
                onClick={() => onSelectIndex(idx)}
                className={`relative h-10 w-full rounded-lg border text-xs font-mono font-medium transition-all flex items-center justify-center ${statusClasses} ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white font-black z-10'
                    : ''
                }`}
                title={`Question ${idx + 1} (${status.replace(/_/g, ' ')})`}
                aria-label={`Jump to Question ${idx + 1}`}
              >
                {idx + 1}
                {status === 'MARKED_FOR_REVIEW' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 border border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info Cards */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2.5">
        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
          <Cloud className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Real-time cloud autosave active</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>Proctored window telemetry monitored</span>
        </div>
      </div>
    </aside>
  );
};
