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
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'HARD':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1F3152]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron font-heading">
            Question {questionNumber} of {totalQuestions}
          </span>
          {question.skill_name && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#172540] text-blue-300 border border-[#1F3152]">
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-saffron/10 text-saffron border border-saffron/30">
            <Award className="w-3 h-3" />
            {question.points || 1} {question.points === 1 ? 'Point' : 'Points'}
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
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
          <Tag className="w-3 h-3 text-slate-500" />
          {question.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] text-slate-400 bg-[#0E1726] border border-[#1F3152] px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
