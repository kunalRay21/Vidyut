import React from 'react';
import { Terminal, ShieldCheck, Flame, Cpu, Layers } from 'lucide-react';
import { JobSimulationTerminal } from '../features/job-simulations/JobSimulationTerminal';
import { FadeIn } from '../components/animations/FadeIn';

export const JobSimulationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold tracking-wide uppercase">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                Vidyut Feature 7 • Real-World Job Readiness Simulations
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Beyond LeetCode: <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-cyan-400">
                  Live Production Incident Sandboxes
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Top tech companies don't hire engineers to invert binary trees in a vacuum.
                Vidyut drops you directly into active production outages: inspect raw microservice logs,
                analyze database connection pool metrics, formulate your root cause hypothesis, and deploy real code patches.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Real P0/P1 Outages & Flash Sale Incidents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Live Telemetry & Metrics Inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>High-Weight Skill Passport Evidence (0.70x)</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Job Simulation Terminal Sandbox */}
        <FadeIn delay={100}>
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl backdrop-blur-md">
            <JobSimulationTerminal />
          </div>
        </FadeIn>

        {/* Explanatory Footer */}
        <FadeIn delay={200}>
          <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Why Hiring Managers Trust Vidyut Simulations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multiple-choice tests and algorithmic whiteboard questions test rote memory.
                Vidyut simulations measure operational velocity, debugging acumen, and defensive coding judgment under pressure.
                Passing a simulation mints an immutable verification badge into your Skill Passport that recruiters can inspect directly.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
