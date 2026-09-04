import React, { useEffect, useRef, useState } from 'react';
import { GitBranch, CheckCircle2, Clock, Lock, BookOpen, Calculator, Database, BrainCircuit, Lightbulb } from 'lucide-react';
import { MilestoneStatus } from './MilestoneCard';

export interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
}

export interface Phase {
  phase_number: number;
  title: string;
  description?: string;
  has_decision_point?: boolean;
  decision_options?: { branch_id: string; name: string }[];
  milestones?: Milestone[];
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
  onEvidenceClick: (id: string) => void;
  onDecisionClick: (p: Phase) => void;
}> = ({ phase, onEvidenceClick, onDecisionClick }) => {
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

  return (
    <div className="relative pl-8">
      {/* Connecting vertical line for timeline */}
      <div className="absolute left-[11px] top-8 bottom-[-2rem] w-0.5 bg-[#EAE3B3] -z-10" />
      
      {/* Timeline Node */}
      <div className="absolute -left-1 top-6 w-6 h-6 bg-[#FF9933] rounded-full border-4 border-[#FEFCE2] shadow-sm z-10" />

      <div 
        ref={cardRef}
        className={`bg-[#FFFEF2] rounded-2xl border border-[#EAE3B3] p-8 shadow-sm transition-all duration-700 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#000080]/10 text-[#000080] shrink-0">
            {getPhaseIcon(phase.phase_number)}
          </div>
          <div>
            <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-widest text-white bg-[#000080] rounded-full uppercase shadow-sm">
              Step {phase.phase_number}
            </span>
            <h4 className="text-2xl font-bold text-gray-900">{phase.title}</h4>
          </div>
        </div>

        {/* Description */}
        {phase.description && (
          <p className="text-gray-600 leading-relaxed mb-6">
            {phase.description}
          </p>
        )}

        {/* Topics / Milestones */}
        {phase.milestones && phase.milestones.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Topics</h5>
            <div className="flex flex-wrap gap-2">
              {phase.milestones.map((m, i) => {
                const isCompleted = m.status === 'COMPLETED' || m.status === 'FAST_TRACKED';
                const isInProgress = m.status === 'IN_PROGRESS';
                const isLocked = m.status === 'LOCKED';

                let chipBg = 'bg-gray-50 border-gray-200 text-gray-500';
                if (isCompleted) chipBg = 'bg-green-50 border-green-200 text-green-700';
                else if (isInProgress) chipBg = 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm cursor-pointer hover:bg-blue-100';

                return (
                  <div 
                    key={m.id}
                    onClick={() => isInProgress ? onEvidenceClick(m.id) : undefined}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-500 ease-out transform ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } ${chipBg}`}
                    style={{ transitionDelay: `${300 + (i * 100)}ms` }}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {isInProgress && <Clock className="w-4 h-4 text-blue-500" />}
                    {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                    {m.title}
                    {m.status === 'FAST_TRACKED' && <span className="opacity-70 text-xs ml-1">(Fast-tracked)</span>}
                    {isInProgress && <span className="opacity-70 text-xs ml-1 hidden sm:inline">— Click to Upload Evidence</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Branch Decision */}
        {phase.has_decision_point && (
          <div 
            className={`mt-6 bg-[#000080]/5 border border-[#000080]/20 p-6 rounded-xl text-center border-dashed transition-all duration-700 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${300 + ((phase.milestones?.length || 0) * 100)}ms` }}
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
  return (
    <div className="py-4 space-y-8 ml-2">
      {phases.map((phase, index) => (
        <PhaseCard 
          key={phase.phase_number} 
          phase={phase} 
          index={index} 
          onEvidenceClick={onEvidenceClick} 
          onDecisionClick={onDecisionClick} 
        />
      ))}
    </div>
  );
};
