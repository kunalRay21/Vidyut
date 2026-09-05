import React from 'react';
import { CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Skill {
  name: string;
  progress: number;
  currentLevel: number;
  category?: string;
  source?: 'ASSESSMENT' | 'RESUME' | 'GAP' | 'BASELINE';
  evidence?: string;
}

interface SkillProgressCardProps {
  skill: Skill;
}

const TIER_META = {
  1: { label: 'Foundation', color: '#64748B', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  2: { label: 'Developing', color: '#D97706', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  3: { label: 'Proficient', color: '#000080', bg: 'bg-blue-50', text: 'text-[#000080]', border: 'border-blue-200' },
  4: { label: 'Expert', color: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ skill }) => {
  const navigate = useNavigate();
  const level = (Math.max(1, Math.min(4, skill.currentLevel || 1))) as 1 | 2 | 3 | 4;
  const meta = TIER_META[level];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3">
      <div>
        {/* Header: Category & Source */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
            {skill.category || 'Core Skill'}
          </span>
          {skill.source === 'ASSESSMENT' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Test Verified
            </span>
          ) : skill.source === 'RESUME' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#000080] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <FileText className="w-3 h-3" /> Resume Evidence
            </span>
          ) : skill.source === 'GAP' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
              <AlertTriangle className="w-3 h-3" /> Target Gap
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-500">
              Academic Baseline
            </span>
          )}
        </div>

        {/* Skill Name & Score */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-base font-bold text-gray-900 leading-snug">
            {skill.name}
          </h4>
          <span
            className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold"
            style={{
              backgroundColor: `${meta.color}15`,
              color: meta.color,
              border: `1px solid ${meta.color}35`,
            }}
          >
            {skill.progress}%
          </span>
        </div>

        <p className="text-[11px] text-gray-500 mt-1">
          {meta.label} Stage • {skill.evidence || `${skill.progress}% calibrated readiness`}
        </p>
      </div>

      {/* 4-Step Milestone Progression */}
      <div className="space-y-1.5 pt-2 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((step) => {
            const isComplete = level >= step;
            return (
              <div key={step} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isComplete ? '' : 'bg-slate-100'
                  }`}
                  style={{
                    backgroundColor: isComplete ? meta.color : undefined,
                  }}
                />
                <span
                  className={`block text-[9px] text-center font-bold truncate ${
                    isComplete ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  {step === 1 ? 'Found.' : step === 2 ? 'Devel.' : step === 3 ? 'Profic.' : 'Expert'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-gray-400">
            Stage {level} of 4 Complete
          </span>
          <button
            onClick={() => navigate('/assessment/quiz')}
            className="text-[11px] font-bold text-[#000080] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>Calibrate</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
