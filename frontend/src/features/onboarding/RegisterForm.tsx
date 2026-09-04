import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    institution: '',
    degree: '',
    year_of_study: '',
    interests: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // Temporary demo registration
    const demoUser = {
      full_name: form.full_name,
      email: form.email,
      institution: form.institution,
      degree: form.degree,
      year_of_study: Number(form.year_of_study),
      interests: form.interests
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    localStorage.setItem(
      'demo_user',
      JSON.stringify(demoUser)
    );

    localStorage.setItem(
      'access_token',
      'demo-token'
    );

    setTimeout(() => {
      setLoading(false);
      navigate('/explore');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0A111F] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-[#111D32] border border-[#1F3152] rounded-2xl p-8 shadow-xl">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">⚡</div>

          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

          <p className="text-slate-400 mt-2">
            Join Vidyut and discover your career path
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name *
            </label>

            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Priya Sharma"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email *
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password *
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Institution *
            </label>

            <input
              type="text"
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="VIT Chennai"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Degree *
            </label>

            <input
              type="text"
              name="degree"
              value={form.degree}
              onChange={handleChange}
              placeholder="B.Tech CSE"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Year of Study *
            </label>

            <input
              type="number"
              name="year_of_study"
              value={form.year_of_study}
              onChange={handleChange}
              placeholder="2"
              min="1"
              max="6"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Interests
            </label>

            <input
              type="text"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="AI/ML, Backend, Cloud"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />

            <p className="text-xs text-slate-500 mt-1">
              Separate multiple interests with commas.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9933] hover:bg-[#e88722] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-slate-400">
          Already have an account?{' '}

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[#FF9933] hover:underline font-medium"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
}