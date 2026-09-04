import React from 'react';
import { FadeIn } from '../../components/animations/FadeIn';
import { Users, TrendingUp, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

const InstitutionDashboardPage: React.FC = () => {
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
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <FadeIn delay={100}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#000080] text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
            Institution Analytics Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-heading">
            VIT Chennai - School of Computer Science
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            AISHE Code: C-36944 · 2026 Batch Readiness & Curriculum Gap Heatmap
          </p>
        </div>
      </FadeIn>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FadeIn delay={150}>
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#000080] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enrolled</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-0.5">{metrics.totalStudents}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Readiness</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-0.5">{metrics.averageReadiness}%</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={250}>
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ready Now</p>
              <p className="text-3xl font-extrabold text-green-700 mt-0.5">{metrics.readyNow}%</p>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Cohort Distribution */}
      <FadeIn delay={300}>
        <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 font-heading mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#000080]" />
            Cohort Placement Readiness Distribution
          </h2>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-green-700">Ready Now (Skill Score ≥ 75%)</span>
                <span className="font-bold text-gray-900">{metrics.readyNow}% of cohort</span>
              </div>
              <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: `${metrics.readyNow}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-amber-700">Almost Ready (Skill Score 50–74%)</span>
                <span className="font-bold text-gray-900">{metrics.almostReady}% of cohort</span>
              </div>
              <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.almostReady}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-red-700">Needs Foundation Work (Skill Score &lt; 50%)</span>
                <span className="font-bold text-gray-900">{metrics.needsFoundation}% of cohort</span>
              </div>
              <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${metrics.needsFoundation}%` }} />
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Top Curriculum Gaps */}
      <FadeIn delay={350}>
        <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-heading flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-saffron" />
              Identified Curriculum Gaps vs. Industry Demand
            </h2>
            <span className="text-xs font-semibold text-gray-500">Live AICTE/Industry Target</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {curriculumGaps.map((gap) => (
              <div
                key={gap.skill}
                className="bg-white border border-[#EAE3B3] rounded-xl p-5 shadow-xs"
              >
                <h3 className="font-bold text-gray-900 text-sm mb-3">{gap.skill}</h3>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Student Avg:</span>
                    <strong className="text-gray-900">{gap.studentAverage}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Industry Benchmark:</span>
                    <strong className="text-gray-900">{gap.industryTarget}%</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-red-600">
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
  );
};

export default InstitutionDashboardPage;
