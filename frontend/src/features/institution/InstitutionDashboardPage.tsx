import React from 'react';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '../../components/animations/FadeIn';
import { Users, TrendingUp, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { JobMarketInsights } from './components/JobMarketInsights';

const InstitutionDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const metrics = {
    totalStudents: 420,
    averageReadiness: 54.2,
    readyNow: 22,
    almostReady: 48,
    needsFoundation: 30,
  };

  const curriculumGaps = [
    {
      skill: 'Docker & Containerization',
      studentAverage: 24,
      industryTarget: 70,
    },
    {
      skill: 'API Testing & Postman',
      studentAverage: 38,
      industryTarget: 75,
    },
    {
      skill: 'Relational SQL Optimization',
      studentAverage: 44,
      industryTarget: 80,
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col xl:flex-row gap-8 items-start">
      
      {/* LEFT COLUMN: Main Dashboard */}
      <div className="flex-1 space-y-5 min-w-0 w-full">
        {/* Header */}
        <FadeIn delay={100}>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#000080] text-[10px] font-bold uppercase tracking-wider mb-2 border border-blue-200">
              {t('institution.badge', 'Institution Analytics Dashboard')}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">
              VIT Chennai - School of Computer Science
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              AISHE Code: C-36944 · 2026 Batch Readiness & Curriculum Gap Heatmap
            </p>
          </div>
        </FadeIn>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FadeIn delay={150}>
            <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#000080] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('institution.totalEnrolled')}</p>
                <p className="text-2xl font-extrabold text-gray-900">{metrics.totalStudents}</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('institution.avgReadiness')}</p>
                <p className="text-2xl font-extrabold text-amber-600">{metrics.averageReadiness}%</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={250}>
            <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('institution.readyNow')}</p>
                <p className="text-2xl font-extrabold text-green-700">{metrics.readyNow}%</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Cohort Distribution */}
        <FadeIn delay={300}>
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 font-heading mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#000080]" />
              {t('institution.cohortTitle')}
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-green-700">{t('institution.readyNow', 'Ready Now')} (Skill Score ≥ 75%)</span>
                  <span className="font-bold text-gray-900">{metrics.readyNow}% of cohort</span>
                </div>
                <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: `${metrics.readyNow}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-amber-700">Almost Ready (Skill Score 50–74%)</span>
                  <span className="font-bold text-gray-900">{metrics.almostReady}% of cohort</span>
                </div>
                <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.almostReady}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-red-700">Needs Foundation Work (Skill Score &lt; 50%)</span>
                  <span className="font-bold text-gray-900">{metrics.needsFoundation}% of cohort</span>
                </div>
                <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${metrics.needsFoundation}%` }} />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Top Curriculum Gaps */}
        <FadeIn delay={350}>
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 font-heading flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-saffron" />
                {t('institution.curriculumGapTitle')}
              </h2>
              <span className="text-[10px] font-bold uppercase text-gray-500">Live AICTE/Industry Target</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {curriculumGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="bg-white border border-[#EAE3B3] rounded-lg p-4 shadow-xs"
                >
                  <h3 className="font-bold text-gray-900 text-xs mb-2 truncate">{gap.skill}</h3>
                  <div className="space-y-1.5 text-[11px] text-gray-600">
                    <div className="flex justify-between">
                      <span>Student Avg:</span>
                      <strong className="text-gray-900">{gap.studentAverage}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Industry Benchmark:</span>
                      <strong className="text-gray-900">{gap.industryTarget}%</strong>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-100 text-red-600">
                      <span className="font-semibold">Curriculum Gap:</span>
                      <strong className="font-bold">-{gap.industryTarget - gap.studentAverage}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* RIGHT COLUMN: Job Market & Placement Insights */}
      <aside className="w-full xl:w-[400px] 2xl:w-[450px] shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
        <FadeIn delay={400} className="h-full">
          <JobMarketInsights />
        </FadeIn>
      </aside>

    </div>
  );
};

export default InstitutionDashboardPage;
