import React from 'react';
import { Maximize2, Minimize2, UserCheck, ShieldCheck } from 'lucide-react';
import { ExamTimer } from './ExamTimer';

interface ExamNavbarProps {
  testTitle: string;
  candidateAlias: string;
  formattedTime: string;
  isWarning: boolean;
  isUrgent: boolean;
  isFullscreen: boolean;
  onRequestFullscreen: () => void;
  onOpenSubmitModal: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

export const ExamNavbar: React.FC<ExamNavbarProps> = ({
  testTitle,
  candidateAlias,
  formattedTime,
  isWarning,
  isUrgent,
  isFullscreen,
  onRequestFullscreen,
  onOpenSubmitModal,
  currentQuestionNumber,
  totalQuestions,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between z-20 flex-shrink-0 select-none">
      {/* Left: Branding + Test Title + Question Indicator */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-blue-900 flex items-center justify-center text-amber-400 font-extrabold text-sm shadow-xs">
            ⚡
          </div>
          <span className="font-heading font-black text-slate-900 tracking-tight text-sm sm:text-base">
            VIDYUT
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block flex-shrink-0" />

        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-semibold text-slate-700 truncate hidden md:inline">
            {testTitle}
          </span>
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md font-medium border border-slate-200">
            Q{currentQuestionNumber} of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Center: Proctoring Active Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-medium text-[11px]">Proctored Session</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {/* Right: Candidate Alias, Timer, Fullscreen, Finish */}
      <div className="flex items-center gap-3">
        {/* Candidate Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>{candidateAlias}</span>
        </div>

        {/* Countdown Timer */}
        <ExamTimer
          formattedTime={formattedTime}
          isWarning={isWarning}
          isUrgent={isUrgent}
        />

        {/* Fullscreen Toggle */}
        <button
          onClick={onRequestFullscreen}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* End Test Button (Refined, professional button) */}
        <button
          onClick={onOpenSubmitModal}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-md text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
        >
          Finish Test
        </button>
      </div>
    </header>
  );
};
