import React from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, CheckCircle2, Check, Clock, Lock, BookOpen, Calculator, Database, BrainCircuit, Lightbulb } from 'lucide-react';
import { MilestoneStatus } from './MilestoneCard';

export interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
}

export interface PhaseMilestone {
  id: string;
  skill_id: string;
  title: string;
  description?: string;
  category?: string;
  status: MilestoneStatus;
  assessed_level?: string;
  target_level?: string;
  accuracy?: number;
  milestone_order?: number;
}

export interface Phase {
  id: string;
  phase_number: number;
  title: string;
  description?: string;
  learning_outcome?: string;
  status: MilestoneStatus;
  topics?: string[];
  milestones?: PhaseMilestone[];
  has_decision_point?: boolean;
  selected_branch_id?: string | null;
  selected_option_name?: string | null;
  decision_options?: { branch_id: string; option_id?: string; name: string; description?: string }[];
}

interface RoadmapTimelineProps {
  phases: Phase[];
  onEvidenceClick: (milestoneId: string) => void;
  onDecisionClick: (phase: Phase) => void;
}

const getPhaseIcon = (phaseNumber: number) => {
  switch (phaseNumber) {
    case 1: return <BookOpen className="w-6 h-6" />;
    case 2: return <Calculator className="w-6 h-6" />;
    case 3: return <Database className="w-6 h-6" />;
    case 4: return <BrainCircuit className="w-6 h-6" />;
    default: return <Lightbulb className="w-6 h-6" />;
  }
};

const PhaseCard: React.FC<{
  phase: Phase;
  index: number;
  isLast: boolean;
  onEvidenceClick: (id: string) => void;
  onDecisionClick: (p: Phase) => void;
}> = ({ phase, index: _index, isLast, onEvidenceClick, onDecisionClick }) => {
  const { t } = useTranslation();

  const isCompleted = phase.status === 'COMPLETED' || phase.status === 'FAST_TRACKED';
  const isCurrent = phase.status === 'IN_PROGRESS';
  const isLocked = phase.status === 'LOCKED';

  return (
    <div className="relative flex gap-4 md:gap-6 items-start">
      {/* Timeline spine column (Self-stretching to match card height + vertical spacing) */}
      <div className="relative flex flex-col items-center shrink-0 self-stretch">
        {/* Timeline Node Circle */}
        <div 
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 shrink-0 transition-all duration-300 mt-5 ${
            isCompleted 
              ? 'bg-saffron border-saffron text-white shadow-sm' 
              : isCurrent 
              ? 'bg-white border-saffron text-saffron ring-4 ring-saffron/20 shadow-sm' 
              : 'bg-white border-gray-300 text-gray-400'
          }`}
          title={`Phase ${phase.phase_number}: ${phase.status}`}
        >
          {isCompleted && <Check className="w-4 h-4 text-white stroke-[3px]" />}
          {isCurrent && <div className="w-2.5 h-2.5 bg-saffron rounded-full animate-pulse" />}
          {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
        </div>

        {/* Continuous connector line down to next node */}
        {!isLast && (
          <div 
            className={`w-0.5 flex-1 transition-colors duration-500 my-1.5 ${
              isCompleted ? 'bg-saffron' : 'bg-gray-200'
            }`} 
          />
        )}
      </div>

      {/* Main Phase Card Content */}
      <div className={`flex-1 min-w-0 ${isLast ? 'pb-2' : 'pb-8'}`}>
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          {/* Phase Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#000080]/10 text-[#000080] shrink-0 border border-[#000080]/15">
              {getPhaseIcon(phase.phase_number)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-3 py-0.5 text-xs font-bold tracking-wider text-white bg-[#000080] rounded-full uppercase shadow-2xs">
                  Phase {phase.phase_number}
                </span>
                {phase.status === 'FAST_TRACKED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Fast-tracked via Diagnostic
                  </span>
                )}
                {phase.status === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> {t('roadmap.milestoneStatus.completed', 'Completed')}
                  </span>
                )}
                {phase.status === 'IN_PROGRESS' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-300">
                    <Clock className="w-3.5 h-3.5 text-blue-700" /> {t('roadmap.milestoneStatus.inProgress', 'In Progress')}
                  </span>
                )}
                {phase.status === 'LOCKED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-300">
                    <Lock className="w-3.5 h-3.5 text-gray-500" /> Prerequisite Pending
                  </span>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                {phase.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          {phase.description && (
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
              {phase.description}
            </p>
          )}

          {/* Curriculum Milestones / Topics List */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Curriculum Milestones ({phase.milestones?.length || phase.topics?.length || 0})
              </h4>
              {phase.status === 'IN_PROGRESS' && (
                <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Active Focus Area
                </span>
              )}
            </div>

            {phase.milestones && phase.milestones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {phase.milestones.map((m) => {
                  const isDone = m.status === 'COMPLETED' || m.status === 'FAST_TRACKED';
                  const isActive = m.status === 'IN_PROGRESS';
                  const isLocked = m.status === 'LOCKED';

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : isActive
                          ? 'bg-blue-50/60 border-blue-200 text-blue-950 shadow-xs'
                          : 'bg-gray-50/70 border-gray-200 text-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="shrink-0 mt-0.5">
                            {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {isActive && <Clock className="w-4 h-4 text-blue-600 animate-pulse" />}
                            {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                          </span>
                          <span className={`text-sm font-semibold leading-snug break-words ${
                            isDone ? 'text-emerald-900' : isActive ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {m.title}
                          </span>
                        </div>
                        {m.category && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/5 text-gray-600 shrink-0">
                            {m.category}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2.5 border-t border-black/5">
                        <span className="text-[11px] font-medium opacity-80">
                          {m.status === 'FAST_TRACKED'
                            ? '⭐ Mastered (Fast-Tracked)'
                            : isDone
                            ? '✓ Mastered'
                            : isActive
                            ? '⚡ Unlocked for Learning'
                            : '🔒 Prerequisite Required'}
                        </span>

                        {isActive && (
                          <button
                            type="button"
                            onClick={() => onEvidenceClick(m.skill_id)}
                            className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-blue-700 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            Submit Evidence
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {phase.topics?.map((topic, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-full border text-sm font-medium bg-gray-50 border-gray-200 text-gray-700">
                    {topic}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning Outcome */}
          {phase.learning_outcome && (
            <div className="bg-[#000080]/5 rounded-xl p-4 md:p-5 border border-[#000080]/10 mb-4">
              <h5 className="text-xs font-bold text-[#000080] uppercase tracking-wider mb-1.5">
                {t('roadmap.viewOutcome', 'What you will learn')}
              </h5>
              <p className="text-sm text-gray-700 leading-relaxed">{phase.learning_outcome}</p>
            </div>
          )}

          {/* Selected Specialization Notice */}
          {phase.selected_option_name && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Specialization Selected: {phase.selected_option_name}</span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
                Active Track
              </span>
            </div>
          )}

          {/* Branch Decision Point Required */}
          {phase.has_decision_point && !phase.selected_option_name && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-300/80 p-6 rounded-xl text-center">
              <div className="w-12 h-12 rounded-xl bg-saffron/15 text-saffron flex items-center justify-center mx-auto mb-3 border border-saffron/30 shadow-xs">
                <GitBranch className="w-6 h-6 text-saffron" />
              </div>
              <h5 className="font-bold text-gray-900 mb-1.5 text-base md:text-lg">
                {t('roadmap.chooseTrack', 'Branch Decision Required')}
              </h5>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                Choose your specialization to calibrate the advanced milestones in your learning trajectory.
              </p>
              <button 
                type="button"
                onClick={() => onDecisionClick(phase)}
                className="btn-saffron px-5 py-2 rounded-xl font-bold transition-all shadow-xs text-sm cursor-pointer inline-flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                {t('roadmap.chooseTrack', 'Choose Track')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ phases, onEvidenceClick, onDecisionClick }) => {
  return (
    <div className="py-2">
      {phases.map((phase, index) => (
        <PhaseCard 
          key={phase.id}
          phase={phase} 
          index={index} 
          isLast={index === phases.length - 1}
          onEvidenceClick={onEvidenceClick} 
          onDecisionClick={onDecisionClick} 
        />
      ))}
    </div>
  );
};
