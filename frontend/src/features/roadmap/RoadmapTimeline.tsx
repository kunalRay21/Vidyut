import React from 'react';
import { MilestoneCard, MilestoneStatus } from './MilestoneCard';
import { GitBranch } from 'lucide-react';

export interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
}

export interface Phase {
  phase_number: number;
  title: string;
  has_decision_point?: boolean;
  decision_options?: { branch_id: string; name: string }[];
  milestones?: Milestone[];
}

interface RoadmapTimelineProps {
  phases: Phase[];
  onEvidenceClick: (milestoneId: string) => void;
  onDecisionClick: (phase: Phase) => void;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ phases, onEvidenceClick, onDecisionClick }) => {
  return (
    <div className="relative border-l-2 border-indigo-200 ml-4 py-4 space-y-12">
      {phases.map((phase) => (
        <div key={phase.phase_number} className="relative pl-8">
          <div className="absolute -left-[11px] top-1 w-5 h-5 bg-indigo-500 rounded-full border-4 border-white shadow"></div>
          <div className="mb-4">
            <h3 className="text-sm font-bold tracking-widest text-indigo-500 uppercase">Phase {phase.phase_number}</h3>
            <h4 className="text-xl font-bold text-gray-900">{phase.title}</h4>
          </div>

          {phase.has_decision_point ? (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg mb-4 text-center border-dashed">
              <GitBranch className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h5 className="font-semibold text-indigo-900 mb-2">Branch Decision Required</h5>
              <p className="text-sm text-indigo-700 mb-4">Choose your specialization to unlock the next milestones.</p>
              <button 
                onClick={() => onDecisionClick(phase)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Make a Decision
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {phase.milestones?.map((m) => (
                <MilestoneCard 
                  key={m.id} 
                  id={m.id} 
                  title={m.title} 
                  status={m.status} 
                  onEvidenceSubmit={onEvidenceClick} 
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
