import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Rating = 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT';

interface Skill {
  id: string;
  name: string;
}

const roles = [
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

  const [selectedRole, setSelectedRole] = useState('');
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentRole = roles.find(
    (role) => role.id === selectedRole
  );

  const handleRoleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const roleId = e.target.value;

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

    if (!currentRole) {
      return;
    }

    const missingSkills = currentRole.skills.filter(
      (skill) => !ratings[skill.id]
    );

    if (missingSkills.length > 0) {
      setError(
        'Please rate all skills before continuing.'
      );
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

    // Save assessment temporarily
    localStorage.setItem(
      'self_assessment',
      JSON.stringify(assessmentData)
    );

    // Temporary session ID until backend assessment API is connected
    const sessionId = `demo-session-${Date.now()}`;

    setTimeout(() => {
      setLoading(false);
      navigate(`/assessment/quiz/${sessionId}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0A111F] text-white">

      {/* Header */}
      <header className="border-b border-[#1F3152] bg-[#0D1728]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">⚡</span>

            <span className="text-xl font-bold">
              VIDYUT
            </span>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to Explore
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Heading */}
        <div className="text-center mb-10">

          <p className="text-[#FF9933] font-semibold text-sm mb-3">
            SELF ASSESSMENT
          </p>

          <h1 className="text-4xl font-bold">
            Discover Your Skill Level
          </h1>

          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Select a career role and honestly rate your current
            skills. Your answers will help Vidyut understand your
            strengths and identify areas for improvement.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {/* Role Selection */}
          <div className="bg-[#111D32] border border-[#1F3152] rounded-2xl p-6 mb-6">

            <label className="block text-sm font-semibold mb-3">
              Select Your Target Career Role
            </label>

            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full bg-[#0A111F] border border-[#334155] rounded-lg px-4 py-3 text-white outline-none focus:border-[#FF9933]"
            >
              <option value="">
                Select a career role...
              </option>

              {roles.map((role) => (
                <option
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </option>
              ))}
            </select>

            {currentRole && (
              <div className="mt-4 bg-[#0A111F] rounded-lg p-4 border border-[#263A5A]">
                <h2 className="font-semibold text-lg">
                  {currentRole.name}
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  {currentRole.description}
                </p>
              </div>
            )}

          </div>

          {/* Skills */}
          {currentRole && (
            <div className="bg-[#111D32] border border-[#1F3152] rounded-2xl p-6">

              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  Rate Your Skills
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Choose the level that best describes your
                  current ability.
                </p>
              </div>

              <div className="space-y-6">

                {currentRole.skills.map(
                  (skill: Skill) => (
                    <div
                      key={skill.id}
                      className="border-b border-[#1F3152] pb-6 last:border-b-0"
                    >

                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">
                          {skill.name}
                        </span>

                        <span className="text-[#FF9933] text-sm font-semibold">
                          {ratings[skill.id]
                            ? ratingLabels[
                                ratings[skill.id]
                              ]
                            : 'Not Rated'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                        {ratingValues.map(
                          (rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() =>
                                handleRatingChange(
                                  skill.id,
                                  rating
                                )
                              }
                              className={`py-2.5 rounded-lg border text-sm font-medium transition ${
                                ratings[skill.id] ===
                                rating
                                  ? 'bg-[#FF9933] border-[#FF9933] text-white'
                                  : 'bg-[#0A111F] border-[#334155] text-slate-300 hover:border-[#FF9933]'
                              }`}
                            >
                              {ratingLabels[rating]}
                            </button>
                          )
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-[#FF9933] hover:bg-[#e88722] text-white font-semibold py-3.5 rounded-lg transition disabled:opacity-50"
              >
                {loading
                  ? 'Preparing Assessment...'
                  : 'Continue to Quiz →'}
              </button>

            </div>
          )}

        </form>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F3152] bg-[#0D1728]">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative
        </div>
      </footer>

    </div>
  );
}