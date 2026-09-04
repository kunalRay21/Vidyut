import React from 'react';
import { ExamQuestion } from '../types/exam';
import { CodeViewer } from './CodeViewer';

interface QuestionViewerProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  question,
}) => {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {question.skill_name && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            {question.skill_name}
          </span>
        )}

        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getDifficultyBadge(
            question.difficulty
          )}`}
        >
          {question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()}
        </span>

        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          {question.points || 1} {question.points === 1 ? 'Point' : 'Points'}
        </span>
      </div>

      {/* Question Prompt */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug tracking-tight">
        {question.question_text}
      </h2>

      {/* Code Snippet Container */}
      {question.code_snippet && (
        <div className="pt-1">
          <CodeViewer
            code={question.code_snippet}
            language={question.code_language || 'python'}
          />
        </div>
      )}

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {question.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
