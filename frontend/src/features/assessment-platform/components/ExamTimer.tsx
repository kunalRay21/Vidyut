import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface ExamTimerProps {
  formattedTime: string;
  isWarning: boolean;
  isUrgent: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  formattedTime,
  isWarning,
  isUrgent,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs font-semibold tracking-wider transition-colors ${
        isUrgent
          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
          : isWarning
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : 'bg-slate-50 text-slate-700 border-slate-200'
      }`}
      title="Remaining Examination Time"
    >
      {isUrgent ? (
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
      ) : (
        <Clock className={`w-3.5 h-3.5 ${isWarning ? 'text-amber-600' : 'text-slate-400'}`} />
      )}
      <span className="font-semibold text-xs text-slate-800">{formattedTime}</span>
    </div>
  );
};
