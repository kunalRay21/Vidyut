import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Compass,
  LayoutDashboard,
  Route as RouteIcon,
  Briefcase,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const roleStyles: Record<UserRole, { badge: string; label: string; home: string }> = {
    STUDENT: {
      badge: 'bg-saffron-50 text-saffron-800 border-saffron-200/80',
      label: 'Student',
      home: '/dashboard',
    },
    INDUSTRY: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      label: 'Employer',
      home: '/industry/talent',
    },
    INSTITUTION: {
      badge: 'bg-blue-50 text-[#000080] border-blue-200/80',
      label: 'College Admin',
      home: '/institution/dashboard',
    },
    ADMIN: {
      badge: 'bg-purple-50 text-purple-800 border-purple-200/80',
      label: 'Admin',
      home: '/dashboard',
    },
  };

  const currentRoleConfig = user?.role
    ? roleStyles[user.role]
    : {
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'Guest',
        home: '/dashboard',
      };

  const displayName =
    user?.full_name ||
    user?.company_name ||
    user?.college_name ||
    (user?.email ? user.email.split('@')[0] : 'User');

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
      isActive
        ? 'bg-saffron-50/90 text-saffron-800 font-semibold shadow-2xs'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
    }`;

  const portalItemClass = (activeColor: string) => ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
      isActive
        ? `${activeColor} font-semibold shadow-2xs`
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/70 transition-all">
      {/* Subtle National Tricolor Micro-Ribbon */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-saffron via-[#F4F4F4] to-indiaGreen opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200/80 shadow-2xs bg-white flex items-center justify-center shrink-0 group-hover:border-saffron/50 transition">
              <img
                src="/edu-logo.jpg"
                alt="Vidyut Logo"
                className="w-full h-full object-cover scale-110"
                onError={(e) => {
                  // Graceful fallback if image is unavailable
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base tracking-tight text-[#000080] group-hover:text-saffron-600 transition">
                  VIDYUT
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600 border border-gray-200/70">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-gray-500 hidden sm:block leading-none font-normal mt-0.5">
                Adaptive Skill Intelligence · Govt. of India
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/explore" className={navItemClass}>
              Explore
            </NavLink>
            <NavLink to="/dashboard" className={navItemClass}>
              Dashboard
            </NavLink>
            <NavLink to="/roadmap" className={navItemClass}>
              Roadmap
            </NavLink>
            <NavLink to="/opportunities" className={navItemClass}>
              Opportunities
            </NavLink>

            <div className="h-4 w-px bg-gray-200 mx-2" />

            <NavLink
              to={user?.role === 'INDUSTRY' ? '/industry/talent' : '/industry/onboard'}
              className={portalItemClass('bg-amber-50 text-[#B85C16]')}
            >
              Employer Portal
            </NavLink>

            <NavLink
              to={user?.role === 'INSTITUTION' ? '/institution/dashboard' : '/institution/dashboard'}
              className={portalItemClass('bg-blue-50 text-[#000080]')}
            >
              College Portal
            </NavLink>
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated || !user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100/70 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-saffron text-xs font-semibold py-1.5 px-3.5 rounded-lg shadow-2xs"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to={currentRoleConfig.home}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100/70 transition group text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-200 flex items-center justify-center font-bold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-gray-900 group-hover:text-saffron-600 transition max-w-[130px] truncate">
                      {displayName}
                    </p>
                    <span
                      className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded border ${currentRoleConfig.badge}`}
                    >
                      {currentRoleConfig.label}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user && (
              <Link
                to={currentRoleConfig.home}
                className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-200 flex items-center justify-center font-bold text-xs"
              >
                {displayName.charAt(0).toUpperCase()}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/80 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* User Profile Info in Mobile */}
          {isAuthenticated && user && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/70 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                  <span
                    className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${currentRoleConfig.badge}`}
                  >
                    {currentRoleConfig.label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Student Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1">
              Platform Features
            </p>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-saffron-50 text-saffron-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100/70'
                }`
              }
            >
              <Compass className="w-4 h-4 text-saffron-600" />
              <span>Explore Domains</span>
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-saffron-50 text-saffron-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100/70'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 text-saffron-600" />
              <span>Student Dashboard</span>
            </NavLink>
            <NavLink
              to="/roadmap"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-saffron-50 text-saffron-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100/70'
                }`
              }
            >
              <RouteIcon className="w-4 h-4 text-indiaGreen" />
              <span>Learning Roadmap</span>
            </NavLink>
            <NavLink
              to="/opportunities"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-saffron-50 text-saffron-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100/70'
                }`
              }
            >
              <Briefcase className="w-4 h-4 text-[#B85C16]" />
              <span>Opportunities</span>
            </NavLink>
          </div>

          <div className="border-t border-gray-100 pt-2 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1">
              Ecosystem Portals
            </p>
            <NavLink
              to={user?.role === 'INDUSTRY' ? '/industry/talent' : '/industry/onboard'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-50 text-[#B85C16] font-semibold'
                    : 'text-gray-700 hover:bg-gray-100/70'
                }`
              }
            >
              <Building2 className="w-4 h-4 text-[#B85C16]" />
              <span>Employer Portal</span>
            </NavLink>
            <NavLink
              to={user?.role === 'INSTITUTION' ? '/institution/dashboard' : '/institution/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-[#000080] font-semibold'
                    : 'text-gray-700 hover:bg-gray-100/70'
                }`
              }
            >
              <GraduationCap className="w-4 h-4 text-[#000080]" />
              <span>College Portal</span>
            </NavLink>
          </div>

          {/* Unauthenticated Actions in Mobile */}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2 px-4 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full btn-saffron text-center py-2 px-4 rounded-lg text-xs font-semibold shadow-2xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
