import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

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
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || '';
      if (baseUrl) {
        const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Login failed.');
        }
        localStorage.setItem('access_token', result.data.access_token);
      } else {
        // Demo fallback token
        localStorage.setItem('access_token', 'demo-token');
      }

      navigate('/explore');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
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
            Welcome Back
          </h1>

          <p className="text-gray-600 text-sm mt-1">
            Sign in to continue your Vidyut career readiness journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
            className="w-full btn-saffron py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-saffron hover:underline font-semibold"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
