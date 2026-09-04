import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FadeIn } from '../../components/animations/FadeIn';
import { skillGraphApi, assessmentApi, getStoredUser } from '../../services/api';

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

export default function SelfAssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { selectedDomainId?: string; domainName?: string } | null;
  const initialRole = DEFAULT_ROLES.find(
    (r) =>
      r.id === navState?.selectedDomainId ||
      (navState?.domainName && r.name.toLowerCase().includes(navState.domainName.toLowerCase()))
  )?.id || DEFAULT_ROLES[0].id;

  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    const studentId = user?.id || user?.student_id || 'student-demo';

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
            Step 1 · Self Assessment
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[#000080]">
            Evaluate Your Baseline Competencies
          </h1>

          <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl mx-auto leading-relaxed">
            Select your target career role and honestly rate your familiarity with each core skill. This baseline will be calibrated against an adaptive diagnostic quiz.
          </p>
        </div>
      </FadeIn>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <FadeIn delay={150}>
          <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Select Your Target Career Role
            </label>

            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            {currentRole && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-[#EAE3B3]">
                <h2 className="font-bold text-gray-900 text-base">
                  {currentRole.name}
                </h2>
                <p className="text-gray-600 text-xs mt-1">
                  {currentRole.description}
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
                  Rate Your Proficiency ({currentRole.skills.length} Skills Identified)
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Select the level that best reflects your real-world capability today.
                </p>
              </div>

              <div className="space-y-5">
                {currentRole.skills.map((skill: SkillItem) => (
                  <div
                    key={skill.id}
                    className="border-b border-gray-200/70 pb-5 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm text-gray-800">
                        {skill.name}
                      </span>
                      <span className="text-xs font-bold text-saffron bg-saffron/10 px-2.5 py-0.5 rounded-full">
                        {ratings[skill.id] ? ratingLabels[ratings[skill.id]] : 'Pending'}
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
                            {ratingLabels[rating]}
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
                {loading ? 'Generating Calibrated Quiz from Skill Graph...' : 'Continue to Diagnostic Quiz →'}
              </button>
            </div>
          </FadeIn>
        )}
      </form>
    </div>
  );
}
