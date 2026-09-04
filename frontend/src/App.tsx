import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
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

function LandingPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center">
      {/* Ministry / Scheme Pill */}
      <FadeIn delay={100}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-saffron/30 bg-saffron/10 text-saffron-300 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
          Problem Statement 26044: Academia–Industry Collaboration
        </div>
      </FadeIn>

      {/* Hero Title with Tricolor Text Gradient */}
      <FadeIn delay={200}>
        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight mb-4 max-w-3xl text-[#000080]">
          Empowering <span className="text-gradient-india">India's</span> Students with <span className="text-gradient-tricolor">Adaptive Skill Intelligence</span>
        </h1>
      </FadeIn>

      <FadeIn delay={300}>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
          Standardized skill graphs, calibrated diagnostic evaluations, prerequisite-ordered roadmaps, and verified opportunity matching.
        </p>
      </FadeIn>

      {/* CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mb-16 text-left">
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
          <Link to="/institution/onboard" className="group relative block bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-[#000080]/40 overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#000080] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#000080]/5 rounded-full blur-xl group-hover:bg-[#000080]/10 transition-colors duration-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#000080]/10 text-[#000080] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#000080] transition-colors">Institution Portal</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed relative z-10 flex-1">
              Access institution tools, student insights, skill progress data, and resources designed to support better academic and career outcomes.
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          {/* Card 1: ASSESS */}
          <FadeIn delay={900}>
            <div className="group relative bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#FF9933]/40 overflow-hidden h-full">
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
            </div>
          </FadeIn>

          {/* Card 2: GROW */}
          <FadeIn delay={1000}>
            <div className="group relative bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#000080]/40 overflow-hidden h-full">
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
            </div>
          </FadeIn>

          {/* Card 3: CONNECT */}
          <FadeIn delay={1100}>
            <div className="group relative bg-[#FFFEF2] p-6 rounded-2xl border border-[#EAE3B3] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#138808]/40 overflow-hidden h-full">
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
            </div>
          </FadeIn>

        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#FEFCE2] text-slate-900 selection:bg-saffron selection:text-gray-900">
        {/* Top Gov Header */}
        <header 
          className="border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm"
          style={{
            background: 'linear-gradient(90deg, #FFCE99 0%, #FFF3CC 30%, #FEFFE3 50%, #D4F0D1 70%, #AAE2A8 100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF3E0] flex items-center justify-center border border-[#FFE0B2] shadow-sm overflow-hidden">
              <img src="/edu-logo.jpg" alt="Vidyut Education Logo" className="w-full h-full object-cover scale-[1.15]" />
            </div>
            <Link to="/">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg text-gray-900 tracking-tight">VIDYUT</span>
                <span className="gov-badge text-[10px] py-0.5 px-2">SIH 2026</span>
              </div>
              <p className="text-[11px] text-gray-600 hidden sm:block">Adaptive Career & Skill Readiness Platform · Govt. of India</p>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-2 text-sm">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:bg-saffron/10 hover:text-saffron ${
                    isActive 
                      ? 'text-gray-900 font-bold bg-saffron/5 underline decoration-saffron decoration-2 underline-offset-[6px]' 
                      : 'text-gray-700 font-medium'
                  }`
                }>
                Dashboard
              </NavLink>
              <NavLink 
                to="/roadmap" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:bg-saffron/10 hover:text-saffron ${
                    isActive 
                      ? 'text-gray-900 font-bold bg-saffron/5 underline decoration-saffron decoration-2 underline-offset-[6px]' 
                      : 'text-gray-700 font-medium'
                  }`
                }>
                Roadmap
              </NavLink>
              <NavLink 
                to="/opportunities" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:bg-saffron/10 hover:text-saffron ${
                    isActive 
                      ? 'text-gray-900 font-bold bg-saffron/5 underline decoration-saffron decoration-2 underline-offset-[6px]' 
                      : 'text-gray-700 font-medium'
                  }`
                }>
                Opportunities
              </NavLink>

              <div className="h-5 w-px bg-slate-300 mx-2" />
              
              <NavLink 
                to="/industry/onboard" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:text-saffron hover:underline hover:decoration-saffron/70 hover:decoration-2 hover:underline-offset-[6px] ${
                    isActive 
                      ? 'text-indiaGreen font-bold bg-indiaGreen/5 underline decoration-indiaGreen decoration-2 underline-offset-[6px]' 
                      : 'text-[#B85C16] font-bold'
                  }`
                }>
                Employer Portal
              </NavLink>
            </nav>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <button className="btn-saffron text-xs py-2 px-4">
                Sign In / Register
              </button>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <DashboardPage />
            </div>
          } />
          <Route path="/assessment/quiz/:skillId" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <AssessmentQuizPage />
            </div>
          } />
          <Route path="/roadmap" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <RoadmapPage />
            </div>
          } />
          <Route path="/opportunities" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <OpportunitiesPage />
            </div>
          } />
          <Route path="/industry/onboard" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <IndustryOnboardPage />
            </div>
          } />
          <Route path="/industry/post-opportunity" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <IndustryPostJobPage />
            </div>
          } />
          <Route path="/industry/talent" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <IndustryTalentPage />
            </div>
          } />
          <Route path="/institution/onboard" element={
            <div className="flex-1 bg-transparent text-gray-900 w-full">
               <InstitutionOnboardPage />
            </div>
          } />
        </Routes>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-[#FEFCE2] py-6 text-center text-xs text-slate-500 mt-auto">
          <p>Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative</p>
        </footer>
      </div>
    </Router>
  );
}




