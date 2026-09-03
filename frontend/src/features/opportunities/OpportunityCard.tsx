import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Opportunity } from './types'; // We'll define a shared types file or inline it

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewExplanation: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onViewExplanation }) => {
  const scorePct = Math.round(opportunity.compatibility_score * 100);
  
  // Badge styling based on source
  let sourceBadgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  if (opportunity.source === 'UNSTOP') sourceBadgeStyle = "bg-blue-100 text-blue-700 border-blue-200";
  if (opportunity.source === 'INTERNSHALA') sourceBadgeStyle = "bg-cyan-100 text-cyan-700 border-cyan-200";
  if (opportunity.source === 'AICTE') sourceBadgeStyle = "bg-orange-100 text-orange-700 border-orange-200";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-md border ${sourceBadgeStyle} mb-2 inline-block`}>
            {opportunity.source || 'DIRECT'}
          </span>
          <h3 className="text-lg font-bold text-gray-900">{opportunity.title}</h3>
          <p className="text-gray-500 text-sm font-medium">{opportunity.organization}</p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
            <span className="font-bold text-sm">{scorePct}% Match</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-6">
        <button 
          onClick={() => onViewExplanation(opportunity)}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          AI Explanation
        </button>
        <a 
          href={opportunity.original_url || '#'} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg font-medium text-sm transition-colors"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
