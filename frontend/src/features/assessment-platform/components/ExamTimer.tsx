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
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold tracking-wider text-sm transition-all duration-300 shadow-sm ${
        isUrgent
          ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse shadow-red-500/20'
          : isWarning
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-[#172540] text-emerald-400 border-[#1F3152]'
      }`}
      title="Remaining Examination Time"
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
      ) : (
        <Clock className={`w-4 h-4 ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
      )}
      <span className="text-xs uppercase text-slate-400 font-sans font-semibold mr-0.5">Time:</span>
      <span className="text-base">{formattedTime}</span>
    </div>
  );
};
