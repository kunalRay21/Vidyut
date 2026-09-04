import React from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_INDUSTRY_DATA } from '../mocks/industryMockData';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export const TalentPoolTable: React.FC = () => {
  const { t } = useTranslation();
  const candidates = MOCK_INDUSTRY_DATA.matched_talent_pool;

  return (
    <div className="bg-[#FFFFED] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FFFFED]">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('industry.talentSearch', 'Anonymized Talent Pool')}</h2>
          <p className="text-gray-500 text-sm mt-1">Showing verified candidates matching your minimum readiness threshold (70%+).</p>
        </div>
        <div className="bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-lg text-sm border border-green-200">
          {candidates.length} {t('industry.matchCandidates', 'Verified Matches')}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-[#FFFFED] text-xs uppercase text-gray-700 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4">Candidate Alias & Details</th>
              <th scope="col" className="px-6 py-4">{t('dashboard.targetRole', 'Target Role')}</th>
              <th scope="col" className="px-6 py-4 text-center">{t('industry.verifiedScore', 'Readiness Score')}</th>
              <th scope="col" className="px-6 py-4">Verified Skills</th>
              <th scope="col" className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => (
              <tr key={i} className="bg-[#FFFFED] border-b hover:bg-[#F0F2BD]">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                    #{c.candidate_alias.match(/#(\d+)/)?.[1] || 'C'}
                  </div>
                  <div>
                    <div className="font-semibold">{c.candidate_alias}</div>
                    <div className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3 h-3" />
                      {c.status}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{c.role_target}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold border border-indigo-100">
                    {c.readiness_score}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {c.verified_skills.map(skill => (
                      <span key={skill} className="bg-gray-100 border border-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md font-medium text-xs transition-colors">
                    Request Reveal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


