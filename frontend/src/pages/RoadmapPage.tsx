import React, { useState, useEffect } from 'react';
import { RoadmapTimeline, Phase } from '../features/roadmap/RoadmapTimeline';
import { DecisionPointModal } from '../features/roadmap/DecisionPointModal';
import { EvidenceSubmitModal } from '../features/roadmap/EvidenceSubmitModal';

import { useLocation } from 'react-router-dom';
import { MOCK_STUDENT_PROFILE } from '../mocks/studentSessionMock';

const INITIAL_PHASES: Phase[] = [
  {
    id: "step1",
    phase_number: 1,
    title: "Programming Foundations",
    description: "Build a strong foundation in programming by understanding the core concepts and logic required to write structured programs.",
    learning_outcome: "Understand how programs are structured and develop the logical thinking required to solve programming problems.",
    status: "FAST_TRACKED",
    topics: ["Programming Fundamentals", "Problem Solving"]
  },
  {
    id: "step2",
    phase_number: 2,
    title: "Python & Core Development",
    description: "Learn Python as a programming language and understand how to use its syntax, built-in features, and core concepts to write efficient programs.",
    learning_outcome: "Write complete Python programs, work with different data structures, and handle common runtime errors.",
    status: "IN_PROGRESS",
    topics: ["Python Basics", "Data Structures", "Functions & Modules"]
  },
  {
    id: "step3",
    phase_number: 3,
    title: "Data & Database Fundamentals",
    description: "Learn to query databases, clean messy datasets, and visualize insights effectively.",
    learning_outcome: "Extract data from relational databases, manipulate large datasets, and build informative visualizations.",
    status: "LOCKED",
    topics: ["Python for Data", "SQL", "Data Handling", "Data Analysis"]
  },
  {
    id: "step4",
    phase_number: 4,
    title: "Machine Learning Foundations",
    description: "Develop mathematical intuition and train predictive models using industry-standard machine learning techniques.",
    learning_outcome: "Build end-to-end machine learning pipelines to solve classification and regression problems.",
    status: "LOCKED",
    topics: ["Statistics & Probability", "Supervised Learning", "Unsupervised Learning", "Feature Engineering"]
  },
  {
    id: "step5",
    phase_number: 5,
    title: "Advanced Learning & Specialization",
    description: "Dive deep into specialized subfields like Deep Learning, Natural Language Processing, or Computer Vision.",
    learning_outcome: "Develop, train, and deploy advanced neural network architectures.",
    status: "LOCKED",
    topics: ["Deep Learning Basics", "Neural Networks"],
    has_decision_point: true,
    decision_options: [
      { branch_id: "branch-tf", name: "TensorFlow" },
      { branch_id: "branch-pytorch", name: "PyTorch" }
    ]
  },
  {
    id: "step6",
    phase_number: 6,
    title: "Projects, Portfolio & Career Readiness",
    description: "Apply your knowledge to practical projects, build a strong portfolio, and prepare for industry roles.",
    learning_outcome: "Complete end-to-end projects, deploy models, and gain career-ready experience.",
    status: "LOCKED",
    topics: ["Practical Projects", "Portfolio Development", "Deployment / MLOps", "Career Readiness"]
  }
];

const calculatePhaseStatuses = (phases: Phase[], skills: typeof MOCK_STUDENT_PROFILE.skills): Phase[] => {
  return phases.map((phase, index) => {
    // Find all skills explicitly mapped to this roadmap step
    const mappedSkills = skills.filter(s => s.roadmap_id === phase.id);
    
    // If no explicit skills mapped, we assume it's locked by default
    if (mappedSkills.length === 0) return { ...phase, status: "LOCKED" as any };

    // Calculate average progress
    const totalProgress = mappedSkills.reduce((sum, s) => sum + s.progress, 0);
    const avgProgress = totalProgress / mappedSkills.length;

    let newStatus = phase.status;
    if (avgProgress === 100) {
      newStatus = "COMPLETED" as any;
    } else if (avgProgress > 0) {
      newStatus = "IN_PROGRESS" as any;
    } else {
      newStatus = "LOCKED" as any;
    }

    return { ...phase, status: newStatus };
  });
};

import { FadeIn } from '../components/animations/FadeIn';

export const RoadmapPage: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>(calculatePhaseStatuses(INITIAL_PHASES, MOCK_STUDENT_PROFILE.skills));
  const [readinessScore, setReadinessScore] = useState(MOCK_STUDENT_PROFILE.readiness_pct);
  const location = useLocation();

  // If skills change externally, resync the statuses but preserve any dynamic branching
  useEffect(() => {
    setPhases(prevPhases => {
      return prevPhases.map(phase => {
        const mappedSkills = MOCK_STUDENT_PROFILE.skills.filter(s => s.roadmap_id === phase.id);
        if (mappedSkills.length === 0) return phase;

        const avgProgress = mappedSkills.reduce((sum, s) => sum + s.progress, 0) / mappedSkills.length;
        let newStatus = phase.status;
        if (avgProgress === 100) newStatus = "COMPLETED" as any;
        else if (avgProgress > 0) newStatus = "IN_PROGRESS" as any;
        else newStatus = "LOCKED" as any;

        return { ...phase, status: newStatus };
      });
    });
  }, [MOCK_STUDENT_PROFILE.skills]);
  
  // Animation states for the readiness gauge
  const [displayedScore, setDisplayedScore] = useState(0);
  const [isGaugeLoaded, setIsGaugeLoaded] = useState(false);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Wait for animations to settle
    }
  }, [location.hash]);

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
      const p5Index = updated.findIndex(p => p.phase_number === 5);
      
      if (p5Index !== -1) {
        updated[p5Index] = {
          ...updated[p5Index],
          has_decision_point: false,
          topics: [
            ...(updated[p5Index].topics || []),
            `Specialization: ${branchId === 'branch-pytorch' ? 'PyTorch' : 'TensorFlow'} Selected`
          ]
        };
      }
      
      // The final phase (Projects & Career Readiness) should be shifted to step 7
      const projectsPhaseIndex = updated.findIndex(p => p.id === 'step6');
      if (projectsPhaseIndex !== -1) {
        updated[projectsPhaseIndex] = {
          ...updated[projectsPhaseIndex],
          id: "step7",
          phase_number: 7,
          status: "LOCKED" // Keeps it locked until specialization is done
        };
      }

      // Insert the new specialization phase at step 6
      const specializationPhase: Phase = {
        id: "step6-specialization",
        phase_number: 6,
        title: branchId === 'branch-pytorch' ? 'PyTorch Specialization' : 'TensorFlow Specialization',
        description: `Learn to build deep neural networks and advanced models using ${branchId === 'branch-pytorch' ? 'PyTorch' : 'TensorFlow'}.`,
        learning_outcome: `Develop, train, and deploy advanced neural network models using ${branchId === 'branch-pytorch' ? 'PyTorch' : 'TensorFlow'}.`,
        status: 'IN_PROGRESS',
        topics: [
          branchId === 'branch-pytorch' ? 'PyTorch Tensors & Autograd' : 'TF Tensors & Keras',
          'Build a CNN',
          'Transfer Learning'
        ]
      };

      // Insert it right after step 5 (which is index p5Index)
      if (p5Index !== -1) {
        updated.splice(p5Index + 1, 0, specializationPhase);
      } else {
        updated.push(specializationPhase);
      }
      
      return updated;
    });
    setDecisionPhase(null);
  };

  const handleEvidenceSubmit = (id: string, _url: string, _desc: string) => {
    setReadinessScore(prev => Math.min(100, prev + 5));
    
    setPhases(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx !== -1) {
        return prev.map((p, i) => {
          if (i === idx) return { ...p, status: 'COMPLETED' as const };
          if (i === idx + 1 && p.status === 'LOCKED') return { ...p, status: 'IN_PROGRESS' as const };
          return p;
        });
      }
      return prev;
    });
    
    setEvidenceMilestoneId(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:px-12 space-y-8">
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
        <div className="bg-[#FFFEF2] rounded-2xl shadow-sm border border-[#EAE3B3] p-6 md:p-8">
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


