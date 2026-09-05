import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, DollarSign, CheckCircle2, Users, PlusCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { industryApi } from '../../../services/api';
import { MOCK_INDUSTRY_DATA } from '../mocks/industryMockData';

interface PostedOpportunity {
  id: string;
  title: string;
  organization?: string;
  type: string;
  mode: string;
  location?: string;
  deadline?: string;
  stipend?: string;
  status: string;
  applicants_ready_count: number;
  total_applicants?: number;
  description_raw?: string;
  required_skills: Array<{ name: string; min_proficiency?: string }>;
}

interface PostedOpportunitiesListProps {
  onSelectRoleFilter?: (roleTitle: string) => void;
}

export const PostedOpportunitiesList: React.FC<PostedOpportunitiesListProps> = ({ onSelectRoleFilter }) => {
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState<PostedOpportunity[]>(MOCK_INDUSTRY_DATA.posted_opportunities);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const res = await industryApi.getPostedOpportunities();
        if (mounted && res.success && Array.isArray(res.data?.posted_opportunities) && res.data.posted_opportunities.length > 0) {
          setOpportunities(res.data.posted_opportunities);
        }
      } catch (err) {
        console.warn('Failed to fetch employer posted opportunities:', err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-heading flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#B85C16]" />
            <span>{t('industry.postedOpportunities', 'Active Employer Postings')}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Directly published opportunities visible to calibrated Vidyut student talent and your recruiting dashboard.
          </p>
        </div>
        <Link
          to="/industry/post-opportunity"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-saffron hover:bg-saffron-600 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-saffron/40 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Header: Title + Type & Mode Badges */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-saffron-50 text-saffron-700 border border-saffron-200/60 uppercase tracking-wider">
                      {opp.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {opp.mode}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    {opp.organization || 'Bangalore Analytics Co.'}
                  </p>
                </div>
              </div>

              {/* Meta: Location, Stipend, Deadline */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 my-2 border-y border-gray-100 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{opp.location || 'Bengaluru'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 truncate">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{opp.stipend || 'Competitive'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate col-span-2 sm:col-span-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{opp.deadline || '2026-11-30'}</span>
                </div>
              </div>

              {/* Verified Applicant Benchmarks */}
              <div className="my-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#000080]/10 text-[#000080] flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#000080]">
                      {opp.applicants_ready_count} Verified Candidates
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Surpassed 70%+ Readiness Benchmark
                    </p>
                  </div>
                </div>
                {opp.total_applicants && (
                  <span className="text-[11px] font-semibold text-gray-500">
                    {opp.total_applicants} in pipeline
                  </span>
                )}
              </div>

              {/* Required Skills */}
              <div className="mt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Calibrated Skill Requirements
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opp.required_skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200"
                    >
                      <CheckCircle2 className="w-3 h-3 text-saffron" />
                      <span>{skill.name}</span>
                      {skill.min_proficiency && (
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          ({skill.min_proficiency.slice(0, 3)})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectRoleFilter && onSelectRoleFilter(opp.title)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#000080] hover:text-blue-800 transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Review Matched Talent ({opp.applicants_ready_count})</span>
              </button>

              <Link
                to="/opportunities"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-700 transition"
              >
                <span>Live View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
