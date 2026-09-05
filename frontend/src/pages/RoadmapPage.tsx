import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RoadmapTimeline, Phase } from '../features/roadmap/RoadmapTimeline';
import { DecisionPointModal } from '../features/roadmap/DecisionPointModal';
import { EvidenceSubmitModal } from '../features/roadmap/EvidenceSubmitModal';
import { FadeIn } from '../components/animations/FadeIn';
import { roadmapApi, portfolioApi, recommendationsApi, getStoredUser, getStoredResume } from '../services/api';
import { 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Compass, 
  RefreshCw, 
  AlertCircle,
  Award,
  FileText,
  ArrowRight
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Dynamic live state from backend
  const [phases, setPhases] = useState<Phase[]>([]);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [displayedScore, setDisplayedScore] = useState<number>(0);
  const [isGaugeLoaded, setIsGaugeLoaded] = useState<boolean>(false);
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [totalSkills, setTotalSkills] = useState<number>(0);
  const [completedSkills, setCompletedSkills] = useState<number>(0);
  const [inProgressSkills, setInProgressSkills] = useState<number>(0);
  const [lockedSkills, setLockedSkills] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skillResources, setSkillResources] = useState<any[]>([]);
  const [hasResume, setHasResume] = useState<boolean>(false);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [resumeMatchedRole, setResumeMatchedRole] = useState<string | null>(null);
  const [resumeSkillsCount, setResumeSkillsCount] = useState<number>(0);

  // Modals state
  const [decisionPhase, setDecisionPhase] = useState<Phase | null>(null);
  const [evidenceMilestoneId, setEvidenceMilestoneId] = useState<string | null>(null);

  const [nextBestSkill, setNextBestSkill] = useState<any>(null);

  // 1. Fetch dynamic roadmap and curated resources from backend
  const loadRoadmap = async (regenerate = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = getStoredUser();
      const studentId = user?.student_profile_id || user?.id || user?.student_id;
      const roleId = user?.selected_role_id;

      const res = regenerate
        ? await roadmapApi.generateRoadmap(studentId, roleId)
        : await roadmapApi.getRoadmap(studentId, roleId);

      if (res.success && res.data) {
        if (res.data.role_name) {
          setRoleTitle(res.data.role_name);
        }
        if (res.data.readiness_pct !== undefined) {
          setReadinessScore(res.data.readiness_pct);
        }
        if (res.data.total_skills !== undefined) {
          setTotalSkills(res.data.total_skills);
        }
        if (res.data.completed_skills !== undefined) {
          setCompletedSkills(res.data.completed_skills);
        }
        if (res.data.in_progress_skills !== undefined) {
          setInProgressSkills(res.data.in_progress_skills);
        }
        if (res.data.locked_skills !== undefined) {
          setLockedSkills(res.data.locked_skills);
        }
        if (res.data.next_best_skill !== undefined) {
          setNextBestSkill(res.data.next_best_skill);
        }

        const storedResume = getStoredResume();
        const resumePresent = !!(res.data.has_resume || storedResume?.fileName || storedResume?.extractedSkills?.length);
        setHasResume(resumePresent);
        setResumeFilename(res.data.resume_filename || storedResume?.fileName || null);
        setResumeMatchedRole(res.data.resume_matched_role || storedResume?.primaryMatch?.title || null);
        setResumeSkillsCount(res.data.resume_skills_count || storedResume?.extractedSkills?.length || 0);

        if (Array.isArray(res.data.phases)) {
          const mappedPhases: Phase[] = res.data.phases.map((p: any) => ({
            id: p.id || `p-${p.phase_number}`,
            phase_number: p.phase_number,
            title: p.title || `Phase ${p.phase_number}: Competency Milestones`,
            description: p.description,
            learning_outcome: p.learning_outcome,
            status: p.status || 'LOCKED',
            topics: p.topics || p.milestones?.map((m: any) => m.title) || [],
            milestones: Array.isArray(p.milestones)
              ? p.milestones.map((m: any) => ({
                  ...m,
                  verified_by_resume: !!(
                    m.verified_by_resume ||
                    (resumePresent &&
                      storedResume?.extractedSkills?.some(
                        (sk: string) =>
                          m.title?.toLowerCase().includes(sk.toLowerCase()) ||
                          sk.toLowerCase().includes(m.title?.toLowerCase())
                      ))
                  ),
                }))
              : [],
            has_decision_point: !!p.has_decision_point,
            selected_branch_id: p.selected_branch_id,
            selected_option_name: p.selected_option_name,
            decision_options: p.decision_options || [],
          }));
          setPhases(mappedPhases);
        }
      } else {
        setError(res.error?.message || 'Failed to load personalized roadmap.');
      }
    } catch (err: any) {
      console.error('Roadmap API load error:', err);
      setError(err.message || 'Failed to connect to roadmap service.');
    } finally {
      setIsLoading(false);
    }
  };

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
    loadRoadmap();

    return () => {
      mounted = false;
    };
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
  const handleDecisionSelect = async (branchId: string, optionId?: string) => {
    try {
      const res = await roadmapApi.selectBranch(branchId, optionId);
      if (res.success && res.data?.updated_roadmap) {
        const ur = res.data.updated_roadmap;
        if (ur.readiness_pct !== undefined) setReadinessScore(ur.readiness_pct);
        if (ur.role_name) setRoleTitle(ur.role_name);
        if (ur.completed_skills !== undefined) setCompletedSkills(ur.completed_skills);
        if (ur.in_progress_skills !== undefined) setInProgressSkills(ur.in_progress_skills);
        if (ur.locked_skills !== undefined) setLockedSkills(ur.locked_skills);

        if (Array.isArray(ur.phases)) {
          const updatedPhases: Phase[] = ur.phases.map((p: any) => ({
            id: p.id || `p-${p.phase_number}`,
            phase_number: p.phase_number,
            title: p.title,
            description: p.description,
            learning_outcome: p.learning_outcome,
            status: p.status,
            topics: p.topics || [],
            milestones: p.milestones || [],
            has_decision_point: !!p.has_decision_point,
            selected_branch_id: p.selected_branch_id,
            selected_option_name: p.selected_option_name,
            decision_options: p.decision_options || [],
          }));
          setPhases(updatedPhases);
        }
      } else {
        await loadRoadmap();
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
      await portfolioApi.submitEvidence({
        skill_id: milestoneId,
        type: 'GITHUB',
        url,
        description,
      });

      // Reload live roadmap DAG from backend to compute newly unlocked milestones
      await loadRoadmap();
    } catch (err) {
      console.warn('Evidence submission error:', err);
    } finally {
      setEvidenceMilestoneId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:px-12 space-y-8">
      {/* Header with National GovTech identity */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <FadeIn delay={100} className="flex-1 min-w-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 text-saffron-700 text-xs font-bold uppercase tracking-wider mb-2.5 border border-saffron/30 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-saffron-600" />
              {t('roadmap.badge', 'AI-Driven Skill Acquisition DAG')}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('roadmap.title', 'Personalized Learning Trajectory')}
            </h1>
            <p className="text-gray-600 mt-1.5 text-base max-w-2xl">
              {roleTitle ? (
                <>Topologically ordered milestone DAG aligned to <strong className="text-gray-900 font-semibold">{roleTitle}</strong> requirements.</>
              ) : (
                'Real-time dependency ordering driven by your verified competency state.'
              )}
            </p>

            {/* Live Stats Strip */}
            {!isLoading && totalSkills > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-gray-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs">
                  <Award className="w-4 h-4 text-[#000080]" />
                  <span>{totalSkills} Total Milestones</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{completedSkills} Mastered</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-xs">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{inProgressSkills} Active Focus</span>
                </div>
                {lockedSkills > 0 && (
                  <div className="flex items-center gap-1.5 font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span>{lockedSkills} Prerequisite Locked</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Readiness Arc Gauge */}
        <FadeIn delay={200} className="shrink-0 w-full sm:w-auto">
          <div className="flex flex-col items-center relative bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm">
            <span className="block text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider text-center">
              {t('roadmap.currentReadiness', 'Role Readiness Index')}
            </span>
            
            <div className="relative w-52 h-[120px] flex justify-center items-end">
              <svg className="absolute top-0 left-0 w-full h-full drop-shadow-sm" viewBox="0 0 200 120">
                <defs>
                  <linearGradient id="roadmap-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF9933" />
                    <stop offset="50%" stopColor="#FACC15" />
                    <stop offset="100%" stopColor="#138808" />
                  </linearGradient>
                  <filter id="roadmap-arc-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#138808" floodOpacity="0.2" />
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
              <div className="absolute bottom-2 flex items-baseline justify-center">
                <span className="text-4xl font-extrabold text-[#000080] leading-none tracking-tight">
                  {displayedScore}
                </span>
                <span className="text-xl font-bold text-[#000080]/70 ml-0.5">
                  %
                </span>
              </div>
              </div>
              
              <span className="text-[11px] text-gray-500 font-medium mt-1">
                of target competency benchmark
              </span>
            </div>
          </FadeIn>
        </header>

      {/* Next Best Skill & Action Bar */}
      {!isLoading && !error && (
        <FadeIn delay={150}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-gradient-to-r from-[#000080]/90 to-[#1e3a8a] text-white p-5 rounded-2xl shadow-sm gap-4 mb-6">
            <div className="flex items-start gap-3.5 flex-1">
              <div className="p-2.5 bg-saffron/20 border border-saffron/40 rounded-xl shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-saffron-300 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-saffron-300 block mb-0.5">
                  RECOMMENDED NEXT BEST SKILL
                </span>
                {nextBestSkill ? (
                  <>
                    <h3 className="text-lg font-bold tracking-tight text-white">{nextBestSkill.name}</h3>
                    <p className="text-xs text-blue-100 mt-1 max-w-xl">
                      {nextBestSkill.reason || 'All prerequisites satisfied. Highly relevant to your target role.'}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold tracking-tight text-white">All Core Prerequisites Satisfied!</h3>
                    <p className="text-xs text-blue-100 mt-1 max-w-xl">
                      Great job! You have achieved benchmark proficiency across required skills for this role.
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => loadRoadmap(true)}
              disabled={isLoading}
              className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2 bg-saffron hover:bg-saffron-600 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate Roadmap
            </button>
          </div>
        </FadeIn>
      )}

      {/* Resume Calibration Dependency Banner */}
      {!isLoading && (
        <FadeIn delay={150}>
          {hasResume ? (
            <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Resume-Calibrated DAG
                    </span>
                    {resumeMatchedRole && (
                      <span className="text-xs font-bold text-[#000080] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {resumeMatchedRole} Track
                      </span>
                    )}
                    {resumeSkillsCount > 0 && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {resumeSkillsCount} Verified Competencies
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    Prerequisite milestones fast-tracked from <span className="text-emerald-800 underline underline-offset-2">{resumeFilename || 'uploaded resume'}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Foundational milestones have been marked completed, automatically unlocking subsequent core and production milestones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="shrink-0 px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
              >
                <span>Update Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50/40 border-2 border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Standard Baseline DAG
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    Upload your resume in Profile to pre-validate existing skills
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Without a resume, all milestones begin at awareness level and require diagnostic evaluation to unlock subsequent phases.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="shrink-0 px-4 py-2 bg-saffron hover:bg-saffron-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
              >
                <span>Upload Resume in Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </FadeIn>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <FadeIn delay={100}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-4 pl-12 border-l-2 border-dashed border-gray-200">
              <div className="h-24 bg-gray-50 rounded-xl border border-gray-200" />
              <div className="h-24 bg-gray-50 rounded-xl border border-gray-200" />
              <div className="h-24 bg-gray-50 rounded-xl border border-gray-200" />
            </div>
            <p className="text-center text-xs font-semibold text-gray-500 pt-2 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-saffron" />
              Calculating live topological DAG prerequisite sequence...
            </p>
          </div>
        </FadeIn>
      )}

      {/* Error / Offline Alert */}
      {!isLoading && error && (
        <FadeIn delay={100}>
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 flex items-start gap-4 text-amber-900">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-base">Unable to Calibrate Real-time Roadmap</h3>
              <p className="text-sm text-amber-800 mt-1">{error}</p>
              <button
                onClick={() => loadRoadmap(false)}
                className="mt-3 px-4 py-1.5 bg-white border border-amber-300 text-amber-900 font-semibold rounded-lg text-xs hover:bg-amber-100 transition cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Empty / Uncalibrated Prompt */}
      {!isLoading && !error && phases.length === 0 && (
        <FadeIn delay={100}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center space-y-4">
            <Compass className="w-12 h-12 text-[#000080] mx-auto opacity-70" />
            <h2 className="text-2xl font-bold text-gray-900">Unlock Your Personalized Roadmap</h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Complete the quick diagnostic skill calibration to evaluate your current proficiencies and generate your custom prerequisite DAG.
            </p>
            <button
              onClick={() => navigate('/assessment/quiz')}
              className="btn-saffron px-6 py-2.5 text-sm font-bold rounded-xl shadow-sm inline-flex items-center gap-2"
            >
              Take Diagnostic Calibration Quiz
            </button>
          </div>
        </FadeIn>
      )}

      {/* Live Roadmap Timeline */}
      {!isLoading && phases.length > 0 && (
        <FadeIn delay={300}>
          <div className="bg-slate-50/60 rounded-3xl border border-slate-200/80 p-4 sm:p-6 md:p-8">
            <RoadmapTimeline 
              phases={phases} 
              onEvidenceClick={(id) => setEvidenceMilestoneId(id)} 
              onDecisionClick={(phase) => setDecisionPhase(phase)} 
            />
          </div>
        </FadeIn>
      )}

      {/* Curated Learning Resources tailored to student gaps */}
      {skillResources.length > 0 && (
        <FadeIn delay={400}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2.5 text-indigo-950">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <h2 className="text-xl font-bold">Curated Learning Resources for Priority Gaps</h2>
              </div>
              <span className="self-start sm:self-auto text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-200">
                NPTEL • SWAYAM • Open Curricula
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillResources.map((sr: any) => (
                <div key={sr.skillId} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
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
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-indigo-50/60 border border-gray-200 hover:border-indigo-200 transition-colors group"
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

      {/* Decision Point Branching Modal */}
      <DecisionPointModal 
        isOpen={!!decisionPhase}
        phaseTitle={decisionPhase?.title || ''}
        options={decisionPhase?.decision_options || []}
        onClose={() => setDecisionPhase(null)}
        onSelect={handleDecisionSelect}
      />

      {/* Evidence Submission Verification Modal */}
      <EvidenceSubmitModal 
        isOpen={!!evidenceMilestoneId}
        milestoneId={evidenceMilestoneId}
        onClose={() => setEvidenceMilestoneId(null)}
        onSubmit={handleEvidenceSubmit}
      />
    </div>
  );
};

