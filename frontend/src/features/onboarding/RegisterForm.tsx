import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { careersApi } from '../../services/api';

export default function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerStudent } = useAuth();

  const [branches, setBranches] = useState<any[]>([]);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    institution: '',
    degree: 'B.Tech CSE',
    academic_branch_id: '',
    year_of_study: '',
    interests: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    async function loadBranches() {
      try {
        const res = await careersApi.getAcademicBranches();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setBranches(res.data);
          const cseBranch = res.data.find((b: any) => b.code === 'CSE');
          if (cseBranch) {
            setForm((prev) => ({ ...prev, academic_branch_id: cseBranch.id }));
          }
        }
      } catch (err) {
        console.warn('Academic branch fetch error:', err);
      }
    }
    loadBranches();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.full_name ||
      !form.email ||
      !form.password ||
      !form.institution ||
      !form.degree ||
      !form.year_of_study
    ) {
      setError('Please fill all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    const parsedInterests = form.interests
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const res = await registerStudent({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        institution: form.institution,
        degree: form.degree,
        academic_branch_id: form.academic_branch_id || undefined,
        year_of_study: Number(form.year_of_study),
        interests: parsedInterests,
      });

      if (res.success) {
        navigate('/explore');
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-saffron/10 text-saffron flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold font-heading text-gray-900">
            {t('auth.registerTitle')}
          </h1>

          <p className="text-gray-600 text-sm mt-1">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.fullNameLabel')} *
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Priya Sharma"
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.emailLabel')} *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.passwordLabel')} *
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.institutionLabel')} *
              </label>
              <input
                type="text"
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder={t('auth.institutionPlaceholder')}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
              />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Branch *
            </label>
            <select
              name="academic_branch_id"
              value={form.academic_branch_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            >
              <option value="">Select Academic Branch...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.yearLabel')} *
              </label>
              <input
                type="number"
                name="year_of_study"
                value={form.year_of_study}
                onChange={handleChange}
                placeholder="2"
                min="1"
                max="6"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.interestsLabel', 'Interests')}
              </label>
              <input
                type="text"
                name="interests"
                value={form.interests}
                onChange={handleChange}
                placeholder="AI/ML, Backend, Cloud"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-saffron py-3 rounded-lg font-semibold disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? t('auth.creatingAccount', 'Creating Account...') : t('auth.signUpBtn')}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          {t('auth.alreadyAccount')}{' '}
          <Link
            to="/login"
            className="text-saffron hover:underline font-semibold"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
