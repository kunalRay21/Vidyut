import React from 'react';

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="max-w-xl p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-400 mb-4">
          ⚡ Vidyut Platform
        </h1>
        <p className="text-slate-300 text-sm mb-6">
          Adaptive Career & Skill Trainer — Architecture & Feature Scaffold Ready.
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs text-left">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
            <span className="font-semibold text-emerald-400">Frontend Dev 1:</span>
            <p className="text-slate-400 mt-1">src/features/onboarding & institution</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
            <span className="font-semibold text-cyan-400">Frontend Dev 2:</span>
            <p className="text-slate-400 mt-1">src/features/dashboard & industry</p>
          </div>
        </div>
      </div>
    </div>
  );
}
