import React from 'react';
import { ExamQuestion } from '../types/exam';
import { CodeViewer } from './CodeViewer';
import { Award, Tag } from 'lucide-react';

interface QuestionViewerProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  question,
  questionNumber,
  totalQuestions,
}) => {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HARD':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-heading">
            Question {questionNumber} of {totalQuestions}
          </span>
          {question.skill_name && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
              {question.skill_name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getDifficultyBadge(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>

          {/* Points */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Award className="w-3 h-3" />
            {question.points || 1} {question.points === 1 ? 'Point' : 'Points'}
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
        {question.question_text}
      </div>

      {/* Code Snippet Container */}
      {question.code_snippet && (
        <CodeViewer
          code={question.code_snippet}
          language={question.code_language || 'python'}
        />
      )}

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <Tag className="w-3 h-3 text-slate-400" />
          {question.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
