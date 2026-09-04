import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const InstitutionLoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    setLoading(true);
    localStorage.setItem('institution_token', 'demo-institution-token');

    setTimeout(() => {
      setLoading(false);
      navigate('/institution/dashboard');
    }, 400);
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#000080]/10 text-[#000080] flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Institution Portal Login
          </h1>

          <p className="text-gray-600 text-sm mt-1">
            Access placement intelligence & curriculum readiness analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Officer Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@institution.edu.in"
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] transition"
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
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-chakra py-3 rounded-lg font-bold text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Don't have an institution account?{' '}
          <Link
            to="/institution/onboard"
            className="text-[#000080] hover:underline font-semibold"
          >
            Register College (AISHE)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstitutionLoginForm;
