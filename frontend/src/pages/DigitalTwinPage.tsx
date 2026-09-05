import React from 'react';
import { Brain, Sliders, ShieldCheck, Zap, Layers } from 'lucide-react';
import { DigitalTwinDashboard } from '../features/digital-twin/DigitalTwinDashboard';
import { FadeIn } from '../components/animations/FadeIn';

export const DigitalTwinPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/30 border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide uppercase">
                <Brain className="w-3.5 h-3.5 text-teal-400" />
                Vidyut Feature 9 & 10 • Career Readiness Digital Twin & Explainability
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Your Career Digital Twin & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
                  100% Explainable Readiness
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Never wonder why an applicant tracking system rejected you. Your Vidyut Digital Twin explains
                exactly what components drive your readiness, simulates counterfactual "What-If" career projections,
                and generates 12-hour precision sprint plans for high-priority opportunities.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span>Mathematical attribution decomposition</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Interactive What-If Scenario Simulators</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>12-Hour Urgent Opportunity Crunch Plans</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Digital Twin Dashboard */}
        <FadeIn delay={100}>
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl backdrop-blur-md">
            <DigitalTwinDashboard />
          </div>
        </FadeIn>

        {/* Footnote */}
        <FadeIn delay={200}>
          <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">The Power of Explainable AI in Career Mobility</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Black-box scores frustrate students. Vidyut exposes every single mathematical factor behind your career score.
                When you refresh a decaying skill, resolve a live incident simulation, or verify code on GitHub, your Digital Twin
                immediately registers the delta and notifies hiring partners in real time.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
