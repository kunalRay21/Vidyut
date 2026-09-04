import React from 'react';
import { CheckCircle2, Clock, Upload, Lock } from 'lucide-react';

export type MilestoneStatus = 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'FAST_TRACKED';

interface MilestoneCardProps {
  id: string;
  title: string;
  status: MilestoneStatus;
  onEvidenceSubmit?: (id: string) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ id, title, status, onEvidenceSubmit }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'COMPLETED':
      case 'FAST_TRACKED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'COMPLETED':
      case 'FAST_TRACKED': return 'border-green-200 bg-green-50';
      case 'IN_PROGRESS': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-[#FFFFED] opacity-75';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBorderColor()} flex items-center justify-between mb-3 shadow-sm`}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className={`font-medium ${status === 'LOCKED' ? 'text-gray-500' : 'text-gray-800'}`}>
          {title}
          {status === 'FAST_TRACKED' && (
            <span className="ml-2 text-sm font-normal text-green-700 opacity-80">— Already Proficient / Fast-tracked</span>
          )}
        </span>
      </div>
      
      {status === 'IN_PROGRESS' && onEvidenceSubmit && (
        <button 
          onClick={() => onEvidenceSubmit(id)}
          className="flex items-center gap-2 text-sm bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Submit Evidence
        </button>
      )}
    </div>
  );
};


