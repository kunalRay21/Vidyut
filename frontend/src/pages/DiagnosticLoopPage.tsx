import React from 'react';
import { RotateCcw, CheckCircle2, ShieldAlert, BookOpen, Layers } from 'lucide-react';
import { DiagnosticLoopWidget } from '../features/learning-loop/DiagnosticLoopWidget';
import { FadeIn } from '../components/animations/FadeIn';

export const DiagnosticLoopPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header Banner */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                Vidyut Feature 5 • Diagnostic Precision Remediation
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Assessment &rarr; Learning &rarr; Reassessment <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                  Closed-Loop Skill Repair
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Traditional exam platforms leave you stranded with a low score.
                Vidyut automatically isolates the exact conceptual deficits behind your missed answers,
                delivers a 5-minute precision micro-drill, and unlocks a verification reassessment challenge
                to repair your skill node and upgrade your verified Skill Passport.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Telemetry error pattern isolation</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Anti-pattern vs production fix comparison</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Verified Skill Passport elevation</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Diagnostic Loop Widget Container */}
        <FadeIn delay={100}>
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl backdrop-blur-md">
            <DiagnosticLoopWidget />
          </div>
        </FadeIn>

        {/* Architecture Note */}
        <FadeIn delay={200}>
          <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">How the Closed-Loop Cycle Protects Recruiter Trust</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reassessment is never a generic retake of the entire exam. It targets only the verified deficiency questions.
                Once completed with &ge; 75% accuracy, the Evidence Authenticity Engine mints a new cryptographic proof record
                (type: <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">DIAGNOSTIC_ASSESSMENT</code>),
                immediately repairing any decaying skill scores on your permanent Skill Passport.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
