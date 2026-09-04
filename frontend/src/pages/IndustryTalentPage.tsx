import React from 'react';
import { TalentPoolTable } from '../features/industry/components/TalentPoolTable';
import { Link } from 'react-router-dom';
import { Users, FilePlus } from 'lucide-react';
import { FadeIn } from '../components/animations/FadeIn';

export const IndustryTalentPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <FadeIn delay={100}>
        <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Portal</h1>
            <p className="text-gray-500 mt-2">Bangalore Analytics Co. Dashboard</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
              <Users className="w-4 h-4" />
              View Talent Pool
            </button>
            <Link to="/industry/post-opportunity" className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors">
              <FilePlus className="w-4 h-4" />
              Post Opportunity
            </Link>
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={200}>
        <TalentPoolTable />
      </FadeIn>
    </div>
  );
};


