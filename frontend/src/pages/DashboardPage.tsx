import React from 'react';
import { MOCK_STUDENT_PROFILE } from '../mocks/studentSessionMock';
import { ReadinessGauge } from '../features/dashboard/ReadinessGauge';
import { SkillStateList } from '../features/dashboard/SkillStateList';
import { DiscrepancyNotice } from '../features/dashboard/DiscrepancyNotice';
import { User, BookOpen, Target, GraduationCap } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const profile = MOCK_STUDENT_PROFILE;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, {profile.full_name}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          {/* Profile Overview Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Career Goal Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Target className="w-5 h-5 text-blue-500" />
                <span>Target Role: <strong className="text-gray-900">{profile.selected_role}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
                <span>Institution: <strong className="text-gray-900">{profile.institution}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <span>Degree: <strong className="text-gray-900">{profile.degree}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <User className="w-5 h-5 text-purple-500" />
                <span>Year: <strong className="text-gray-900">Year {profile.year_of_study}</strong></span>
              </div>
            </div>
          </div>

          <DiscrepancyNotice />

          <div className="mt-6">
             <SkillStateList skills={profile.skills} />
          </div>
        </div>

        <div className="col-span-1">
          <ReadinessGauge percentage={profile.readiness_pct} />
          
          <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-100 flex flex-col items-center text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Next Milestone</h3>
            <p className="text-sm text-blue-700 mb-4">Complete "Python Fundamentals" assessment to boost your readiness by 5%.</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors">
              Go to Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
