import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ExamPlatformPage } from './features/assessment-platform';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      {/* Official Indian National Flag Top Header Ribbon */}
      <div className="gov-tricolor-banner" />

      {/* Top Gov Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center shadow-xs">
            <span className="text-amber-400 font-extrabold text-base">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-base text-slate-900 tracking-tight">VIDYUT</span>
              <span className="gov-badge text-[10px] py-0.5 px-2">SIH 2026</span>
            </div>
            <p className="text-[11px] text-slate-500">Adaptive Career & Skill Readiness Platform · Govt. of India</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="gov-badge-chakra hidden sm:inline-flex">Ashoka Chakra Dharma Theme</span>
          <button
            onClick={() => navigate('/assessment/quiz/session-sih-demo')}
            className="btn-saffron text-xs py-2 px-4 shadow-xs"
          >
            Launch Assessment Engine
          </button>
        </div>
      </header>

      {/* Main Showcase Hero */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center">
        {/* Ministry / Scheme Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Problem Statement 26044: Academia–Industry Collaboration
        </div>

        {/* Hero Title with Tricolor Text Gradient */}
        <h1 className="text-3xl md:text-5xl font-extrabold font-heading tracking-tight mb-4 max-w-3xl text-slate-900">
          Empowering India's Students with <span className="text-gradient-saffron">Adaptive Skill Intelligence</span>
        </h1>

        <p className="text-slate-600 text-sm md:text-base max-w-2xl mb-8 leading-relaxed">
          Standardized skill graphs, calibrated diagnostic evaluations, prerequisite-ordered roadmaps, and verified opportunity matching.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <button
            onClick={() => navigate('/assessment/quiz/session-sih-demo')}
            className="btn-saffron text-xs sm:text-sm px-6 py-2.5 shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Diagnostic Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/roadmap')}
            className="btn-green text-xs sm:text-sm px-6 py-2.5 shadow-xs"
          >
            View Adaptive Roadmap
          </button>
          <button className="btn-chakra text-xs sm:text-sm px-6 py-2.5 shadow-xs">
            Institution Portal
          </button>
        </div>

        {/* Assessment Platform Feature Callout */}
        <div className="w-full gov-card p-6 border-slate-200 bg-white shadow-xs mb-10 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h2 className="font-heading font-bold text-slate-900 text-base">
                  Calibrated Diagnostic Engine Active
                </h2>
              </div>
              <p className="text-xs text-slate-600">
                Synchronized timer, question palette, real-time autosave, integrity proctoring, and growth calibration analytics.
              </p>
            </div>
            <Link
              to="/assessment/quiz/session-sih-demo"
              className="btn-saffron text-xs font-semibold py-2 px-4 shadow-xs whitespace-nowrap"
            >
              Take Exam Now →
            </Link>
          </div>
        </div>

        {/* Design System Reference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
          {/* Saffron Card */}
          <div className="gov-card p-5 border-slate-200 bg-white relative overflow-hidden shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-heading font-semibold text-slate-900 text-sm">Kesari (Saffron)</h3>
              <span className="gov-badge text-[10px]">#D97706</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed mb-3">
              Symbolizes courage and energy. Used for domain badges, diagnostic test triggers, and key milestones.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              <span className="text-xs text-amber-800 font-medium">Primary Brand Accent</span>
            </div>
          </div>

          {/* Chakra Navy Card */}
          <div className="gov-card p-5 border-slate-200 bg-white relative overflow-hidden shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900" />
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-heading font-semibold text-slate-900 text-sm">Ashoka Navy (Dharma)</h3>
              <span className="gov-badge-chakra text-[10px]">#1E3A8A</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed mb-3">
              Represents the eternal wheel of law and truth. Used for administrative headers, navigation, and badges.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-900" />
              <span className="text-xs text-blue-800 font-medium">Authoritative Accent</span>
            </div>
          </div>

          {/* India Green Card */}
          <div className="gov-card p-5 border-slate-200 bg-white relative overflow-hidden shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-heading font-semibold text-slate-900 text-sm">Harit (India Green)</h3>
              <span className="gov-badge-green text-[10px]">#15803D</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed mb-3">
              Represents growth and verified competence. Used for validated competencies, milestones, and success states.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
              <span className="text-xs text-emerald-800 font-medium">Growth & Success Accent</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative</p>
      </footer>
    </div>
  );
}

function RoadmapPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <div className="gov-tricolor-banner" />
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-base text-slate-900">VIDYUT</span>
          <span className="gov-badge text-[10px]">Adaptive Roadmap</span>
        </div>
        <button onClick={() => navigate('/')} className="text-xs text-slate-600 hover:text-slate-900">
          ← Back to Portal
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
          Prerequisite-Ordered DAG Roadmap
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Your roadmap has been updated with calibrated milestones based on your empirical diagnostic assessment results. Foundational remedial nodes have been prioritized for failed topics.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate('/assessment/quiz/session-sih-demo')}
            className="btn-saffron text-xs font-semibold py-2 px-5 shadow-xs"
          >
            Retake Diagnostic Calibration
          </button>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assessment/quiz/:id" element={<ExamPlatformPage />} />
        <Route path="/assessment/quiz" element={<ExamPlatformPage />} />
        <Route path="/roadmap" element={<RoadmapPreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
