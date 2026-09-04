import React, { useState } from 'react';
import { ExamReport } from '../types/exam';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';

interface ResultAnalyticsViewProps {
  report: ExamReport;
  onNavigateRoadmap: () => void;
  onRetake?: () => void;
}

export const ResultAnalyticsView: React.FC<ResultAnalyticsViewProps> = ({
  report,
  onNavigateRoadmap,
  onRetake,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedQuestionId(prev => (prev === id ? null : id));
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'PROFICIENT':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'INTERMEDIATE':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'BEGINNER':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fadeIn">
      {/* Top Banner with Calibration Summary */}
      <div className="gov-card p-6 sm:p-8 border-slate-200 bg-white shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-700 to-emerald-600" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Calibrated Diagnostic Complete</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Diagnostic Assessment Scorecard
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              Empirical skill calibration validated against Vidyut’s competency graph. Your Directed Acyclic Graph (DAG) roadmap has been dynamically calibrated.
            </p>
          </div>

          {/* Radial Meter / Gauge Score Box */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[130px]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Accuracy
              </span>
              <span className="text-3xl font-black font-mono text-amber-700">
                {report.overall_accuracy_pct}%
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                {report.correct_answers} of {report.total_questions} correct
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[130px]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Readiness
              </span>
              <span className="text-3xl font-black font-mono text-emerald-700">
                {report.overall_readiness_pct}%
              </span>
              <span className="text-[10px] text-emerald-700 font-medium mt-1">
                Verified Ready
              </span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Completed: {new Date(report.completed_at).toLocaleTimeString()}</span>
            <span>•</span>
            <span>Tab switches: {report.tab_switch_count}</span>
          </div>

          <div className="flex items-center gap-3">
            {onRetake && (
              <button
                onClick={onRetake}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                Retake Assessment
              </button>
            )}

            <button
              onClick={onNavigateRoadmap}
              className="btn-saffron text-xs font-semibold py-2 px-5 flex items-center gap-2 shadow-xs"
            >
              <span>Continue to Adaptive Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancy Calibration Alerts */}
      {report.discrepancies && report.discrepancies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold font-heading text-slate-900">
              Calibration Discrepancy Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.discrepancies.map((disc, idx) => {
              const isGrowth = disc.type === 'GROWTH';
              const isPositive = disc.type === 'POSITIVE';

              return (
                <div
                  key={idx}
                  className={`gov-card p-5 border ${
                    isGrowth
                      ? 'border-amber-200 bg-amber-50/40'
                      : isPositive
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-heading font-bold text-sm text-slate-900">
                      {disc.skill_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        isGrowth
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : isPositive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {disc.type === 'GROWTH' ? 'Growth Calibration' : disc.type === 'POSITIVE' ? 'Positive Boost' : 'Aligned'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {disc.message}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">DAG Action: </span>
                    {disc.roadmap_action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Skill Matrix */}
      <div className="gov-card p-6 border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold font-heading text-slate-900">
              Verified Skill Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500">Evaluated against role benchmarks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.skill_scores.map(sk => (
            <div
              key={sk.skill_id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-sm text-slate-900">
                  {sk.skill_name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProficiencyColor(
                    sk.proficiency
                  )}`}
                >
                  {sk.proficiency}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Accuracy</span>
                  <span className="font-mono font-bold text-slate-800">
                    {sk.accuracy_pct}% ({sk.correct}/{sk.total})
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${sk.accuracy_pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold font-heading text-slate-900">
              Question-by-Question Review & Explanations
            </h2>
          </div>
          <span className="text-xs text-slate-500">Click to expand details</span>
        </div>

        <div className="space-y-3">
          {report.question_reviews.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="gov-card border-slate-200 bg-white overflow-hidden shadow-xs"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {q.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}

                    <div className="truncate">
                      <span className="font-mono font-bold text-xs text-slate-500 mr-2">
                        Q{idx + 1}.
                      </span>
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {q.question_text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        q.is_correct
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {q.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/60 space-y-4">
                    <p className="text-sm text-slate-800 font-medium">
                      {q.question_text}
                    </p>

                    {q.code_snippet && (
                      <CodeViewer
                        code={q.code_snippet}
                        language={q.code_language || 'python'}
                      />
                    )}

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map(opt => {
                        const isChosen = q.selected_option === opt.key;
                        const isKeyCorrect = q.correct_option === opt.key;

                        let optClass = 'bg-white border-slate-200 text-slate-600';
                        if (isKeyCorrect) {
                          optClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                        } else if (isChosen && !q.is_correct) {
                          optClass = 'bg-red-50 border-red-300 text-red-800 line-through';
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${optClass}`}
                          >
                            <span className="font-mono font-bold">{opt.key}.</span>
                            <span className="flex-1">{opt.text}</span>
                            {isChosen && (
                              <span className="text-[10px] font-mono uppercase bg-slate-200 px-1.5 py-0.5 rounded font-medium text-slate-700">
                                Your Choice
                              </span>
                            )}
                            {isKeyCorrect && (
                              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                Answer Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px] font-mono">
                          Conceptual Explanation:
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
