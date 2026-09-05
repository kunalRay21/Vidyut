import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Compass,
  LayoutDashboard,
  Route as RouteIcon,
  Briefcase,
  Building2,
  GraduationCap,
  ArrowRight,
  User,
  ShieldCheck,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const portalsMenuRef = useRef<HTMLDivElement>(null);

  // Close all menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setPortalsDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside clicks to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (portalsMenuRef.current && !portalsMenuRef.current.contains(event.target as Node)) {
        setPortalsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleMeta: Record<UserRole, { label: string; badgeColor: string; home: string }> = {
    STUDENT: {
      label: 'Student',
      badgeColor: 'bg-saffron/10 text-saffron-700 border-saffron/20',
      home: '/dashboard',
    },
    INDUSTRY: {
      label: 'Employer',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      home: '/industry/talent',
    },
    INSTITUTION: {
      label: 'College Admin',
      badgeColor: 'bg-blue-50 text-[#000080] border-blue-200',
      home: '/institution/dashboard',
    },
    ADMIN: {
      label: 'System Admin',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      home: '/dashboard',
    },
  };

  const currentRole = user?.role ? roleMeta[user.role] : null;

  const displayName =
    user?.full_name ||
    user?.company_name ||
    user?.college_name ||
    (user?.email ? user.email.split('@')[0] : 'User');

  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header 
      className="sticky top-0 z-50 border-b border-gray-200/90 shadow-sm transition-all"
      style={{
        background: 'linear-gradient(90deg, #FFCE99 0%, #FFF3CC 30%, #FEFFE3 50%, #D4F0D1 70%, #AAE2A8 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name - Clean & Uncluttered */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#FFE0B2] shadow-2xs bg-[#FFF3E0] flex items-center justify-center shrink-0 group-hover:border-saffron/70 transition">
              <img
                src="/edu-logo.jpg"
                alt="Vidyut Emblem"
                className="w-full h-full object-cover scale-110"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-black text-lg tracking-tight text-gray-900 group-hover:text-[#000080] transition">
                VIDYUT
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
            </div>
          </Link>

          {/* Desktop Navigation - Spacious & Sleek */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              {t('nav.explore')}
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              {t('nav.dashboard')}
            </NavLink>

            <NavLink
              to="/roadmap"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              {t('nav.roadmap')}
            </NavLink>

            <NavLink
              to="/opportunities"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              {t('nav.opportunities')}
            </NavLink>

            <NavLink
              to="/passport"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Skill Passport</span>
            </NavLink>

            <NavLink
              to="/simulator"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              <Compass className="w-3.5 h-3.5 text-cyan-600" />
              <span>Career Simulator</span>
            </NavLink>

            <NavLink
              to="/remediation"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Skill Repair</span>
            </NavLink>

            <NavLink
              to="/job-simulations"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`
              }
            >
              <Terminal className="w-3.5 h-3.5 text-rose-500" />
              <span>Job Simulations</span>
            </NavLink>

            {/* Portals Dropdown Trigger - Eliminates Horizontal Clutter */}
            <div className="relative" ref={portalsMenuRef}>
              <button
                type="button"
                onClick={() => setPortalsDropdownOpen((prev) => !prev)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  location.pathname.startsWith('/industry') || location.pathname.startsWith('/institution')
                    ? 'text-gray-950 font-bold bg-white/70 shadow-2xs backdrop-blur-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/40'
                }`}
              >
                <span>{t('nav.portals')}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                    portalsDropdownOpen ? 'rotate-180 text-gray-900' : ''
                  }`}
                />
              </button>

              {portalsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white border border-gray-100 shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {t('nav.portals')}
                  </div>

                  <Link
                    to={user?.role === 'INDUSTRY' ? '/industry/talent' : '/industry/onboard'}
                    onClick={() => setPortalsDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/60 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-[#B85C16] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#B85C16] transition-colors">
                        {t('nav.industryPortal')}
                      </p>
                      <p className="text-xs text-gray-500 leading-snug">
                        {t('nav.industryPortalDesc')}
                      </p>
                    </div>
                  </Link>

                  <Link
                    to={user?.role === 'INSTITUTION' ? '/institution/dashboard' : '/institution/dashboard'}
                    onClick={() => setPortalsDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/60 transition group mt-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-[#000080] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#000080] transition-colors">
                        {t('nav.collegePortal')}
                      </p>
                      <p className="text-xs text-gray-500 leading-snug">
                        {t('nav.collegePortalDesc')}
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right Side: Language Switcher + Auth / Profile Dropdown */}
          <div className="hidden md:flex items-center gap-2.5">
            <LanguageSwitcher />

            {!isAuthenticated || !user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-600 hover:text-gray-950 px-2 py-1.5 transition"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-full bg-saffron text-white hover:bg-saffron-600 shadow-2xs transition-all hover:shadow-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            ) : (
              /* Sleek Floating Profile Trigger (eliminates cramped row) */
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 pl-2 pr-2.5 py-1 rounded-full hover:bg-black/[0.03] transition-colors cursor-pointer border border-transparent hover:border-gray-200/80"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-200/80 flex items-center justify-center font-bold text-xs shadow-2xs">
                    {avatarInitial}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 max-w-[110px] truncate">
                    {displayName.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border border-gray-100 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
                      {currentRole && (
                        <div className="mt-2">
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentRole.badgeColor}`}
                          >
                            {currentRole.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to={currentRole?.home || '/dashboard'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-gray-500" />
                        <span>My Portal Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                      >
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span>Profile & Resume</span>
                      </Link>

                      <Link
                        to="/explore"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                      >
                        <Compass className="w-3.5 h-3.5 text-gray-500" />
                        <span>Explore Skill Graphs</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button + Language Switcher */}
          <div className="flex md:hidden items-center gap-1.5">
            <LanguageSwitcher compact />
            {isAuthenticated && user && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-200 flex items-center justify-center font-bold text-xs shadow-2xs"
              >
                {avatarInitial}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-950 hover:bg-black/[0.04] transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-gray-200/80 px-5 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200"
          style={{
            background: 'linear-gradient(180deg, #FFF3CC 0%, #FEFFE3 40%, #EAF5EA 100%)',
          }}
        >
          {/* Authenticated user header card on mobile */}
          {isAuthenticated && user && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {avatarInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-950 truncate">{displayName}</p>
                  {currentRole && (
                    <span
                      className={`inline-block text-[9px] font-semibold px-2 py-0.2 rounded-full border mt-0.5 ${currentRole.badgeColor}`}
                    >
                      {currentRole.label}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-semibold text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          )}

          {/* Student / Explorer Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
              {t('nav.portals')}
            </p>

            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-saffron" />
                <span>{t('nav.explore')}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-saffron" />
                <span>{t('nav.dashboard')}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-black/[0.04] text-gray-950 font-semibold'
                      : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Profile & Resume</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </NavLink>
            )}

            <NavLink
              to="/roadmap"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <RouteIcon className="w-4 h-4 text-indiaGreen" />
                <span>{t('nav.roadmap')}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            <NavLink
              to="/opportunities"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-[#B85C16]" />
                <span>{t('nav.opportunities')}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            <NavLink
              to="/passport"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Skill Passport</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            <NavLink
              to="/simulator"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-cyan-600" />
                <span>Career Simulator</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            <NavLink
              to="/remediation"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Skill Repair</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            <NavLink
              to="/job-simulations"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-black/[0.04] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-rose-500" />
                <span>Job Simulations</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>
          </div>

          {/* Ecosystem Portals */}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
              Ecosystem Portals
            </p>

            <NavLink
              to={user?.role === 'INDUSTRY' ? '/industry/talent' : '/industry/onboard'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-50 text-[#B85C16] font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#B85C16]" />
                <span>{t('nav.industryPortal')}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>

            <NavLink
              to={user?.role === 'INSTITUTION' ? '/institution/dashboard' : '/institution/dashboard'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-[#000080] font-semibold'
                    : 'text-gray-600 hover:bg-black/[0.02] hover:text-gray-950'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-[#000080]" />
                <span>{t('nav.collegePortal')}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </NavLink>
          </div>

          {/* Guest CTAs */}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2.5">
              <Link
                to="/login"
                className="w-full text-center py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 px-4 rounded-xl bg-saffron text-white text-xs font-semibold shadow-2xs hover:bg-saffron-600 transition"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
