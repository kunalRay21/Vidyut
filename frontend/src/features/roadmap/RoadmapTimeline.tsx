import React, { useEffect, useRef, useState } from 'react';
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
  isTimelineReached: boolean;
  isLast: boolean;
  onEvidenceClick: (id: string) => void;
  onDecisionClick: (p: Phase) => void;
}> = ({ phase, index: _index, isTimelineReached, isLast, onEvidenceClick, onDecisionClick }) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isCompleted = phase.status === 'COMPLETED' || phase.status === 'FAST_TRACKED';
  const isCurrent = phase.status === 'IN_PROGRESS';
  
  const showAsCompleted = isCompleted && isTimelineReached;
  const showAsCurrent = isCurrent && isTimelineReached;

  return (
    <div className="relative pl-10 md:pl-12">
      {/* Connecting vertical line for timeline (Background) */}
      {!isLast && (
        <div className="absolute left-[11px] top-9 w-0.5 h-[calc(100%+2rem)] bg-[#EAE3B3] z-0" />
      )}
      
      {/* Connecting vertical line for timeline (Foreground Progress) */}
      {!isLast && (
        <div 
          className="absolute left-[11px] top-9 w-0.5 h-[calc(100%+2rem)] bg-[#FF9933] z-0 origin-top transition-transform duration-500 ease-linear"
          style={{ transform: showAsCompleted ? 'scaleY(1)' : 'scaleY(0)' }}
        />
      )}

      {/* Timeline Node */}
      <div className={`absolute left-0 top-6 w-6 h-6 rounded-full border-[3px] shadow-sm z-20 flex items-center justify-center transition-all duration-300 ${
        showAsCompleted ? 'bg-[#FF9933] border-[#FF9933] scale-110' :
        showAsCurrent ? 'bg-[#FFFEF2] border-[#FF9933] scale-110' :
        'bg-[#FFFEF2] border-[#EAE3B3] scale-100'
      }`}>
        {showAsCompleted && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
        {showAsCurrent && <div className="w-2 h-2 bg-[#FF9933] rounded-full animate-pulse" />}
      </div>

      <div 
        ref={cardRef}
        className={`bg-[#FFFEF2] relative z-10 rounded-2xl border border-[#EAE3B3] p-6 md:p-8 shadow-sm transition-all duration-700 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#000080]/10 text-[#000080] shrink-0">
            {getPhaseIcon(phase.phase_number)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-white bg-[#000080] rounded-full uppercase shadow-sm">
                Phase {phase.phase_number}
              </span>
              {phase.status === 'FAST_TRACKED' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Fast-tracked via Diagnostic
                </span>
              )}
              {phase.status === 'COMPLETED' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> {t('roadmap.milestoneStatus.completed', 'Completed')}
                </span>
              )}
              {phase.status === 'IN_PROGRESS' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                  <Clock className="w-3.5 h-3.5 text-blue-700" /> {t('roadmap.milestoneStatus.inProgress', 'In Progress')}
                </span>
              )}
              {phase.status === 'LOCKED' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-300">
                  <Lock className="w-3.5 h-3.5 text-gray-500" /> Prerequisite Pending
                </span>
              )}
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {phase.title}
            </h4>
          </div>
        </div>

        {/* Description */}
        {phase.description && (
          <p className="text-gray-600 leading-relaxed mb-6">
            {phase.description}
          </p>
        )}

        {/* Milestones / Topics List */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Curriculum Milestones ({phase.milestones?.length || phase.topics?.length || 0})
            </h5>
            {phase.status === 'IN_PROGRESS' && (
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Active Focus Area
              </span>
            )}
          </div>

          {phase.milestones && phase.milestones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phase.milestones.map((m) => {
                const isDone = m.status === 'COMPLETED' || m.status === 'FAST_TRACKED';
                const isActive = m.status === 'IN_PROGRESS';
                const isLocked = m.status === 'LOCKED';

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                        : isActive
                        ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-xs'
                        : 'bg-white/60 border-[#EAE3B3] text-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isActive && <Clock className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />}
                        {isLocked && <Lock className="w-4 h-4 text-gray-400 shrink-0" />}
                        <span className={`text-sm font-bold ${isDone ? 'text-emerald-900' : isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                          {m.title}
                        </span>
                      </div>
                      {m.category && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/5 text-gray-600 shrink-0">
                          {m.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs mt-1 pt-2 border-t border-black/5">
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
                          onClick={() => onEvidenceClick(m.skill_id)}
                          className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-blue-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
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
          <div 
            className={`bg-[#000080]/5 rounded-xl p-5 border border-[#000080]/10 transition-all duration-700 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h5 className="text-xs font-bold text-[#000080] uppercase tracking-widest mb-2">{t('roadmap.viewOutcome', 'What you will learn')}</h5>
            <p className="text-sm text-gray-700 leading-relaxed">{phase.learning_outcome}</p>
          </div>
        )}

        {/* Selected Specialization Notice */}
        {phase.selected_option_name && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Specialization Selected: {phase.selected_option_name}</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
              Active Track
            </span>
          </div>
        )}

        {/* Branch Decision */}
        {phase.has_decision_point && !phase.selected_option_name && (
          <div 
            className={`mt-6 bg-[#000080]/5 border border-[#000080]/20 p-6 rounded-xl text-center border-dashed transition-all duration-700 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '350ms' }}
          >
            <GitBranch className="w-8 h-8 text-[#000080]/60 mx-auto mb-3" />
            <h5 className="font-bold text-[#000080] mb-2 text-lg">{t('roadmap.chooseTrack', 'Branch Decision Required')}</h5>
            <p className="text-sm text-gray-600 mb-5">Choose your specialization to calibrate the advanced milestones in your learning trajectory.</p>
            <button 
              onClick={() => onDecisionClick(phase)}
              className="bg-[#FF9933] hover:bg-[#e68a2e] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg text-sm cursor-pointer inline-flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              {t('roadmap.chooseTrack', 'Choose Track')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ phases, onEvidenceClick, onDecisionClick }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedIndex, setAnimatedIndex] = useState(-1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    setAnimatedIndex(0);
    let curr = 0;
    const lastTarget = phases.findIndex(p => p.status === 'IN_PROGRESS' || p.status === 'LOCKED');
    const maxIndex = lastTarget === -1 ? phases.length : lastTarget;

    const interval = setInterval(() => {
      curr++;
      setAnimatedIndex(curr);
      if (curr >= maxIndex) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible, phases]);

  return (
    <div ref={timelineRef} className="py-4 space-y-8 ml-2 relative">
      {phases.map((phase, index) => (
        <PhaseCard 
          key={phase.id}
          phase={phase} 
          index={index} 
          isTimelineReached={animatedIndex >= index}
          isLast={index === phases.length - 1}
          onEvidenceClick={onEvidenceClick} 
          onDecisionClick={onDecisionClick} 
        />
      ))}
    </div>
  );
};
