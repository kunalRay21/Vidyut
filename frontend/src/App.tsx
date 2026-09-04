import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import LoginForm from './features/onboarding/LoginForm';
import RegisterForm from './features/onboarding/RegisterForm';
import DiscoveryPage from './features/onboarding/DiscoveryPage';
import SelfAssessmentPage from './features/onboarding/SelfAssessmentPage';
import QuizEngine from './features/onboarding/QuizEngine';
import StudentDashboardPage from './features/dashboard/StudentDashboardPage';

import InstitutionRegisterForm from './features/institution/InstitutionRegisterForm';
import InstitutionLoginForm from './features/institution/InstitutionLoginForm';
import InstitutionDashboardPage from './features/institution/InstitutionDashboardPage';

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A111F] text-slate-100">
      <div className="gov-tricolor-banner" />

      {/* Header */}
      <header className="border-b border-[#1F3152] bg-[#111D32]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition">
          <div className="w-9 h-9 rounded-full bg-[#000080] flex items-center justify-center border border-blue-600/50 shadow-sm">
            <span className="text-saffron font-extrabold text-lg">⚡</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg text-white tracking-tight">
                VIDYUT
              </span>
              <span className="gov-badge text-[10px] py-0.5 px-2">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Adaptive Career & Skill Readiness Platform · Govt. of India
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="gov-badge-chakra hidden sm:inline-flex">
            Ashoka Chakra Dharma Theme
          </span>
          <Link to="/explore" className="text-xs text-slate-300 hover:text-white px-3 py-2 hidden md:inline-flex transition">
            Explore Domains
          </Link>
          <Link to="/institution/login" className="text-xs text-slate-300 hover:text-white px-3 py-2 hidden md:inline-flex transition">
            Institution Portal
          </Link>
          <Link to="/login" className="btn-saffron text-xs py-2 px-4">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs py-2 px-4 rounded-lg border border-[#1F3152] bg-[#0A111F] text-slate-300 hover:border-saffron hover:text-white transition"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-saffron/30 bg-saffron/10 text-saffron-300 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
          Problem Statement 26044: Academia–Industry Collaboration
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight mb-4 max-w-4xl leading-tight">
          Empowering India's Students with{' '}
          <span className="text-gradient-tricolor">Adaptive Skill Intelligence</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
          Standardized skill graphs, calibrated diagnostic evaluations, prerequisite-ordered roadmaps, and verified opportunity matching.
        </p>

        {/* Primary Interactive Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link to="/explore" className="btn-saffron text-sm px-6 py-3">
            Explore Career Domains
          </Link>
          <Link to="/assessment/self" className="btn-green text-sm px-6 py-3">
            Diagnostic Assessment
          </Link>
          <Link to="/institution/login" className="btn-chakra text-sm px-6 py-3">
            Institution Portal
          </Link>
          <Link
            to="/dashboard"
            className="text-sm px-6 py-3 rounded-lg border border-[#1F3152] bg-[#111D32] hover:border-slate-400 text-slate-200 transition"
          >
            Student Dashboard
          </Link>
        </div>

        {/* Tricolor Dharma Theme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-16">
          <Link
            to="/explore"
            className="gov-card p-6 border-saffron/20 relative overflow-hidden group hover:border-saffron/60 transition block"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-saffron" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white group-hover:text-saffron transition">
                Kesari (Saffron)
              </h3>
              <span className="gov-badge">#FF9933</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Symbolizes courage, energy, and action. Used for high-demand domain badges, primary CTAs, active roadmaps, and student intake.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-saffron" />
                <span className="text-xs text-saffron-300 font-medium">
                  Primary Brand Accent
                </span>
              </div>
              <span className="text-xs text-saffron opacity-0 group-hover:opacity-100 transition">
                Explore Domains →
              </span>
            </div>
          </Link>

          <Link
            to="/institution/login"
            className="gov-card p-6 border-chakraNavy-500/30 relative overflow-hidden group hover:border-blue-500/60 transition block"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-chakraNavy-500" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white group-hover:text-blue-300 transition">
                Ashoka Navy (Dharma)
              </h3>
              <span className="gov-badge-chakra">#000080</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Represents the eternal wheel of law and truth. Used for administrative and institutional headers, surfaces, navigation, and badges.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-chakraNavy-500" />
                <span className="text-xs text-blue-300 font-medium">
                  Authoritative Accent
                </span>
              </div>
              <span className="text-xs text-blue-300 opacity-0 group-hover:opacity-100 transition">
                College Portal →
              </span>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="gov-card p-6 border-indiaGreen/30 relative overflow-hidden group hover:border-green-500/60 transition block"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-indiaGreen" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white group-hover:text-green-300 transition">
                Harit (India Green)
              </h3>
              <span className="gov-badge-green">#138808</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Represents growth, prosperity, and verified competence. Used for "Ready Now" tags, completed milestones, and success states.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indiaGreen" />
                <span className="text-xs text-green-300 font-medium">
                  Growth & Success Accent
                </span>
              </div>
              <span className="text-xs text-green-300 opacity-0 group-hover:opacity-100 transition">
                View Dashboard →
              </span>
            </div>
          </Link>
        </div>

        {/* Complete Component Navigation Hub */}
        <div className="w-full bg-[#111D32] border border-[#1F3152] rounded-2xl p-8 text-left">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Platform Modules & Interactive Workflows</h2>
            <p className="text-slate-400 text-sm mt-1">
              Select any component to test the full end-to-end frontend user experience:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Intake & Progression */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">
                Student Intake & Assessment Flow
              </h3>

              <Link
                to="/explore"
                className="block p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-saffron transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">1. Career Domain Discovery</div>
                  <span className="text-xs text-saffron">/explore</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Browse AI/ML, Software Dev, Cloud, Cyber domains and technologies.
                </div>
              </Link>

              <Link
                to="/assessment/self"
                className="block p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-saffron transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">2. Skill Self-Assessment</div>
                  <span className="text-xs text-saffron">/assessment/self</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Select target career role (ML Engineer, Software Engineer) & rate skills.
                </div>
              </Link>

              <Link
                to="/assessment/quiz/session-demo-101"
                className="block p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-saffron transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">3. Diagnostic Quiz Engine</div>
                  <span className="text-xs text-saffron">/assessment/quiz/:id</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Timed interactive MCQ quiz with discrepancy analysis and score calculation.
                </div>
              </Link>

              <Link
                to="/dashboard"
                className="block p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-saffron transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">4. Student Progression Dashboard</div>
                  <span className="text-xs text-saffron">/dashboard</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  View student readiness score, calibration gaps, and profile stats.
                </div>
              </Link>

              <div className="flex gap-3 pt-1">
                <Link
                  to="/login"
                  className="flex-1 p-3 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-saffron text-center text-xs font-semibold transition"
                >
                  Student Login (/login)
                </Link>
                <Link
                  to="/register"
                  className="flex-1 p-3 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-saffron text-center text-xs font-semibold transition"
                >
                  Student Register (/register)
                </Link>
              </div>
            </div>

            {/* Academic Institution & Placement Cell */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                Academic Institution & Placement Cell
              </h3>

              <Link
                to="/institution/login"
                className="block p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">1. Institution Login</div>
                  <span className="text-xs text-blue-400">/institution/login</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Placement officer and institutional administration login.
                </div>
              </Link>

              <Link
                to="/institution/onboard"
                className="block p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">2. Institution Registration (AISHE)</div>
                  <span className="text-xs text-blue-400">/institution/onboard</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Register college name, AISHE code, TPO officer details, and departments.
                </div>
              </Link>

              <Link
                to="/institution/dashboard"
                className="block p-4 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">3. Institution Analytics Dashboard</div>
                  <span className="text-xs text-blue-400">/institution/dashboard</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Cohort readiness distribution, average scores, and top curriculum gaps.
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F3152] bg-[#0D1728] px-6 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative
          </p>
          <div className="flex items-center gap-4">
            <Link to="/explore" className="hover:text-white transition">Career Domains</Link>
            <Link to="/assessment/self" className="hover:text-white transition">Self-Assessment</Link>
            <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link to="/institution/dashboard" className="hover:text-white transition">Institution</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A111F] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-[#111D32] border border-[#1F3152] rounded-2xl p-8 shadow-xl">
        <span className="text-4xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-slate-400 text-sm mt-2 mb-6">
          The requested route is not available. Please navigate to one of the active portals below:
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/" className="btn-saffron py-2.5 px-4 text-sm">
            Return to Home
          </Link>
          <Link to="/explore" className="py-2.5 px-4 text-sm rounded-lg border border-[#1F3152] hover:border-slate-400 transition">
            Explore Career Domains
          </Link>
          <Link to="/institution/dashboard" className="py-2.5 px-4 text-sm rounded-lg border border-[#1F3152] hover:border-slate-400 transition">
            Institution Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Student Intake & Assessment Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/explore" element={<DiscoveryPage />} />
        <Route path="/assessment/self" element={<SelfAssessmentPage />} />
        <Route path="/assessment/quiz/:sessionId" element={<QuizEngine />} />
        <Route path="/dashboard" element={<StudentDashboardPage />} />

        {/* Institution Portal Routes */}
        <Route path="/institution/onboard" element={<InstitutionRegisterForm />} />
        <Route path="/institution/login" element={<InstitutionLoginForm />} />
        <Route path="/institution/dashboard" element={<InstitutionDashboardPage />} />

        {/* Fallback Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
