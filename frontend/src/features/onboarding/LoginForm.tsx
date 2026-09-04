import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { authApi, setStoredToken, setStoredUser } from '../../services/api';

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
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        if (response.data.access_token) {
          setStoredToken(response.data.access_token);
        }
        if (response.data.user) {
          setStoredUser(response.data.user);
        }
      } else {
        // Fallback for offline demo mode
        setStoredToken('demo-token');
        setStoredUser({
          id: 'student-demo',
          email,
          full_name: 'Priya Sharma',
          institution: 'VIT Chennai',
          degree: 'B.Tech CSE',
          year_of_study: 2,
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
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
            className="w-full btn-saffron py-3 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
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
