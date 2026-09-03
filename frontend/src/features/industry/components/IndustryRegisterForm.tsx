import React from 'react';
import { Building2, Globe, Briefcase } from 'lucide-react';

export const IndustryRegisterForm: React.FC = () => {
  return (
    <form className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Partner with Vidyut</h2>
        <p className="text-gray-500 mt-2">Register your organization to hire verified, skill-ready students directly from the ecosystem.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input type="text" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Bangalore Analytics Co." required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
          <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white">
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
            <input type="url" className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com" required />
          </div>
        </div>
      </div>

      <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors flex justify-center items-center gap-2">
        <Briefcase className="w-5 h-5" />
        Create Recruiter Account
      </button>
    </form>
  );
};
