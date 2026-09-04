import React from 'react';
import { School, CheckSquare, User, Mail, Hash } from 'lucide-react';

export const InstitutionRegisterForm: React.FC = () => {
  return (
    <form className="bg-[#FFFFED] p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-[#000080] rounded-full flex items-center justify-center mx-auto mb-4">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Register Institution</h2>
        <p className="text-gray-500 mt-2">Onboard your college to access skill-gap analytics and student readiness reports.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College / Institution Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <School className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]" placeholder="e.g. Vellore Institute of Technology" required />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AISHE Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]" placeholder="e.g. C-36944" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placement Officer Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input type="text" className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]" placeholder="e.g. Dr. Ramesh Kumar" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input type="email" className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-[#000080] focus:border-[#000080]" placeholder="e.g. placement@college.edu.in" required />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Active Departments</label>
          <div className="grid grid-cols-2 gap-2">
            {['Computer Science (CSE)', 'Information Tech (IT)', 'Data Science & AI', 'Electronics (ECE)'].map(dept => (
              <label key={dept} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="rounded text-[#000080] focus:ring-[#000080]" />
                <span className="text-sm text-gray-700">{dept}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button type="button" className="w-full bg-[#000080] hover:bg-blue-900 text-white font-medium py-3 rounded-md transition-colors flex justify-center items-center gap-2 mt-4">
        <CheckSquare className="w-5 h-5" />
        Create Institution Portal
      </button>
    </form>
  );
};
