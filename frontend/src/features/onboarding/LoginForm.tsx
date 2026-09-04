import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed.');
      }

      const token = result.data.access_token;

      localStorage.setItem('access_token', token);

      navigate('/explore');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A111F] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111D32] border border-[#1F3152] rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">⚡</div>

          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="text-slate-400 mt-2">
            Sign in to continue to Vidyut
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-[#0A111F] border border-[#334155] text-white outline-none focus:border-[#FF9933]"
            />
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-[#FF9933] hover:underline font-medium"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}