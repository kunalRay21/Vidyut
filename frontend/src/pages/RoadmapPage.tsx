import React, { useState, useEffect } from 'react';
import { RoadmapTimeline, Phase } from '../features/roadmap/RoadmapTimeline';
import { DecisionPointModal } from '../features/roadmap/DecisionPointModal';
import { EvidenceSubmitModal } from '../features/roadmap/EvidenceSubmitModal';

const INITIAL_PHASES: Phase[] = [
  {
    phase_number: 1,
    title: "Programming & Python Core",
    description: "Master the foundational syntax, data structures, and object-oriented concepts necessary to build robust applications.",
    milestones: [
      { id: "m1-1", title: "Programming Fundamentals", status: "FAST_TRACKED" },
      { id: "m1-2", title: "Python Language", status: "IN_PROGRESS" },
      { id: "m1-3", title: "Object-Oriented Programming", status: "LOCKED" },
    ]
  },
  {
    phase_number: 2,
    title: "Mathematics Foundations",
    description: "Develop the mathematical intuition needed to understand machine learning algorithms under the hood.",
    milestones: [
      { id: "m2-1", title: "Linear Algebra", status: "LOCKED" },
      { id: "m2-2", title: "Statistics & Probability", status: "LOCKED" },
      { id: "m2-3", title: "Calculus Basics", status: "LOCKED" },
    ]
  },
  {
    phase_number: 3,
    title: "Data Handling",
    description: "Learn to query databases, clean messy datasets, and visualize insights effectively.",
    milestones: [
      { id: "m3-1", title: "SQL Fundamentals", status: "LOCKED" },
      { id: "m3-2", title: "pandas / Data Manipulation", status: "LOCKED" },
      { id: "m3-3", title: "Data Visualization", status: "LOCKED" },
    ]
  },
  {
    phase_number: 4,
    title: "Core Machine Learning",
    description: "Train, evaluate, and tune predictive models using industry-standard machine learning techniques.",
    milestones: [
      { id: "m4-1", title: "Machine Learning Fundamentals", status: "LOCKED" },
      { id: "m4-2", title: "scikit-learn", status: "LOCKED" },
      { id: "m4-3", title: "Feature Engineering", status: "LOCKED" },
      { id: "m4-4", title: "Model Evaluation & Metrics", status: "LOCKED" },
    ],
    has_decision_point: true,
    decision_options: [
      { branch_id: "branch-tf", name: "TensorFlow" },
      { branch_id: "branch-pytorch", name: "PyTorch" }
    ]
  }
];

import { FadeIn } from '../components/animations/FadeIn';
import { MOCK_STUDENT_PROFILE } from '../mocks/studentSessionMock';

export const RoadmapPage: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [readinessScore, setReadinessScore] = useState(MOCK_STUDENT_PROFILE.readiness_pct);
  
  // Animation states for the readiness gauge
  const [displayedScore, setDisplayedScore] = useState(0);
  const [isGaugeLoaded, setIsGaugeLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsGaugeLoaded(true), 100);
    
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5s
    const startValue = displayedScore; 
    let animationFrameId: number;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startValue + (readinessScore - startValue) * easeOut);
      
      setDisplayedScore(currentScore);
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayedScore(readinessScore);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      clearTimeout(timer);
      window.cancelAnimationFrame(animationFrameId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readinessScore]);

  // Modals state
  const [decisionPhase, setDecisionPhase] = useState<Phase | null>(null);
  const [evidenceMilestoneId, setEvidenceMilestoneId] = useState<string | null>(null);

  const handleDecisionSelect = (branchId: string) => {
    setPhases(prev => {
      const updated = [...prev];
      const p4 = updated.find(p => p.phase_number === 4);
      if (p4) {
        p4.has_decision_point = false;
        if (!p4.milestones) p4.milestones = [];
        p4.milestones.push({ id: 'm-branch', title: `Specialization: ${branchId === 'branch-pytorch' ? 'PyTorch' : 'TensorFlow'} Selected`, status: 'COMPLETED' });
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
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <FadeIn delay={100}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Adaptive Roadmap</h1>
            <p className="text-gray-500 mt-2">Your personalized path to Machine Learning Engineer.</p>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="flex flex-col items-center relative">
            <span className="block text-sm text-gray-500 font-semibold mb-2 uppercase tracking-wide">Current Readiness</span>
            
            <div className="relative w-52 h-28 flex justify-center items-end">
              <svg className="absolute top-0 left-0 w-full h-full drop-shadow-sm" viewBox="0 0 200 120">
                <defs>
                  <linearGradient id="roadmap-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF9933" />
                    <stop offset="45%" stopColor="#FACC15" />
                    <stop offset="100%" stopColor="#138808" />
                  </linearGradient>
                  <filter id="roadmap-arc-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#138808" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Background Arc */}
                <path 
                  d="M 20 100 A 80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="#E5E7EB" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                />
                
                {/* Progress Arc */}
                <path 
                  d="M 20 100 A 80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="url(#roadmap-gauge-gradient)" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                  strokeDasharray={251.327}
                  strokeDashoffset={251.327 - ((isGaugeLoaded ? readinessScore : 0) / 100) * 251.327}
                  className="transition-all duration-[1500ms] ease-out"
                  filter="url(#roadmap-arc-glow)"
                />
              </svg>
              
              {/* Percentage Text */}
              <div className="absolute bottom-1.5 flex items-baseline justify-center">
                <span className="text-[2.5rem] font-medium text-[#1E1B4B] leading-none tracking-tight">
                  {displayedScore}
                </span>
                <span className="text-xl font-normal text-[#1E1B4B]/70 ml-0.5">
                  %
                </span>
              </div>
            </div>
            
            <span className="text-xs text-gray-500 font-medium mt-2">of target skills acquired</span>
          </div>
        </FadeIn>
      </header>

      <FadeIn delay={300}>
        <div className="bg-[#FFFFED] rounded-xl shadow-sm border border-gray-100 p-8">
          <RoadmapTimeline 
            phases={phases} 
            onEvidenceClick={(id) => setEvidenceMilestoneId(id)} 
            onDecisionClick={(phase) => setDecisionPhase(phase)} 
          />
        </div>
      </FadeIn>

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


