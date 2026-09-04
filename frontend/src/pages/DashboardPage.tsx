import React from 'react';
import { MOCK_STUDENT_PROFILE } from '../mocks/studentSessionMock';
import { ReadinessGauge } from '../features/dashboard/ReadinessGauge';
import { SkillStateList } from '../features/dashboard/SkillStateList';
import { DiscrepancyNotice } from '../features/dashboard/DiscrepancyNotice';
import { User, BookOpen, Target, GraduationCap } from 'lucide-react';
import { FadeIn } from '../components/animations/FadeIn';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const profile = MOCK_STUDENT_PROFILE;
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <FadeIn delay={100}>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back, {profile.full_name}</p>
        </header>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          {/* Profile Overview Card */}
          <FadeIn delay={200}>
            <div className="bg-[#FFFEF2] rounded-2xl shadow-sm border border-[#EAE3B3] p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 font-heading">Career Goal Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-saffron/10 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-saffron" />
                  </div>
                  <span className="text-sm">Target Role: <strong className="text-gray-900">{profile.selected_role}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-[#000080]/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#000080]" />
                  </div>
                  <span className="text-sm">Institution: <strong className="text-gray-900">{profile.institution}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-indiaGreen/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-indiaGreen" />
                  </div>
                  <span className="text-sm">Degree: <strong className="text-gray-900">{profile.degree}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">Year: <strong className="text-gray-900">Year {profile.year_of_study}</strong></span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <DiscrepancyNotice />
          </FadeIn>

          <FadeIn delay={400}>
            <div className="mt-6">
               <SkillStateList skills={profile.skills} />
            </div>
          </FadeIn>
        </div>

        <div className="col-span-1">
          <FadeIn delay={200}>
            <ReadinessGauge percentage={profile.readiness_pct} />
          </FadeIn>
          
          <FadeIn delay={300}>
            <div className="mt-6 bg-[#FFFEF2] rounded-2xl p-6 border border-[#EAE3B3] flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-[#000080] to-indiaGreen" />
              <h3 className="font-bold text-[#000080] mb-2 font-heading">Next Milestone</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Complete "Python Fundamentals" assessment to boost your readiness by 5%.
              </p>
              <button 
                onClick={() => navigate('/roadmap')}
                className="w-full btn-saffron py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm transition"
              >
                Go to Roadmap
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};


