import React from 'react';
import { Maximize2, Minimize2, UserCheck, Activity } from 'lucide-react';
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
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Tricolor Official Top Ribbon */}
      <div className="gov-tricolor-banner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Test Mode */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center shadow-xs flex-shrink-0">
            <span className="text-amber-400 font-black text-base">⚡</span>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">VIDYUT</span>
              <span className="gov-badge-chakra text-[10px] py-0.5 px-2">DIAGNOSTIC EXAM</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              {testTitle}
            </p>
          </div>
        </div>

        {/* Center: Proctoring Active Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Integrity Guard Active</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Right: Candidate Alias, Timer, Fullscreen, Finish */}
        <div className="flex items-center gap-3">
          {/* Candidate Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{candidateAlias}</span>
          </div>

          {/* Countdown Timer */}
          <ExamTimer
            formattedTime={formattedTime}
            isWarning={isWarning}
            isUrgent={isUrgent}
          />

          {/* Fullscreen Button */}
          <button
            onClick={onRequestFullscreen}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Submit Test Button */}
          <button
            onClick={onOpenSubmitModal}
            className="btn-saffron text-xs font-semibold py-2 px-4 shadow-xs"
          >
            End Test
          </button>
        </div>
      </div>
    </header>
  );
};
