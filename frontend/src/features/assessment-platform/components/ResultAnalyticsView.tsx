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
        return 'text-purple-400 bg-purple-500/15 border-purple-500/30';
      case 'PROFICIENT':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'INTERMEDIATE':
        return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
      case 'BEGINNER':
        return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      default:
        return 'text-slate-400 bg-slate-700 border-slate-600';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fadeIn">
      {/* Top Banner with Calibration Summary */}
      <div className="gov-card p-6 sm:p-8 border-saffron/30 relative overflow-hidden bg-gradient-to-br from-[#111D32] via-[#0D1829] to-[#0A111F]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron via-white to-indiaGreen" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Calibrated Diagnostic Complete</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              Diagnostic Assessment Scorecard
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Empirical skill calibration validated against Vidyut’s competency graph. Your Directed Acyclic Graph (DAG) roadmap has been dynamically calibrated.
            </p>
          </div>

          {/* Radial Meter / Gauge Score Box */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0A111F]/80 border border-[#1F3152] shadow-inner text-center min-w-[140px]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Accuracy
              </span>
              <span className="text-4xl font-black font-mono text-gradient-saffron">
                {report.overall_accuracy_pct}%
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                {report.correct_answers} of {report.total_questions} correct
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0A111F]/80 border border-[#1F3152] shadow-inner text-center min-w-[140px]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Readiness
              </span>
              <span className="text-4xl font-black font-mono text-gradient-tricolor">
                {report.overall_readiness_pct}%
              </span>
              <span className="text-[10px] text-emerald-400 font-medium mt-1">
                Verified Talent Pool
              </span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-8 pt-6 border-t border-[#1F3152] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Completed at: {new Date(report.completed_at).toLocaleTimeString()}</span>
            <span>•</span>
            <span>Tab switch count: {report.tab_switch_count}</span>
          </div>

          <div className="flex items-center gap-3">
            {onRetake && (
              <button
                onClick={onRetake}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-[#172540] hover:bg-[#1E3A8A] border border-[#1F3152] transition-colors"
              >
                Retake Assessment
              </button>
            )}

            <button
              onClick={onNavigateRoadmap}
              className="btn-saffron text-xs font-bold py-2.5 px-6 shadow-md flex items-center gap-2"
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
            <Sparkles className="w-4 h-4 text-saffron" />
            <h2 className="text-lg font-bold font-heading text-white">
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
                  className={`gov-card p-5 border relative overflow-hidden ${
                    isGrowth
                      ? 'border-amber-500/40 bg-gradient-to-br from-[#111D32] to-[#1a1510]'
                      : isPositive
                      ? 'border-emerald-500/40 bg-gradient-to-br from-[#111D32] to-[#0c1c14]'
                      : 'border-[#1F3152] bg-[#111D32]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-heading font-bold text-sm text-white">
                      {disc.skill_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        isGrowth
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isPositive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {disc.type === 'GROWTH' ? 'Growth Calibration' : disc.type === 'POSITIVE' ? 'Positive Boost' : 'Aligned'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {disc.message}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#0A111F]/70 border border-[#1F3152] text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-200">DAG Action: </span>
                    {disc.roadmap_action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Skill Matrix */}
      <div className="gov-card p-6 border-[#1F3152] bg-[#111D32] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-saffron" />
            <h2 className="text-lg font-bold font-heading text-white">
              Verified Skill Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-400">Evaluated against role benchmarks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.skill_scores.map(sk => (
            <div
              key={sk.skill_id}
              className="p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] flex flex-col justify-between space-y-3 hover:border-saffron/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-sm text-white">
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
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Accuracy</span>
                  <span className="font-mono font-bold text-white">
                    {sk.accuracy_pct}% ({sk.correct}/{sk.total})
                  </span>
                </div>
                <div className="w-full bg-[#111D32] rounded-full h-2 overflow-hidden border border-[#1F3152]">
                  <div
                    className="bg-saffron h-full rounded-full transition-all duration-500"
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
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold font-heading text-white">
              Question-by-Question Review & Explanations
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click to expand details</span>
        </div>

        <div className="space-y-3">
          {report.question_reviews.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="gov-card border-[#1F3152] bg-[#111D32] overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[#172540]/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {q.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}

                    <div className="truncate">
                      <span className="font-mono font-bold text-xs text-slate-400 mr-2">
                        Q{idx + 1}.
                      </span>
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {q.question_text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.is_correct
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
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
                  <div className="p-4 sm:p-6 border-t border-[#1F3152] bg-[#0A111F]/70 space-y-4">
                    <p className="text-sm text-slate-200 font-medium">
                      {q.question_text}
                    </p>

                    {q.code_snippet && (
                      <CodeViewer
                        code={q.code_snippet}
                        language={q.code_language || 'python'}
                      />
                    )}

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map(opt => {
                        const isChosen = q.selected_option === opt.key;
                        const isKeyCorrect = q.correct_option === opt.key;

                        let optClass = 'bg-[#111D32] border-[#1F3152] text-slate-400';
                        if (isKeyCorrect) {
                          optClass = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold';
                        } else if (isChosen && !q.is_correct) {
                          optClass = 'bg-red-950/40 border-red-500/60 text-red-300 line-through';
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${optClass}`}
                          >
                            <span className="font-mono font-bold">{opt.key}.</span>
                            <span className="flex-1">{opt.text}</span>
                            {isChosen && (
                              <span className="text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                                Your Choice
                              </span>
                            )}
                            {isKeyCorrect && (
                              <span className="text-[10px] font-mono uppercase bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded">
                                Answer Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-[#111D32] border border-[#1F3152] text-xs space-y-1">
                        <span className="font-bold text-saffron uppercase tracking-wider text-[10px] font-mono">
                          Conceptual Explanation:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
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
