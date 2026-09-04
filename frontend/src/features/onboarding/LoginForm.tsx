import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Sparkles, Building2, GraduationCap, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const targetPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(targetPath, { replace: true });
      } else {
        setError(res.error || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'STUDENT' | 'INDUSTRY' | 'INSTITUTION') => {
    loginAsDemo(role);
    if (role === 'STUDENT') {
      navigate(targetPath, { replace: true });
    } else if (role === 'INDUSTRY') {
      navigate('/industry/talent', { replace: true });
    } else if (role === 'INSTITUTION') {
      navigate('/institution/dashboard', { replace: true });
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-saffron/10 text-saffron flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold font-heading text-gray-900">
            {t('auth.loginTitle')}
          </h1>

          <p className="text-gray-600 text-sm mt-1">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Quick Demo Switcher for Evaluation */}
        <div className="mb-6 p-3.5 rounded-xl bg-saffron/5 border border-saffron/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-700 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            {t('auth.quickDemoAccess')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('STUDENT')}
              className="px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 hover:border-saffron hover:text-saffron transition flex flex-col items-center gap-1 shadow-2xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-saffron" />
              <span>{t('auth.student')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('INDUSTRY')}
              className="px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 hover:border-[#B85C16] hover:text-[#B85C16] transition flex flex-col items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#B85C16]" />
              <span>{t('auth.industry')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('INSTITUTION')}
              className="px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 hover:border-[#000080] hover:text-[#000080] transition flex flex-col items-center gap-1 shadow-2xs cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#000080]" />
              <span>{t('auth.college')}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-saffron py-3 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
          >
            {loading ? '...' : t('auth.signInBtn')}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="text-saffron hover:underline font-semibold"
          >
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
