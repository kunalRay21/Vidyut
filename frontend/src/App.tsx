import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardPage } from './pages/DashboardPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { IndustryOnboardPage } from './pages/IndustryOnboardPage';
import { IndustryPostJobPage } from './pages/IndustryPostJobPage';
import { IndustryTalentPage } from './pages/IndustryTalentPage';
import { InstitutionOnboardPage } from './pages/InstitutionOnboardPage';
import { LandingPage } from './pages/LandingPage';

import LoginForm from './features/onboarding/LoginForm';
import RegisterForm from './features/onboarding/RegisterForm';
import DiscoveryPage from './features/onboarding/DiscoveryPage';
import SelfAssessmentPage from './features/onboarding/SelfAssessmentPage';
import { ExamPlatformPage } from './features/assessment-platform';

import InstitutionLoginForm from './features/institution/InstitutionLoginForm';
import InstitutionDashboardPage from './features/institution/InstitutionDashboardPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm">
        <span className="text-4xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">Page Not Found</h1>
        <p className="text-gray-600 text-sm mt-2 mb-6">
          The requested route is not available. Please navigate to one of the active portals below:
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/" className="btn-saffron py-2.5 px-4 text-sm font-semibold">
            Return to Home
          </Link>
          <Link to="/dashboard" className="py-2.5 px-4 text-sm font-semibold rounded-lg border border-gray-200 hover:border-saffron bg-white transition">
            Student Dashboard
          </Link>
          <Link to="/explore" className="py-2.5 px-4 text-sm font-semibold rounded-lg border border-gray-200 hover:border-saffron bg-white transition">
            Explore Domains
          </Link>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-slate-900 selection:bg-saffron selection:text-gray-900">
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/explore" element={<DiscoveryPage />} />

        <Route path="/assessment/self" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <SelfAssessmentPage />
          </ProtectedRoute>
        } />
        <Route path="/assessment/quiz/:id" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <ExamPlatformPage />
          </ProtectedRoute>
        } />
        <Route path="/assessment/quiz" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <ExamPlatformPage />
          </ProtectedRoute>
        } />

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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <footer className="border-t border-gray-200/80 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <p>{t('footer.text')}</p>
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
