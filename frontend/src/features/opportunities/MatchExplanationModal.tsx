import React from 'react';
import { X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Opportunity } from './types';
import { FadeIn } from '../../components/animations/FadeIn';

interface MatchExplanationModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({ opportunity, isOpen, onClose }) => {
  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <FadeIn className="bg-[#FFFFED] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 w-full">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
          <div className="flex items-center gap-2 text-indigo-800">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">AI Match Analysis</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-1">{opportunity.title}</h4>
          <p className="text-gray-500 text-sm mb-4">{opportunity.organization}</p>
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-900 mb-6 leading-relaxed">
            {opportunity.explanation.summary}
          </div>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Matching Skills (Verified)
              </h5>
              <div className="flex flex-wrap gap-2">
                {opportunity.explanation.matching_skills.map(skill => (
                  <span key={skill} className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-green-200">
                    {skill}
                  </span>
                ))}
                {opportunity.explanation.matching_skills.length === 0 && (
                  <span className="text-xs text-gray-400 italic">None verified yet.</span>
                )}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Gap Skills (Missing or In-Progress)
              </h5>
              <div className="flex flex-wrap gap-2">
                {opportunity.explanation.gap_skills.map(skill => (
                  <span key={skill} className="bg-orange-50 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-orange-200">
                    {skill}
                  </span>
                ))}
                {opportunity.explanation.gap_skills.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No gaps identified!</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-[#FFFFED] border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Close Analysis
          </button>
        </div>
      </FadeIn>
    </div>
  );
};


