import { useNavigate, Link } from 'react-router-dom';

export default function StudentDashboardPage() {
  const navigate = useNavigate();

  // Load state from localStorage or use defaults
  const userJson = localStorage.getItem('demo_user');
  const user = userJson
    ? JSON.parse(userJson)
    : {
        full_name: 'Priya Sharma',
        institution: 'VIT Chennai',
        degree: 'B.Tech CSE',
        year_of_study: 2,
        interests: ['AI/ML', 'Backend', 'Cloud'],
      };

  const assessmentJson = localStorage.getItem('assessment_result');
  const assessment = assessmentJson ? JSON.parse(assessmentJson) : null;

  const selfAssessmentJson = localStorage.getItem('self_assessment');
  const selfAssessment = selfAssessmentJson ? JSON.parse(selfAssessmentJson) : null;

  const readinessScore = assessment
    ? Math.round((assessment.correct_answers / assessment.total_questions) * 100)
    : 68;

  return (
    <div className="min-h-screen bg-[#0A111F] text-white">
      {/* Header */}
      <header className="border-b border-[#1F3152] bg-[#0D1728]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold tracking-tight">VIDYUT</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">
              Welcome, <strong className="text-white">{user.full_name}</strong>
            </span>
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 rounded-lg bg-[#FF9933] hover:bg-[#e88722] text-sm font-semibold transition"
            >
              Explore Domains
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome Banner */}
        <div className="bg-[#111D32] border border-[#1F3152] rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9933]/15 text-[#FF9933] text-xs font-semibold mb-3 border border-[#FF9933]/30">
                Student Progression Dashboard
              </div>
              <h1 className="text-3xl font-bold">{user.full_name}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {user.institution} · {user.degree} · Year {user.year_of_study}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center px-5 py-3 rounded-xl bg-[#0A111F] border border-[#1F3152]">
                <p className="text-xs text-slate-400">Readiness Score</p>
                <p className="text-3xl font-extrabold text-[#FF9933]">{readinessScore}%</p>
              </div>
              <div className="text-center px-5 py-3 rounded-xl bg-[#0A111F] border border-[#1F3152]">
                <p className="text-xs text-slate-400">Cohort Status</p>
                <p className="text-sm font-bold text-green-400 mt-2">
                  {readinessScore >= 75 ? 'Ready Now' : readinessScore >= 50 ? 'Almost Ready' : 'Needs Foundation'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Evaluation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-[#111D32] border border-[#1F3152] rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
              <span>Diagnostic Assessment Evaluation</span>
              {assessment && (
                <span className="text-xs font-normal text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  Completed Session
                </span>
              )}
            </h2>

            {assessment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0A111F] p-4 rounded-xl border border-[#1F3152]">
                    <p className="text-xs text-slate-400">Questions</p>
                    <p className="text-2xl font-bold mt-1">{assessment.total_questions}</p>
                  </div>
                  <div className="bg-[#0A111F] p-4 rounded-xl border border-[#1F3152]">
                    <p className="text-xs text-slate-400">Correct Answers</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{assessment.correct_answers}</p>
                  </div>
                  <div className="bg-[#0A111F] p-4 rounded-xl border border-[#1F3152]">
                    <p className="text-xs text-slate-400">Calibration Gaps</p>
                    <p className="text-2xl font-bold text-saffron mt-1">
                      {assessment.discrepancies ? assessment.discrepancies.length : 0}
                    </p>
                  </div>
                </div>

                {assessment.discrepancies && assessment.discrepancies.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <h3 className="text-sm font-semibold text-orange-300 mb-2">
                      ⚡ Calibrated Skill Discrepancies
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {assessment.discrepancies.length} discrepancy detected between self-assessment rating and quiz response accuracy. Your prerequisite roadmap is being adjusted to reinforce these key concepts.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-4">
                  You haven't completed a diagnostic assessment yet.
                </p>
                <Link
                  to="/assessment/self"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#FF9933] hover:bg-[#e88722] text-sm font-semibold transition"
                >
                  Start Diagnostic Assessment →
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions & Portal Links */}
          <div className="bg-[#111D32] border border-[#1F3152] rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Quick Navigation</h2>
            <div className="space-y-3">
              <Link
                to="/explore"
                className="block p-3 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-[#FF9933] transition"
              >
                <div className="font-semibold text-sm">Career Domains</div>
                <div className="text-xs text-slate-400 mt-0.5">Explore high-demand tech stacks</div>
              </Link>
              <Link
                to="/assessment/self"
                className="block p-3 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-[#FF9933] transition"
              >
                <div className="font-semibold text-sm">Self-Assessment</div>
                <div className="text-xs text-slate-400 mt-0.5">Rate role-specific skill competencies</div>
              </Link>
              <Link
                to="/institution/dashboard"
                className="block p-3 rounded-xl bg-[#0A111F] border border-[#1F3152] hover:border-blue-500 transition"
              >
                <div className="font-semibold text-sm">Institution Dashboard</div>
                <div className="text-xs text-slate-400 mt-0.5">View college cohort readiness metrics</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Target Role & Skills */}
        {selfAssessment && (
          <div className="bg-[#111D32] border border-[#1F3152] rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Assessed Target Role Skills</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {selfAssessment.ratings.map((r: { skill_id: string; rating: string }) => (
                <div key={r.skill_id} className="p-3 bg-[#0A111F] border border-[#1F3152] rounded-xl">
                  <p className="text-xs text-slate-400 truncate">{r.skill_id.replace('skill-', '').toUpperCase()}</p>
                  <p className="text-sm font-semibold text-[#FF9933] mt-1">{r.rating}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F3152] bg-[#0D1728]">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative
        </div>
      </footer>
    </div>
  );
}
