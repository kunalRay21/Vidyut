import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FadeIn } from '../../components/animations/FadeIn';
import { ChevronDown, Check } from 'lucide-react';

type Rating = 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT';

interface Skill {
  id: string;
  name: string;
}

const CustomDropdown = ({ roles, selectedRole, onSelect }: { roles: any[], selectedRole: string, onSelect: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = roles.find(r => r.id === selectedRole);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#FFFEF2] border ${isOpen ? 'border-[#FF9933] ring-1 ring-[#FF9933]/30' : 'border-[#EAE3B3]'} rounded-xl px-4 py-3 text-left transition-all duration-200 shadow-sm hover:border-[#FF9933]/70 focus:outline-none focus:border-[#FF9933]`}
      >
        <span className={`block truncate ${!selected ? 'text-gray-400 font-medium' : 'text-[#000080] font-bold'}`}>
          {selected ? selected.name : "Select a career role..."}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#FF9933]' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-[#FFFEF2] border border-[#EAE3B3] rounded-xl shadow-lg py-1.5 max-h-60 overflow-auto">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => {
                onSelect(role.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150 ${
                selectedRole === role.id
                  ? 'bg-[#FF9933]/10 text-[#000080] font-bold'
                  : 'text-gray-700 font-medium hover:bg-[#EAE3B3]/30 hover:text-[#000080]'
              }`}
            >
              <span className="block truncate">{role.name}</span>
              {selectedRole === role.id && <Check className="w-4 h-4 text-[#FF9933] stroke-[3px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const roles = [
  {
    id: 'role-ml-engineer',
    name: 'Machine Learning Engineer',
    description:
      'Build and deploy machine learning models and intelligent applications.',
    skills: [
      { id: 'skill-python', name: 'Python' },
      { id: 'skill-git', name: 'Git & GitHub' },
      { id: 'skill-machine-learning', name: 'Machine Learning' },
      { id: 'skill-sql', name: 'SQL' },
      { id: 'skill-statistics', name: 'Statistics' },
    ],
  },
  {
    id: 'role-software-engineer',
    name: 'Software Engineer',
    description:
      'Design, develop and maintain scalable software applications.',
    skills: [
      { id: 'skill-java', name: 'Java' },
      { id: 'skill-dsa', name: 'Data Structures & Algorithms' },
      { id: 'skill-git', name: 'Git & GitHub' },
      { id: 'skill-sql', name: 'SQL' },
      { id: 'skill-oop', name: 'Object Oriented Programming' },
    ],
  },
  {
    id: 'role-data-scientist',
    name: 'Data Scientist',
    description:
      'Analyze data and build predictive models to solve real-world problems.',
    skills: [
      { id: 'skill-python', name: 'Python' },
      { id: 'skill-sql', name: 'SQL' },
      { id: 'skill-statistics', name: 'Statistics' },
      { id: 'skill-machine-learning', name: 'Machine Learning' },
      { id: 'skill-pandas', name: 'Pandas & Data Analysis' },
    ],
  },
  {
    id: 'role-cloud-engineer',
    name: 'Cloud Engineer',
    description:
      'Build, deploy and manage cloud-based infrastructure and applications.',
    skills: [
      { id: 'skill-linux', name: 'Linux' },
      { id: 'skill-docker', name: 'Docker' },
      { id: 'skill-cloud', name: 'Cloud Computing' },
      { id: 'skill-git', name: 'Git & GitHub' },
      { id: 'skill-networking', name: 'Networking' },
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

  const [selectedRole, setSelectedRole] = useState('role-ml-engineer');
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentRole = roles.find(
    (role) => role.id === selectedRole
  );

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    setRatings({});
    setError('');
  };

  const handleRatingChange = (
    skillId: string,
    rating: Rating
  ) => {
    setRatings((previous) => ({
      ...previous,
      [skillId]: rating,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError('Please select a career role.');
      return;
    }

    if (!currentRole) return;

    const missingSkills = currentRole.skills.filter(
      (skill) => !ratings[skill.id]
    );

    if (missingSkills.length > 0) {
      setError('Please rate all skills before continuing to the quiz.');
      return;
    }

    setError('');
    setLoading(true);

    const assessmentData = {
      role_id: selectedRole,
      ratings: currentRole.skills.map((skill) => ({
        skill_id: skill.id,
        rating: ratings[skill.id],
      })),
    };

    localStorage.setItem('self_assessment', JSON.stringify(assessmentData));

    const sessionId = `demo-session-${Date.now()}`;

    setTimeout(() => {
      setLoading(false);
      navigate(`/assessment/quiz/${sessionId}`);
    }, 400);
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

            <CustomDropdown 
              roles={roles} 
              selectedRole={selectedRole} 
              onSelect={handleRoleChange} 
            />

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
                  Rate Your Proficiency
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Select the level that best reflects your real-world capability today.
                </p>
              </div>

              <div className="space-y-5">
                {currentRole.skills.map((skill: Skill) => (
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
                            className={`py-2 rounded-lg text-xs font-semibold transition ${
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
                className="w-full mt-8 btn-saffron py-3.5 rounded-xl font-bold text-sm shadow-sm disabled:opacity-50"
              >
                {loading ? 'Generating Calibrated Quiz...' : 'Continue to Diagnostic Quiz →'}
              </button>
            </div>
          </FadeIn>
        )}
      </form>
    </div>
  );
}
