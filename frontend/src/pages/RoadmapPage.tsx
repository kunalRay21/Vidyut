import React, { useState } from 'react';
import { RoadmapTimeline, Phase } from '../features/roadmap/RoadmapTimeline';
import { DecisionPointModal } from '../features/roadmap/DecisionPointModal';
import { EvidenceSubmitModal } from '../features/roadmap/EvidenceSubmitModal';

const INITIAL_PHASES: Phase[] = [
  {
    phase_number: 1,
    title: "Python and Programming Core",
    milestones: [
      { id: "m1", title: "Python Language (Intermediate)", status: "COMPLETED" },
      { id: "m2", title: "Data Structures in Python", status: "IN_PROGRESS" },
    ]
  },
  {
    phase_number: 4,
    title: "Core Machine Learning",
    has_decision_point: true,
    decision_options: [
      { branch_id: "branch-tf", name: "TensorFlow" },
      { branch_id: "branch-pytorch", name: "PyTorch" }
    ]
  }
];

export const RoadmapPage: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [readinessScore, setReadinessScore] = useState(14);
  
  // Modals state
  const [decisionPhase, setDecisionPhase] = useState<Phase | null>(null);
  const [evidenceMilestoneId, setEvidenceMilestoneId] = useState<string | null>(null);

  const handleDecisionSelect = (branchId: string) => {
    setPhases(prev => {
      const updated = [...prev];
      const p4 = updated.find(p => p.phase_number === 4);
      if (p4) {
        p4.has_decision_point = false;
        p4.milestones = [
          { id: 'm-branch', title: `Specialization: ${branchId === 'branch-pytorch' ? 'PyTorch' : 'TensorFlow'} Selected`, status: 'COMPLETED' }
        ];
      }
      
      updated.push({
        phase_number: 5,
        title: branchId === 'branch-pytorch' ? 'PyTorch Deep Learning' : 'TensorFlow Deep Learning',
        milestones: [
          { 
            id: 'm5-1', 
            title: branchId === 'branch-pytorch' ? 'PyTorch Tensors & Autograd' : 'TF Tensors & Keras', 
            status: 'IN_PROGRESS' 
          },
          { 
            id: 'm5-2', 
            title: 'Build a CNN', 
            status: 'LOCKED' 
          }
        ]
      });
      
      return updated;
    });
    setDecisionPhase(null);
  };

  const handleEvidenceSubmit = (id: string, _url: string, _desc: string) => {
    setReadinessScore(prev => Math.min(100, prev + 5));
    
    setPhases(prev => {
      return prev.map(p => {
        if (!p.milestones) return p;
        return {
          ...p,
          milestones: p.milestones.map(m => 
            m.id === id ? { ...m, status: 'COMPLETED' as const } : m
          )
        };
      });
    });
    
    setEvidenceMilestoneId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adaptive Roadmap</h1>
          <p className="text-gray-500 mt-2">Your personalized path to Machine Learning Engineer.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-6 py-3 text-center min-w-[150px]">
          <span className="block text-sm text-indigo-600 font-semibold mb-1">Current Readiness</span>
          <span className="block text-3xl font-bold text-indigo-900">{readinessScore}%</span>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <RoadmapTimeline 
          phases={phases} 
          onEvidenceClick={(id) => setEvidenceMilestoneId(id)} 
          onDecisionClick={(phase) => setDecisionPhase(phase)} 
        />
      </div>

      <DecisionPointModal 
        isOpen={!!decisionPhase}
        phaseTitle={decisionPhase?.title || ''}
        options={decisionPhase?.decision_options || []}
        onClose={() => setDecisionPhase(null)}
        onSelect={handleDecisionSelect}
      />

      <EvidenceSubmitModal 
        isOpen={!!evidenceMilestoneId}
        milestoneId={evidenceMilestoneId}
        onClose={() => setEvidenceMilestoneId(null)}
        onSubmit={handleEvidenceSubmit}
      />
    </div>
  );
};
