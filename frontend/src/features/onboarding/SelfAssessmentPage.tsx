import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FadeIn } from '../../components/animations/FadeIn';
import { skillGraphApi, assessmentApi, getStoredUser, setStoredUser, getStoredResume } from '../../services/api';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

type Rating = 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT';

interface SkillItem {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

interface RoleItem {
  id: string;
  name: string;
  description: string;
  skills: SkillItem[];
}

const DEFAULT_ROLES: RoleItem[] = [
  {
    id: 'role-backend',
    name: 'Backend Developer',
    description: 'Develops scalable APIs, databases and server-side applications.',
    skills: [
      { id: 'skill-prog-fund', name: 'Programming Fundamentals' },
      { id: 'skill-python', name: 'Python' },
      { id: 'skill-git', name: 'Git & GitHub' },
      { id: 'skill-http', name: 'HTTP & Web Architecture' },
      { id: 'skill-rest', name: 'REST API Design' },
      { id: 'skill-sql', name: 'SQL & Relational Databases' },
      { id: 'skill-docker', name: 'Docker Containerization' },
    ],
  },
  {
    id: 'role-ml',
    name: 'Machine Learning Engineer',
    description: 'Builds, evaluates and deploys machine learning and predictive models.',
    skills: [
      { id: 'skill-python', name: 'Python' },
      { id: 'skill-git', name: 'Git' },
      { id: 'skill-numpy', name: 'NumPy' },
      { id: 'skill-pandas', name: 'Pandas & Data Wrangling' },
      { id: 'skill-linalg', name: 'Linear Algebra' },
      { id: 'skill-ml-fund', name: 'Machine Learning Fundamentals' },
    ],
  },
  {
    id: 'role-cloud',
    name: 'Cloud Native & DevOps Engineer',
    description: 'Deploy resilient containerized workloads, configure automated CI/CD pipelines, and maintain cloud infrastructure.',
    skills: [
      { id: 'skill-linux', name: 'Linux Administration & Shell Scripting' },
      { id: 'skill-networking', name: 'Computer Networking & DNS Basics' },
      { id: 'skill-docker', name: 'Container Orchestration with Docker' },
      { id: 'skill-cicd', name: 'Automated CI/CD Pipelines' },
      { id: 'skill-k8s', name: 'Kubernetes Cluster Management' },
      { id: 'skill-terraform', name: 'Infrastructure as Code (Terraform)' },
    ],
  },
  {
    id: 'role-data',
    name: 'Data Science & Big Data Engineer',
    description: 'Extract transformative business intelligence, orchestrate reliable ETL data pipelines, and architect data analytics.',
    skills: [
      { id: 'skill-prob-stats', name: 'Probability & Descriptive Statistics' },
      { id: 'skill-adv-sql', name: 'Advanced SQL & Window Functions' },
      { id: 'skill-etl', name: 'Automated ETL Pipeline Engineering' },
      { id: 'skill-data-viz', name: 'Data Visualization & Storytelling' },
      { id: 'skill-spark', name: 'Distributed Processing with PySpark' },
      { id: 'skill-kafka-stream', name: 'Real-Time Event Streaming (Kafka)' },
    ],
  },
  {
    id: 'role-fullstack',
    name: 'Full-Stack Web Architect',
    description: 'Build rich user interfaces with React and connect them to performant distributed backend services.',
    skills: [
      { id: 'skill-html-css', name: 'Semantic HTML5 & Modern CSS3' },
      { id: 'skill-ts', name: 'TypeScript & Type Safety' },
      { id: 'skill-react', name: 'React Component Architecture & Hooks' },
      { id: 'skill-node-api', name: 'Backend API Integration (Node/Express)' },
      { id: 'skill-nextjs', name: 'Server-Side Rendering (Next.js)' },
      { id: 'skill-testing', name: 'Automated Testing & End-to-End' },
    ],
  },
  {
    id: 'role-security',
    name: 'Cybersecurity & Defensive Specialist',
    description: 'Analyze network vulnerabilities, implement zero-trust authentication protocols, and harden enterprise applications.',
    skills: [
      { id: 'skill-sec-net', name: 'Network Protocol & Packet Analysis' },
      { id: 'skill-crypto', name: 'Applied Cryptography Fundamentals' },
      { id: 'skill-owasp', name: 'Web Application Security (OWASP Top 10)' },
      { id: 'skill-iam', name: 'Identity & Access Management (OAuth/JWT)' },
      { id: 'skill-siem', name: 'Defensive SIEM & Threat Monitoring' },
      { id: 'skill-zero-trust', name: 'Zero-Trust Architecture & Hardening' },
    ],
  },
];

const ratingValues: Rating[] = [
  'BEGINNER',
  'AVERAGE',
  'GOOD',
  'EXPERT',
];

const ratingLabels: Record<Rating, string> = {
  BEGINNER: 'Beginner',
  AVERAGE: 'Average',
  GOOD: 'Good',
  EXPERT: 'Expert',
};

export const getRoleTranslationKey = (roleId: string): string => {
  if (roleId.includes('backend')) return 'backend';
  if (roleId.includes('ml')) return 'ml';
  if (roleId.includes('data')) return 'data';
  if (roleId.includes('cloud')) return 'cloud';
  if (roleId.includes('fullstack')) return 'fullstack';
  if (roleId.includes('security')) return 'security';
  return 'backend';
};

export default function SelfAssessmentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { selectedDomainId?: string; domainName?: string } | null;

  const storedResume = getStoredResume();
  const resumeRoleId = storedResume?.primaryMatch?.id;

  const initialRole = DEFAULT_ROLES.find(
    (r) =>
      r.id === navState?.selectedDomainId ||
      (navState?.selectedDomainId && (r.id.includes(navState.selectedDomainId.replace('domain-', '').replace('role-', '')) || navState.selectedDomainId.includes(r.id.replace('role-', '')))) ||
      (navState?.domainName && r.name.toLowerCase().includes(navState.domainName.toLowerCase())) ||
      (navState?.domainName && navState.domainName.toLowerCase().includes(r.name.toLowerCase().split(' ')[0])) ||
      (resumeRoleId && (r.id === resumeRoleId || r.id.includes(resumeRoleId.replace('role-', ''))))
  )?.id || DEFAULT_ROLES[0].id;

  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSkillInResume = (skillName: string): boolean => {
    if (!storedResume?.extractedSkills || storedResume.extractedSkills.length === 0) return false;
    const sLower = skillName.toLowerCase();
    return storedResume.extractedSkills.some((rs: string) => {
      const rLower = rs.toLowerCase();
      return sLower.includes(rLower) || rLower.includes(sLower);
    });
  };

  // Dynamically load skills for the selected role from skill graph API
  useEffect(() => {
    let mounted = true;
    async function fetchSkillsForRole() {
      try {
        const res = await skillGraphApi.getGraph(selectedRole);
        if (mounted && res.success && res.data?.skills && res.data.skills.length > 0) {
          const fetchedSkills: SkillItem[] = res.data.skills.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            description: s.description,
          }));

          setRoles((prev) =>
            prev.map((r) =>
              r.id === selectedRole ? { ...r, skills: fetchedSkills } : r
            )
          );
        }
      } catch (err) {
        console.warn('Skill graph fetch error:', err);
      }
    }
    fetchSkillsForRole();
    return () => { mounted = false; };
  }, [selectedRole]);

  const currentRole = roles.find((role) => role.id === selectedRole) || roles[0];

  // Pre-populate ratings from resume for detected skills
  useEffect(() => {
    if (!storedResume?.extractedSkills || storedResume.extractedSkills.length === 0) return;
    if (!currentRole?.skills || currentRole.skills.length === 0) return;

    setRatings((prev) => {
      let changed = false;
      const updated = { ...prev };
      currentRole.skills.forEach((sk) => {
        if (!updated[sk.id] && isSkillInResume(sk.name)) {
          updated[sk.id] = 'GOOD';
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [currentRole, selectedRole]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);
    setRatings({});
    setError('');
  };

  const handleRatingChange = (skillId: string, rating: Rating) => {
    setRatings((previous) => ({
      ...previous,
      [skillId]: rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError('Please select a career role.');
      return;
    }

    if (!currentRole) return;

    const missingSkills = currentRole.skills.filter((skill) => !ratings[skill.id]);

    if (missingSkills.length > 0) {
      setError('Please rate all skills before continuing to the quiz.');
      return;
    }

    setError('');
    setLoading(true);

    const user = getStoredUser();
    const studentId = user?.student_profile_id || user?.student_id || user?.id;

    const ratingPayload = currentRole.skills.map((skill) => ({
      skill_id: skill.id,
      rating: ratings[skill.id],
    }));

    try {
      // 1. Save self-assessment ratings to backend
      await assessmentApi.saveSelfRatings(selectedRole, ratingPayload, studentId);

      // Save locally as quick-access cache
      localStorage.setItem('self_assessment', JSON.stringify({
        role_id: selectedRole,
        role_name: currentRole.name,
        ratings: ratingPayload,
      }));

      // Update stored user object with selected career track
      if (user) {
        user.selected_role = currentRole.name;
        user.selected_role_id = selectedRole;
        setStoredUser(user);
      }

      // 2. Start calibrated assessment session on backend
      const startRes = await assessmentApi.startSession(selectedRole, studentId);
      const sessionId = startRes.success && startRes.data?.session_id
        ? startRes.data.session_id
        : `demo-session-${Date.now()}`;

      // Save session questions if provided
      if (startRes.success && startRes.data?.questions) {
        localStorage.setItem(`session_${sessionId}_questions`, JSON.stringify(startRes.data.questions));
      }

      navigate(`/assessment/quiz/${sessionId}`);
    } catch (err: any) {
      console.warn('Backend start assessment fallback:', err);
      const fallbackSessionId = `demo-session-${Date.now()}`;
      navigate(`/assessment/quiz/${fallbackSessionId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <FadeIn delay={100}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-saffron/10 text-saffron-600 text-xs font-bold uppercase tracking-wider mb-3 border border-saffron/30">
            {t('selfAssessment.stepBadge', 'Step 1 · Self Assessment')}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[#000080]">
            {t('selfAssessment.title', 'Evaluate Your Baseline Competencies')}
          </h1>

          <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl mx-auto leading-relaxed">
            {t('selfAssessment.subtitle', 'Select your target career role and honestly rate your familiarity with each core skill. This baseline will be calibrated against an adaptive diagnostic quiz.')}
          </p>
        </div>
      </FadeIn>

      {/* Resume Calibration Dependency Banner */}
      <FadeIn delay={130}>
        {storedResume && storedResume.extractedSkills && storedResume.extractedSkills.length > 0 ? (
          <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 border-2 border-emerald-300 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Resume Pre-Calibration
                  </span>
                  {storedResume.primaryMatch?.title && (
                    <span className="text-xs font-bold text-[#000080] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Aligned with {storedResume.primaryMatch.title}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  Detected skills pre-populated from <span className="underline underline-offset-2 text-emerald-800">{storedResume.fileName}</span>
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Core competencies matching your CV have been automatically pre-selected as "Good". Feel free to adjust any level before continuing to the diagnostic quiz.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50/40 border-2 border-amber-300 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Standard Baseline Mode
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  Upload your resume in Profile to automatically pre-populate verified skills
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Without a resume, please evaluate each capability manually to calibrate your diagnostic starting point.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="shrink-0 px-3.5 py-2 bg-saffron hover:bg-saffron-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Upload Resume
            </button>
          </div>
        )}
      </FadeIn>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <FadeIn delay={150}>
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              {t('selfAssessment.selectRole', 'Select Your Target Career Role')}
            </label>

            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            >
              {roles.map((role) => {
                const key = getRoleTranslationKey(role.id);
                return (
                  <option key={role.id} value={role.id}>
                    {t(`roles.${key}.name`, role.name)}
                  </option>
                );
              })}
            </select>

            {currentRole && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-[#EAE3B3]">
                <h2 className="font-bold text-gray-900 text-base">
                  {t(`roles.${getRoleTranslationKey(currentRole.id)}.name`, currentRole.name)}
                </h2>
                <p className="text-gray-600 text-xs mt-1">
                  {t(`roles.${getRoleTranslationKey(currentRole.id)}.description`, currentRole.description)}
                </p>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Skills Rating Grid */}
        {currentRole && (
          <FadeIn delay={200}>
            <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 font-heading">
                  {t('selfAssessment.rateProficiency', 'Rate Your Proficiency')} ({currentRole.skills.length})
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {t('selfAssessment.rateSubtitle', 'Select the level that best reflects your real-world capability today.')}
                </p>
              </div>

              <div className="space-y-5">
                {currentRole.skills.map((skill: SkillItem) => (
                  <div
                    key={skill.id}
                    className="border-b border-gray-200/70 pb-5 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">
                          {skill.name}
                        </span>
                        {isSkillInResume(skill.name) && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Detected in Resume
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-saffron bg-saffron/10 px-2.5 py-0.5 rounded-full">
                        {ratings[skill.id]
                          ? t(`selfAssessment.ratings.${ratings[skill.id].toLowerCase()}`, ratingLabels[ratings[skill.id]])
                          : t('selfAssessment.pending', 'Pending')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {ratingValues.map((rating) => {
                        const isSelected = ratings[skill.id] === rating;
                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRatingChange(skill.id, rating)}
                            className={`py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? 'bg-saffron text-white shadow-sm border border-saffron'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-saffron'
                            }`}
                          >
                            {t(`selfAssessment.ratings.${rating.toLowerCase()}`, ratingLabels[rating])}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 btn-saffron py-3.5 rounded-xl font-bold text-sm shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? t('selfAssessment.generatingQuiz', 'Generating Calibrated Quiz from Skill Graph...')
                  : t('selfAssessment.continueToQuiz', 'Continue to Diagnostic Quiz →')}
              </button>
            </div>
          </FadeIn>
        )}
      </form>
    </div>
  );
}
