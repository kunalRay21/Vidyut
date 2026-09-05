import React from 'react';
import { Bot, Sparkles, BrainCircuit, ShieldCheck, Layers } from 'lucide-react';
import { AIFluencyWidget } from '../features/ai-fluency/AIFluencyWidget';
import { FadeIn } from '../components/animations/FadeIn';

export const AIFluencyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                Vidyut Feature 8 • Augmented Engineering Fluency
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                AI Coding Fluency & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Hallucination Defense Benchmark
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                In 2026, companies don't ban AI; they hire engineers who can wield it with surgical precision.
                Vidyut evaluates your ability to steer LLMs, catch subtle security vulnerabilities and concurrency race conditions,
                and refine prompts into battle-tested production code.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                  <span>Specification & Prompt Precision Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Zero-Trust Hallucination Auditing</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>AI Augmented Architect Passport Badge</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* AI Fluency Workspace Container */}
        <FadeIn delay={100}>
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl backdrop-blur-md">
            <AIFluencyWidget />
          </div>
        </FadeIn>

        {/* Footnote */}
        <FadeIn delay={200}>
          <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">The Hiring Advantage: AI Copilot Proof</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recruiters are overwhelmed by candidates who copy-paste AI responses without understanding.
                Your Vidyut AI Fluency Score proves you possess the critical oversight required to accelerate software delivery
                while protecting enterprise systems from catastrophic hallucinations.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
