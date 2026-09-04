import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { FadeIn } from '../animations/FadeIn';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath,
}) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="w-10 h-10 border-4 border-saffron/30 border-t-saffron rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-600">Verifying security credentials...</p>
      </div>
    );
  }

  // 1. Unauthenticated: Redirect to login
  if (!isAuthenticated) {
    let resolvedRedirect = redirectPath;
    if (!resolvedRedirect) {
      if (allowedRoles && allowedRoles.length === 1 && allowedRoles[0] === 'INSTITUTION') {
        resolvedRedirect = '/institution/login';
      } else if (allowedRoles && allowedRoles.length === 1 && allowedRoles[0] === 'INDUSTRY') {
        resolvedRedirect = '/industry/onboard';
      } else {
        resolvedRedirect = '/login';
      }
    }

    return <Navigate to={resolvedRedirect} state={{ from: location }} replace />;
  }

  // 2. Role-Based Check: Authenticated, but role not allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const roleLabels: Record<UserRole, string> = {
      STUDENT: 'Student',
      INDUSTRY: 'Industry Employer',
      INSTITUTION: 'College / Institution Admin',
      ADMIN: 'System Admin',
    };

    const targetPortal =
      user.role === 'STUDENT'
        ? '/dashboard'
        : user.role === 'INDUSTRY'
        ? '/industry/talent'
        : user.role === 'INSTITUTION'
        ? '/institution/dashboard'
        : '/dashboard';

    const targetPortalName =
      user.role === 'STUDENT'
        ? 'Student Living Dashboard'
        : user.role === 'INDUSTRY'
        ? 'Employer Talent Portal'
        : user.role === 'INSTITUTION'
        ? 'Institution Analytics'
        : 'Dashboard';

    return (
      <div className="flex-1 max-w-2xl mx-auto px-6 py-16 text-center">
        <FadeIn delay={100}>
          <div className="bg-[#FFFEF2] border border-amber-300/80 rounded-2xl p-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Access Restricted
            </span>

            <h2 className="text-2xl font-bold font-heading text-gray-900 mt-4">
              Role Authorization Required
            </h2>

            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              This section is reserved for{' '}
              <strong className="text-gray-800">
                {allowedRoles.map((r) => roleLabels[r] || r).join(' or ')}
              </strong>
              . You are currently logged in with a{' '}
              <strong className="text-[#000080]">
                {roleLabels[user.role] || user.role}
              </strong>{' '}
              account ({user.email}).
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={targetPortal}
                className="btn-saffron text-sm px-5 py-2.5 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to {targetPortalName}
              </Link>

              <button
                type="button"
                onClick={logout}
                className="text-sm px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Switch Account
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  // 3. Authorized
  return <>{children}</>;
};
