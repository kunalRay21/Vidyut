import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Opportunity } from './types'; // We'll define a shared types file or inline it

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewExplanation: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onViewExplanation }) => {
  const { t } = useTranslation();
  const scorePct = Math.round(opportunity.compatibility_score * 100);
  
  // Badge styling based on source
  let sourceBadgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  if (opportunity.source === 'UNSTOP') sourceBadgeStyle = "bg-blue-100 text-blue-700 border-blue-200";
  if (opportunity.source === 'INTERNSHALA') sourceBadgeStyle = "bg-cyan-100 text-cyan-700 border-cyan-200";
  if (opportunity.source === 'AICTE') sourceBadgeStyle = "bg-orange-100 text-orange-700 border-orange-200";

  let modeBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (opportunity.mode === 'HYBRID') modeBadgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
  if (opportunity.mode === 'ON_SITE') modeBadgeStyle = "bg-amber-50 text-amber-700 border-amber-200";

  const matchingSkills = opportunity.explanation?.matching_skills || [];

  return (
    <div className="bg-[#FFFFED] border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-md border ${sourceBadgeStyle}`}>
              {opportunity.source || 'DIRECT'}
            </span>
            {opportunity.mode && (
              <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-md border ${modeBadgeStyle}`}>
                {opportunity.mode}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
            <span className="font-bold text-xs">{scorePct}% {t('opportunities.matchScore', 'Match')}</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{opportunity.title}</h3>
        <p className="text-gray-600 text-xs font-medium mb-3">{opportunity.organization}</p>

        <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-white/60 p-2.5 rounded-lg border border-gray-100">
          {opportunity.stipend && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Stipend / Prize:</span>
              <span className="font-semibold text-gray-800">{opportunity.stipend}</span>
            </div>
          )}
          {opportunity.location && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Location:</span>
              <span className="font-medium text-gray-700 truncate max-w-[160px]">{opportunity.location}</span>
            </div>
          )}
          {opportunity.deadline && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Deadline:</span>
              <span className="font-medium text-gray-700">{opportunity.deadline}</span>
            </div>
          )}
        </div>

        {matchingSkills.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">Matched Canonical Skills:</span>
            <div className="flex flex-wrap gap-1">
              {matchingSkills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                  ✓ {skill}
                </span>
              ))}
              {matchingSkills.length > 4 && (
                <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  +{matchingSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button 
          onClick={() => onViewExplanation(opportunity)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t('opportunities.viewMatchReasoning', 'AI Explanation')}
        </button>
        <a 
          href={opportunity.original_url || '#'} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer"
        >
          {t('opportunities.applyNow', 'Apply Now')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};


