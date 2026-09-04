import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RoadmapTimeline, Phase } from '../features/roadmap/RoadmapTimeline';
import { DecisionPointModal } from '../features/roadmap/DecisionPointModal';
import { EvidenceSubmitModal } from '../features/roadmap/EvidenceSubmitModal';
import { FadeIn } from '../components/animations/FadeIn';
import { roadmapApi, portfolioApi, recommendationsApi, getStoredUser } from '../services/api';
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';

const DEFAULT_PHASES: Phase[] = [
  {
    id: 'p1',
    phase_number: 1,
    title: 'Programming Fundamentals',
    description: 'Build a strong foundation in programming by understanding the core concepts and logic required to write structured programs.',
    learning_outcome: 'Understand how programs are structured and develop the logical thinking required to solve programming problems.',
    status: 'COMPLETED',
    topics: ['Programming Basics', 'Variables and Data Types', 'Control Flow', 'Functions'],
  },
  {
    id: 'p2',
    phase_number: 2,
    title: 'Python Programming Core',
    description: 'Learn Python syntax, built-in data structures, and core programming concepts.',
    learning_outcome: 'Write complete Python programs and organize modular code.',
    status: 'IN_PROGRESS',
    topics: ['Python Syntax', 'Data Structures', 'Functions & Modules', 'Exception Handling'],
  },
  {
    id: 'p3',
    phase_number: 3,
    title: 'Relational Databases & SQL',
    description: 'Design database schemas, query tables, and maintain data consistency.',
    learning_outcome: 'Extract and manipulate structured datasets.',
    status: 'LOCKED',
    topics: ['SQL Queries', 'Joins & Aggregations', 'Database Normalization'],
  },
  {
    id: 'p4',
    phase_number: 4,
    title: 'Core Framework Specialization',
    description: 'Select your technology specialization to unlock aligned framework milestones.',
    learning_outcome: 'Develop complete server-side or deep learning applications.',
    status: 'LOCKED',
    topics: ['Framework Architecture', 'Routing & Data Models', 'Testing'],
    has_decision_point: true,
    decision_options: [
      { branch_id: 'branch-pytorch', name: 'PyTorch' },
      { branch_id: 'branch-tf', name: 'TensorFlow' },
    ],
  },
];

export const RoadmapPage: React.FC = () => {
  const { t } = useTranslation();
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [readinessScore, setReadinessScore] = useState(14);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [isGaugeLoaded, setIsGaugeLoaded] = useState(false);
  const [roleTitle, setRoleTitle] = useState('Machine Learning Engineer');
  const [skillResources, setSkillResources] = useState<any[]>([]);

  // Modals state
  const [decisionPhase, setDecisionPhase] = useState<Phase | null>(null);
  const [evidenceMilestoneId, setEvidenceMilestoneId] = useState<string | null>(null);

  // 1. Fetch dynamic roadmap and curated resources from backend
  useEffect(() => {
    let mounted = true;

    async function loadResources() {
      try {
        const user = getStoredUser();
        const studentId = user?.student_profile_id || user?.id || user?.student_id;
        const res = await recommendationsApi.getResources({ studentId });
        if (mounted && res.success && res.data?.skillResources) {
          setSkillResources(res.data.skillResources);
        }
      } catch (err) {
        console.warn('Learning resources load error:', err);
      }
    }

    loadResources();

    async function loadRoadmap() {
      const user = getStoredUser();
      const studentId = user?.id || user?.student_id;
      const roleId = user?.selected_role_id || 'role-ml';

      try {
        const res = await roadmapApi.getRoadmap(studentId, roleId);
        if (mounted && res.success && res.data) {
          if (res.data.role_name) {
            setRoleTitle(res.data.role_name);
          }
          if (res.data.readiness_pct !== undefined) {
            setReadinessScore(res.data.readiness_pct);
          }

          if (Array.isArray(res.data.phases) && res.data.phases.length > 0) {
            const mappedPhases: Phase[] = res.data.phases.map((p: any) => ({
              id: `p-${p.phase_number}`,
              phase_number: p.phase_number,
              title: p.title || `Phase ${p.phase_number}: Skill Milestones`,
              description: p.description || 'Complete prerequisite-ordered milestones to advance to the next competency stage.',
              learning_outcome: p.learning_outcome || 'Master target skill competencies to unlock aligned industry opportunities.',
              status: p.phase_number === 1 ? 'IN_PROGRESS' : 'LOCKED',
              topics: p.milestones?.map((m: any) => m.title) || ['Core Concept Verification'],
              has_decision_point: !!p.has_decision_point,
              decision_options: p.decision_options || [],
            }));
            setPhases(mappedPhases);
          }
        }
      } catch (err) {
        console.warn('Roadmap API load error, using default phases:', err);
      }
    }

    loadRoadmap();
    return () => { mounted = false; };
  }, []);

  // 2. Smooth animation for readiness gauge
  useEffect(() => {
    const timer = setTimeout(() => setIsGaugeLoaded(true), 100);
    let startTimestamp: number | null = null;
    const duration = 1200;
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
  }, [readinessScore]);

  // 3. Handle technology branch choice via backend API
  const handleDecisionSelect = async (branchId: string) => {
    try {
      const res = await roadmapApi.selectBranch(branchId);
      if (res.success && res.data?.updated_roadmap?.phases) {
        const updatedPhases: Phase[] = res.data.updated_roadmap.phases.map((p: any) => ({
          id: `p-${p.phase_number}`,
          phase_number: p.phase_number,
          title: p.title,
          description: p.description || 'Target framework specialization milestone.',
          learning_outcome: 'Build complete applications using the selected framework.',
          status: 'IN_PROGRESS',
          topics: p.milestones?.map((m: any) => m.title) || [],
          has_decision_point: false,
        }));
        setPhases(updatedPhases);
      } else {
        // Fallback local UI update
        setPhases((prev) => {
          const updated = [...prev];
          const dp = updated.find((p) => p.has_decision_point);
          if (dp) {
            dp.has_decision_point = false;
            dp.topics = [...(dp.topics || []), `Specialization: ${branchId.replace('branch-', '').toUpperCase()} Selected`];
          }
          return updated;
        });
      }
    } catch (err) {
      console.warn('Branch selection API error:', err);
    } finally {
      setDecisionPhase(null);
    }
  };

  // 4. Handle portfolio evidence submission via backend API
  const handleEvidenceSubmit = async (milestoneId: string, url: string, description: string) => {
    try {
      const res = await portfolioApi.submitEvidence({
        skill_id: milestoneId,
        type: 'GITHUB',
        url,
        description,
      });

      if (res.success && res.data?.new_readiness_pct) {
        setReadinessScore(res.data.new_readiness_pct);
      } else {
        setReadinessScore((prev) => Math.min(100, prev + 5));
      }

      setPhases((prev) => {
        const idx = prev.findIndex((p) => p.id === milestoneId);
        if (idx !== -1) {
          return prev.map((p, i) => {
            if (i === idx) return { ...p, status: 'COMPLETED' as const };
            if (i === idx + 1 && p.status === 'LOCKED') return { ...p, status: 'IN_PROGRESS' as const };
            return p;
          });
        }
        return prev;
      });
    } catch (err) {
      console.warn('Evidence submission error:', err);
    } finally {
      setEvidenceMilestoneId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:px-12 space-y-8">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <FadeIn delay={100}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 text-saffron-600 text-xs font-bold uppercase tracking-wider mb-2 border border-saffron/30">
              {t('roadmap.badge')}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('roadmap.title')}</h1>
            <p className="text-gray-500 mt-1">{t('roadmap.subtitle')} {roleTitle}.</p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="flex flex-col items-center relative">
            <span className="block text-sm text-gray-500 font-semibold mb-2 uppercase tracking-wide">{t('roadmap.currentReadiness')}</span>
            
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
                  className="transition-all duration-[1200ms] ease-out"
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

      {skillResources.length > 0 && (
        <FadeIn delay={400}>
          <div className="bg-[#FFFEF2] rounded-2xl shadow-sm border border-[#EAE3B3] p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EAE3B3] pb-4">
              <div className="flex items-center gap-2.5 text-indigo-950">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <h2 className="text-xl font-bold">Curated Learning Resources for Priority Gaps</h2>
              </div>
              <span className="self-start sm:self-auto text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-200">
                Role 5 Recommendation Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillResources.map((sr: any) => (
                <div key={sr.skillId} className="bg-white/80 border border-[#EAE3B3] rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-base">{sr.skillName}</h3>
                    <span className="text-[11px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                      Target: {sr.targetProficiency || 'PROFICIENT'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sr.resources?.slice(0, 3).map((res: any) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFEF2] hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                          <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 shrink-0" />
                          <span className="text-xs font-medium text-gray-800 group-hover:text-indigo-900 truncate">
                            {res.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {res.isFree && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded">
                              Free
                            </span>
                          )}
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                        </div>
                      </a>
                    ))}
                    {(!sr.resources || sr.resources.length === 0) && (
                      <p className="text-xs text-gray-400 italic">No resources listed for this milestone yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

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
