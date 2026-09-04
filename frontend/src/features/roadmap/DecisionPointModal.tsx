import React from 'react';
import { GitBranch, X } from 'lucide-react';

interface DecisionOption {
  branch_id: string;
  name: string;
}

interface DecisionPointModalProps {
  isOpen: boolean;
  phaseTitle: string;
  options: DecisionOption[];
  onClose: () => void;
  onSelect: (branchId: string) => void;
}

export const DecisionPointModal: React.FC<DecisionPointModalProps> = ({ 
  isOpen, phaseTitle, options, onClose, onSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFEF2] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#EAE3B3]">
        <div className="p-6 text-center border-b border-[#EAE3B3] relative">
          <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-saffron/15 text-saffron-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-saffron/30 shadow-sm">
            <GitBranch className="w-7 h-7 text-saffron" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-heading">Branch Decision Required</h2>
          <p className="text-gray-600 text-sm mt-2">
            You've reached <strong className="text-gray-900">{phaseTitle}</strong>. Select your specialized path to dynamically update your curriculum.
          </p>
        </div>
        
        <div className="p-6 bg-[#FFFEF2] flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.branch_id}
              onClick={() => onSelect(opt.branch_id)}
              className="group flex items-center justify-between p-4 bg-white border border-[#EAE3B3] rounded-xl hover:border-saffron hover:shadow-md transition-all text-left"
            >
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-saffron transition-colors">{opt.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Select this path to dynamically adjust your upcoming learning milestones for {opt.name}.</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-saffron/10 flex items-center justify-center text-saffron group-hover:bg-saffron group-hover:text-white transition-all shrink-0 ml-3 font-bold">
                →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


