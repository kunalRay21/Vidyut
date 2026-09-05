import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TalentPoolTable } from '../features/industry/components/TalentPoolTable';
import { PostedOpportunitiesList } from '../features/industry/components/PostedOpportunitiesList';
import { Link } from 'react-router-dom';
import { Users, FilePlus, Briefcase, Award, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { FadeIn } from '../components/animations/FadeIn';

export const IndustryTalentPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'TALENT' | 'POSTED_OPPS'>('TALENT');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <FadeIn delay={100}>
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bangalore Analytics Co. • Employer Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-heading">
              {t('industry.title', 'Industry Recruiter Portal')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {t('industry.subtitle', 'Connect directly with skill-verified candidates and manage your direct institutional job postings.')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/industry/post-opportunity"
              className="flex items-center gap-2 bg-saffron hover:bg-saffron-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>{t('industry.postOpportunity', 'Post Opportunity')}</span>
            </Link>
          </div>
        </header>
      </FadeIn>

      {/* Top Metric Telemetry Cards */}
      <FadeIn delay={150}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Postings</span>
              <Briefcase className="w-4 h-4 text-saffron" />
            </div>
            <p className="text-2xl font-extrabold text-gray-950 mt-1">6</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Live direct postings</p>
          </div>

          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Verified Talent (≥70%)</span>
              <ShieldCheck className="w-4 h-4 text-[#000080]" />
            </div>
            <p className="text-2xl font-extrabold text-[#000080] mt-1">8</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Pre-calibrated candidates</p>
          </div>

          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Avg Cohort Score</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">87%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Assessed readiness level</p>
          </div>

          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Applications Pipeline</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">92</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Applicants across roles</p>
          </div>
        </div>
      </FadeIn>

      {/* Navigation Tabs */}
      <FadeIn delay={200}>
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('TALENT')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'TALENT'
                ? 'border-saffron text-saffron-700 bg-saffron-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Verified Talent Pool (8 Matches)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('POSTED_OPPS')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'POSTED_OPPS'
                ? 'border-saffron text-saffron-700 bg-saffron-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Our Posted Opportunities (6 Roles)</span>
          </button>
        </div>
      </FadeIn>

      {/* Tab Content */}
      <FadeIn delay={250}>
        {activeTab === 'TALENT' ? (
          <TalentPoolTable />
        ) : (
          <PostedOpportunitiesList onSelectRoleFilter={() => setActiveTab('TALENT')} />
        )}
      </FadeIn>
    </div>
  );
};


