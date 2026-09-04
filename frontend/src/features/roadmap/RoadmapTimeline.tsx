import React, { useEffect, useRef, useState } from 'react';
import { GitBranch, CheckCircle2, Check, Clock, Lock, BookOpen, Calculator, Database, BrainCircuit, Lightbulb } from 'lucide-react';
import { MilestoneStatus } from './MilestoneCard';

export interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
}

export interface Phase {
  id: string;
  phase_number: number;
  title: string;
  description?: string;
  learning_outcome?: string;
  status: MilestoneStatus;
  topics?: string[];
  has_decision_point?: boolean;
  decision_options?: { branch_id: string; name: string }[];
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
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-white bg-[#000080] rounded-full uppercase shadow-sm">
                Step {phase.phase_number}
              </span>
              {phase.status === 'FAST_TRACKED' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fast-tracked
                </span>
              )}
              {phase.status === 'COMPLETED' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
              {phase.status === 'IN_PROGRESS' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" /> In Progress
                </span>
              )}
            </div>
            <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
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

        {/* Topics */}
        {phase.topics && phase.topics.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Topics</h5>
              {phase.status === 'IN_PROGRESS' && (
                <span className="text-xs text-blue-600 font-medium opacity-80 italic animate-pulse">
                  (Click any topic below to submit evidence)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {phase.topics.map((topic, i) => {
                const isCompleted = phase.status === 'COMPLETED' || phase.status === 'FAST_TRACKED';
                const isInProgress = phase.status === 'IN_PROGRESS';
                const isLocked = phase.status === 'LOCKED';

                let chipBg = 'bg-gray-50 border-gray-200 text-gray-500';
                if (isCompleted) chipBg = 'bg-green-50 border-green-200 text-green-700';
                else if (isInProgress) chipBg = 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm cursor-pointer hover:bg-blue-100';

                return (
                  <div 
                    key={i}
                    onClick={() => isInProgress ? onEvidenceClick(phase.id) : undefined}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-500 ease-out transform ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } ${chipBg}`}
                    style={{ transitionDelay: `${300 + (i * 50)}ms` }}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {isInProgress && <Clock className="w-4 h-4 text-blue-500" />}
                    {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                    {topic}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Learning Outcome */}
        {phase.learning_outcome && (
          <div 
            className={`bg-[#000080]/5 rounded-xl p-5 border border-[#000080]/10 transition-all duration-700 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${300 + ((phase.topics?.length || 0) * 50)}ms` }}
          >
            <h5 className="text-xs font-bold text-[#000080] uppercase tracking-widest mb-2">What you will learn</h5>
            <p className="text-sm text-gray-700 leading-relaxed">{phase.learning_outcome}</p>
          </div>
        )}

        {/* Branch Decision */}
        {phase.has_decision_point && (
          <div 
            className={`mt-6 bg-[#000080]/5 border border-[#000080]/20 p-6 rounded-xl text-center border-dashed transition-all duration-700 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${300 + ((phase.topics?.length || 0) * 50)}ms` }}
          >
            <GitBranch className="w-8 h-8 text-[#000080]/60 mx-auto mb-3" />
            <h5 className="font-bold text-[#000080] mb-2 text-lg">Branch Decision Required</h5>
            <p className="text-sm text-gray-600 mb-5">Choose your specialization to unlock the next milestones in your journey.</p>
            <button 
              onClick={() => onDecisionClick(phase)}
              className="bg-[#FF9933] hover:bg-[#e68a2e] text-white px-6 py-2 rounded-full font-bold transition-all shadow-md hover:shadow-lg text-sm"
            >
              Make a Decision
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
