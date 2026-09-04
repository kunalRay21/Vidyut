import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { IndustryOnboardPage } from './pages/IndustryOnboardPage';
import { IndustryPostJobPage } from './pages/IndustryPostJobPage';
import { IndustryTalentPage } from './pages/IndustryTalentPage';
import { InstitutionOnboardPage } from './pages/InstitutionOnboardPage';
import { AssessmentQuizPage } from './pages/AssessmentQuizPage';
import { FadeIn } from './components/animations/FadeIn';
import { LineChart, Route as RouteIcon, GraduationCap } from 'lucide-react';

import LoginForm from './features/onboarding/LoginForm';
import RegisterForm from './features/onboarding/RegisterForm';
import DiscoveryPage from './features/onboarding/DiscoveryPage';
import SelfAssessmentPage from './features/onboarding/SelfAssessmentPage';
import QuizEngine from './features/onboarding/QuizEngine';

import InstitutionLoginForm from './features/institution/InstitutionLoginForm';
import InstitutionDashboardPage from './features/institution/InstitutionDashboardPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';

function QuizDispatcher() {
  const { id } = useParams<{ id: string }>();
  if (id && (id.startsWith('demo-') || id.startsWith('session') || id.startsWith('sess-') || /^\d+$/.test(id))) {
    return <QuizEngine />;
  }
  return <AssessmentQuizPage />;
}

function LandingPage() {
  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center">
      {/* Ministry / Scheme Pill */}
      <FadeIn delay={100}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-saffron/40 bg-saffron/10 text-saffron-600 text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
          Problem Statement 26044: Academia–Industry Collaboration
        </div>
      </FadeIn>

      {/* Hero Title with Tricolor Text Gradient */}
      <FadeIn delay={200}>
        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight mb-4 max-w-4xl text-[#000080] leading-tight">
          Empowering <span className="text-gradient-india">India's</span> Students with{' '}
          <span className="text-gradient-tricolor">Adaptive Skill Intelligence</span>
        </h1>
      </FadeIn>

      <FadeIn delay={300}>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
          Standardized skill graphs, calibrated diagnostic evaluations, prerequisite-ordered roadmaps, and verified opportunity matching.
        </p>
      </FadeIn>

      {/* Primary Action Buttons */}
      <FadeIn delay={350}>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link to="/explore" className="btn-saffron text-sm px-6 py-3">
            Explore Career Domains
          </Link>
          <Link to="/assessment/self" className="btn-green text-sm px-6 py-3">
            Diagnostic Assessment
          </Link>
          <Link to="/dashboard" className="btn-chakra text-sm px-6 py-3">
            Student Dashboard
          </Link>
          <Link
            to="/industry/onboard"
            className="text-sm px-6 py-3 rounded-lg border border-[#EAE3B3] bg-[#FFFEF2] hover:border-[#138808] text-gray-800 font-semibold shadow-sm transition"
          >
            Employer Portal
          </Link>
        </div>
      </FadeIn>

      {/* 3 Pillar Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mb-16 text-left">
        <FadeIn delay={400} className="h-full">
          <Link to="/dashboard" className="group relative block bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-[#FF9933]/40 overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF9933] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF9933]/5 rounded-full blur-xl group-hover:bg-[#FF9933]/10 transition-colors duration-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF9933]/10 text-[#FF9933] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 shrink-0">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#FF9933] transition-colors">Track Your Progress</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed relative z-10 flex-1">
              Monitor your skills, readiness, completed milestones, and identify the next steps needed to achieve your career goals.
            </p>
          </Link>
        </FadeIn>

        <FadeIn delay={500} className="h-full">
          <Link to="/roadmap" className="group relative block bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-[#138808]/40 overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#138808] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#138808]/5 rounded-full blur-xl group-hover:bg-[#138808]/10 transition-colors duration-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#138808]/10 text-[#138808] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0">
                <RouteIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#138808] transition-colors">Build Your Path</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed relative z-10 flex-1">
              Follow a personalized, prerequisite-based learning journey designed to help you build the right skills in the right order.
            </p>
          </Link>
        </FadeIn>

        <FadeIn delay={600} className="h-full">
          <Link to="/institution/dashboard" className="group relative block bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-[#000080]/40 overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#000080] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#000080]/5 rounded-full blur-xl group-hover:bg-[#000080]/10 transition-colors duration-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#000080]/10 text-[#000080] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#000080] transition-colors">Institution Portal</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed relative z-10 flex-1">
              Access institution tools, student insights, skill progress data, and curriculum gap analytics for college administration.
            </p>
          </Link>
        </FadeIn>
      </div>

      {/* How VIDYUT Works Section */}
      <div className="w-full mt-4 flex flex-col items-center">
        <FadeIn delay={700}>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#000080] mb-3">
            How VIDYUT Works
          </h2>
        </FadeIn>
        <FadeIn delay={800}>
          <p className="text-gray-600 text-sm md:text-base text-center max-w-xl mb-10">
            From understanding your current skills to discovering the opportunities you're ready for.
          </p>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-16">
          {/* Card 1: ASSESS */}
          <FadeIn delay={900}>
            <Link to="/assessment/self" className="group relative block bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#FF9933]/40 overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF9933] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FF9933]/10 text-[#FF9933] transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#FF9933] tracking-widest">01 · ASSESS</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Understand Your Skills</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Identify your current skill level and understand the gap between your present abilities and your career goal.
              </p>
            </Link>
          </FadeIn>

          {/* Card 2: GROW */}
          <FadeIn delay={1000}>
            <Link to="/roadmap" className="group relative block bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#000080]/40 overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#000080] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#000080]/10 text-[#000080] transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#000080] tracking-widest">02 · GROW</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Follow Your Adaptive Roadmap</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Progress through personalized, prerequisite-based milestones that adapt to your learning decisions.
              </p>
            </Link>
          </FadeIn>

          {/* Card 3: CONNECT */}
          <FadeIn delay={1100}>
            <Link to="/opportunities" className="group relative block bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#138808]/40 overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#138808] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#138808]/10 text-[#138808] transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#138808] tracking-widest">03 · CONNECT</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unlock Opportunities</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Discover internships, hackathons, projects, and career opportunities matched to your verified readiness.
              </p>
            </Link>
          </FadeIn>
        </div>
      </div>

      {/* Complete Platform Portals Hub */}
      <FadeIn delay={1200} className="w-full">
        <div className="w-full bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-8 text-left shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-heading">
              Platform Modules & Interactive Workflows
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Direct access to all integrated student intake, progressive learning, academic institution, and hiring partner portals:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Student Intake */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-saffron uppercase tracking-wider mb-2">
                Student Intake & Assessment
              </h3>

              <Link
                to="/explore"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-saffron hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Career Discovery</span>
                  <span className="text-[11px] text-saffron font-bold">/explore</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Explore domains, roles & tech stacks</p>
              </Link>

              <Link
                to="/assessment/self"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-saffron hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Self Assessment</span>
                  <span className="text-[11px] text-saffron font-bold">/assessment/self</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Rate proficiency in role-specific skills</p>
              </Link>

              <Link
                to="/login"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-saffron hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Student Account</span>
                  <span className="text-[11px] text-saffron font-bold">/login & /register</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Sign in or register student credentials</p>
              </Link>
            </div>

            {/* Column 2: Progression & Opportunities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#138808] uppercase tracking-wider mb-2">
                Progression & Opportunities
              </h3>

              <Link
                to="/dashboard"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-[#138808] hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Living Dashboard</span>
                  <span className="text-[11px] text-[#138808] font-bold">/dashboard</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Readiness gauge, skill states & discrepancy</p>
              </Link>

              <Link
                to="/roadmap"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-[#138808] hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Adaptive Roadmap</span>
                  <span className="text-[11px] text-[#138808] font-bold">/roadmap</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Milestones, branch recalculation & evidence</p>
              </Link>

              <Link
                to="/opportunities"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-[#138808] hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Opportunity Hub</span>
                  <span className="text-[11px] text-[#138808] font-bold">/opportunities</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">3-tier matching with AI explanations</p>
              </Link>
            </div>

            {/* Column 3: Institution & Industry */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#000080] uppercase tracking-wider mb-2">
                Institution & Employer Portals
              </h3>

              <Link
                to="/institution/dashboard"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-[#000080] hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Institution Analytics</span>
                  <span className="text-[11px] text-[#000080] font-bold">/institution/dashboard</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cohort readiness & curriculum gaps</p>
              </Link>

              <Link
                to="/industry/onboard"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-[#000080] hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">Employer Portal</span>
                  <span className="text-[11px] text-[#000080] font-bold">/industry/onboard</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Post opportunities & find talent</p>
              </Link>

              <Link
                to="/institution/onboard"
                className="block p-3.5 rounded-xl bg-white border border-[#EAE3B3] hover:border-[#000080] hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">College Onboarding</span>
                  <span className="text-[11px] text-[#000080] font-bold">/institution/onboard</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Register college and AISHE details</p>
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </main>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-8 shadow-sm">
        <span className="text-4xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">Page Not Found</h1>
        <p className="text-gray-600 text-sm mt-2 mb-6">
          The requested route is not available. Please navigate to one of the active portals below:
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/" className="btn-saffron py-2.5 px-4 text-sm font-semibold">
            Return to Home
          </Link>
          <Link to="/dashboard" className="py-2.5 px-4 text-sm font-semibold rounded-lg border border-[#EAE3B3] hover:border-saffron bg-white transition">
            Student Dashboard
          </Link>
          <Link to="/explore" className="py-2.5 px-4 text-sm font-semibold rounded-lg border border-[#EAE3B3] hover:border-saffron bg-white transition">
            Explore Domains
          </Link>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCE2] text-slate-900 selection:bg-saffron selection:text-gray-900">
      <Navbar />

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/explore" element={<DiscoveryPage />} />

        {/* Student Intake & Assessment Flow (Protected: STUDENT, ADMIN) */}
        <Route path="/assessment/self" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <SelfAssessmentPage />
          </ProtectedRoute>
        } />
        <Route path="/assessment/quiz/:id" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <QuizDispatcher />
          </ProtectedRoute>
        } />

        {/* Student Progression & Learning Portals (Protected: STUDENT, ADMIN) */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <div className="flex-1 bg-transparent text-gray-900 w-full">
              <DashboardPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/roadmap" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <div className="flex-1 bg-transparent text-gray-900 w-full">
              <RoadmapPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/opportunities" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <div className="flex-1 bg-transparent text-gray-900 w-full">
              <OpportunitiesPage />
            </div>
          </ProtectedRoute>
        } />

        {/* Industry & Recruiter Portals */}
        <Route path="/industry/onboard" element={
          <div className="flex-1 bg-transparent text-gray-900 w-full">
            <IndustryOnboardPage />
          </div>
        } />
        <Route path="/industry/post-opportunity" element={
          <ProtectedRoute allowedRoles={['INDUSTRY', 'ADMIN']}>
            <div className="flex-1 bg-transparent text-gray-900 w-full">
              <IndustryPostJobPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/industry/talent" element={
          <ProtectedRoute allowedRoles={['INDUSTRY', 'ADMIN']}>
            <div className="flex-1 bg-transparent text-gray-900 w-full">
              <IndustryTalentPage />
            </div>
          </ProtectedRoute>
        } />

        {/* Academic Institution Portals */}
        <Route path="/institution/onboard" element={
          <div className="flex-1 bg-transparent text-gray-900 w-full">
            <InstitutionOnboardPage />
          </div>
        } />
        <Route path="/institution/login" element={<InstitutionLoginForm />} />
        <Route path="/institution/dashboard" element={
          <ProtectedRoute allowedRoles={['INSTITUTION', 'ADMIN']}>
            <InstitutionDashboardPage />
          </ProtectedRoute>
        } />

        {/* Fallback Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#FEFCE2] py-6 text-center text-xs text-slate-500 mt-auto">
        <p>Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
