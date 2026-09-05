import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Opportunity12HourPlan } from './types';

interface OpportunityPrepPlanModalProps {
  plan: Opportunity12HourPlan | null;
  onClose: () => void;
}

export const OpportunityPrepPlanModal: React.FC<OpportunityPrepPlanModalProps> = ({ plan, onClose }) => {
  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              12-Hour Opportunity Crunch Plan
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {plan.roleTitle} @ {plan.companyName}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                {plan.applicationDeadlineHoursRemaining}h remaining before interview / deadline
              </span>
              <span>•</span>
              <span className="text-cyan-300 font-medium">Stipend: {plan.stipendOrSalary}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Match Leap Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Projected Candidate Match Leap</span>
                <div className="text-lg font-bold text-white">
                  {plan.currentMatchPercentage}% Current Match &rarr;{' '}
                  <span className="text-emerald-400">
                    {plan.projectedMatchPercentageAfterPlan}% Top-Decile Match
                  </span>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              +{plan.projectedMatchPercentageAfterPlan - plan.currentMatchPercentage}% Match Confidence
            </span>
          </div>

          {/* High Priority Gaps */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              High-Frequency Gaps Tested by {plan.companyName}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plan.identifiedGaps.map((gap, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{gap.skillName}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                      {gap.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{gap.interviewFrequency}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological 12-Hour Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chronological 12-Hour Sprint Itinerary
            </h4>

            <div className="space-y-3">
              {plan.schedule.map((block, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-mono text-xs font-bold">
                        {block.hourRange}
                      </span>
                      <span className="text-sm font-bold text-white">{block.phaseTitle}</span>
                    </div>
                    <span className="text-xs text-slate-500">{block.durationMinutes} minutes</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">High-Yield Topics:</div>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                      {block.topicsCovered.map((topic, ti) => (
                        <li key={ti}>{topic}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      Target Interview Defense:
                    </span>
                    {block.keyQuestionsToMaster.map((q, qi) => (
                      <p key={qi} className="text-slate-300 italic">" {q} "</p>
                    ))}
                  </div>

                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Action: {block.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Yield Formulas & Gotchas */}
          <div className="p-4 rounded-2xl bg-amber-950/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Fintech & Systems Cheat Sheet Gotchas
              </h5>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-amber-200/90">
              {plan.cheatSheetSummary.coreFormulas.map((f, fi) => (
                <div key={fi} className="p-2 rounded bg-slate-950/60 border border-amber-900/30">
                  {f}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Architectural Defense Tip:</strong> {plan.cheatSheetSummary.architectureTip}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Close Plan
          </button>
        </div>
      </div>
    </div>
  );
};
