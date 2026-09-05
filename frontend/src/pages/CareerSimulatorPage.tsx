import React from 'react';
import { Compass, Sparkles, HelpCircle, Zap, Target } from 'lucide-react';
import { CareerSimulatorWidget } from '../features/simulator/CareerSimulatorWidget';
import { FadeIn } from '../components/animations/FadeIn';

export const CareerSimulatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Vidyut Feature 3 & 4 • Predictive Career Intelligence
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                "What Should I Do Next?" <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Interactive Career Simulator
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Wondering how hard it is to switch from Backend to Data Engineering or Cloud DevOps?
                Vidyut dynamically inspects your DAG competencies and computes exactly which skills transfer,
                calculates your remaining gap hours, and forecasts your readiness leap.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Cross-domain semantic transfer credit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Real prerequisite DAG traversal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>1-Click Career Target Adoption</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main Simulator Content */}
        <FadeIn delay={100}>
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl backdrop-blur-md">
            <CareerSimulatorWidget />
          </div>
        </FadeIn>

        {/* Informative Explanation Footnote */}
        <FadeIn delay={200}>
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">How Transferable Intelligence Works</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlike basic keyword resume matchers, Vidyut evaluates cognitive overlaps across the competency graph.
                If you have proven mastery in SQL, 85% of Advanced SQL & Window Functions is automatically credited.
                Mastering Python similarly credits 80% towards distributed PySpark transformations. When you click "Adopt This Target Role",
                your personal learning DAG immediately shifts focus to the calculated gap milestones.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
