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
      <div className="bg-[#FFFFED] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="p-6 text-center border-b border-gray-50 relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Branch Decision Required</h2>
          <p className="text-gray-500 mt-2">
            You've reached <strong>{phaseTitle}</strong>. It's time to specialize your roadmap.
          </p>
        </div>
        
        <div className="p-6 bg-[#FFFFED] flex flex-col gap-4">
          {options.map((opt) => (
            <button
              key={opt.branch_id}
              onClick={() => onSelect(opt.branch_id)}
              className="group flex items-center justify-between p-4 bg-[#FFFFED] border border-gray-200 rounded-lg hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">{opt.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Select this path to dynamically adjust your upcoming milestones for {opt.name}.</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


