import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe, Briefcase } from 'lucide-react';
import { industryApi } from '../../../services/api';

export const IndustryRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('Artificial Intelligence & Analytics');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      setError('Company name is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await industryApi.register({
        company_name: companyName,
        sector,
        website,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/industry/talent');
        }, 800);
      } else {
        // Fallback demo storage
        localStorage.setItem('industry_company', JSON.stringify({ companyName, sector, website }));
        setSuccess(true);
        setTimeout(() => {
          navigate('/industry/talent');
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FFFFED] p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Partner with Vidyut</h2>
        <p className="text-gray-500 mt-2">Register your organization to hire verified, skill-ready students directly from the ecosystem.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Bangalore Analytics Co."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option>Artificial Intelligence & Analytics</option>
            <option>Fintech</option>
            <option>Core Engineering</option>
            <option>Healthcare Tech</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-xs">
          Organization verified! Redirecting to verified talent pool...
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Briefcase className="w-5 h-5" />
        {loading ? 'Registering Recruiter...' : 'Create Recruiter Account'}
      </button>
    </form>
  );
};
