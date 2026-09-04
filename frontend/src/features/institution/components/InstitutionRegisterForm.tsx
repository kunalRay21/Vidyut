import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, CheckSquare, User, Mail, Hash } from 'lucide-react';
import { institutionApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export const InstitutionRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { loginInstitution } = useAuth();
  const [collegeName, setCollegeName] = useState('');
  const [aisheCode, setAisheCode] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    'Computer Science (CSE)',
    'Information Tech (IT)',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availableDepts = [
    'Computer Science (CSE)',
    'Information Tech (IT)',
    'Data Science & AI',
    'Electronics (ECE)',
  ];

  const handleDeptToggle = (dept: string) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName || !officerName) {
      setError('College name and officer name are required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await institutionApi.register({
        college_name: collegeName,
        aishe_code: aisheCode,
        officer_name: officerName,
        departments: selectedDepts,
      });

      loginInstitution({
        collegeName,
        aisheCode,
        officerName,
      });

      setSuccess(true);
      setTimeout(() => navigate('/institution/dashboard'), 800);
    } catch (err: any) {
      setError(err.message || 'Institution registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FFFFED] p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-[#000080] rounded-full flex items-center justify-center mx-auto mb-4">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Register Institution</h2>
        <p className="text-gray-500 mt-2">Onboard your college to access skill-gap analytics and student readiness reports.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College / Institution Name *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <School className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]"
              placeholder="e.g. Vellore Institute of Technology"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AISHE Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={aisheCode}
              onChange={(e) => setAisheCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]"
              placeholder="e.g. C-36944"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placement Officer Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]"
                placeholder="e.g. Dr. Ramesh Kumar"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]"
                placeholder="e.g. placement@college.edu.in"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Active Departments</label>
          <div className="grid grid-cols-2 gap-2">
            {availableDepts.map((dept) => (
              <label
                key={dept}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedDepts.includes(dept)}
                  onChange={() => handleDeptToggle(dept)}
                  className="rounded text-[#000080] focus:ring-[#000080]"
                />
                <span className="text-sm text-gray-700">{dept}</span>
              </label>
            ))}
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
          Institution onboarded successfully! Redirecting to analytics dashboard...
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#000080] hover:bg-blue-900 text-white font-medium py-3 rounded-md transition-colors flex justify-center items-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
      >
        <CheckSquare className="w-5 h-5" />
        {loading ? 'Creating Institution Portal...' : 'Create Institution Portal'}
      </button>
    </form>
  );
};
