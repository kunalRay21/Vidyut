import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

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
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold tracking-wider text-sm transition-colors ${
        isUrgent
          ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
          : isWarning
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : 'bg-slate-100 text-slate-800 border-slate-300'
      }`}
      title="Remaining Examination Time"
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-red-600" />
      ) : (
        <Clock className={`w-4 h-4 ${isWarning ? 'text-amber-700' : 'text-slate-600'}`} />
      )}
      <span className="text-[11px] uppercase text-slate-500 font-sans font-semibold">Time:</span>
      <span className="text-sm font-semibold">{formattedTime}</span>
    </div>
  );
};
