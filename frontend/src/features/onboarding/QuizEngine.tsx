import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Question {
  id: string;
  skill_id: string;
  text: string;
  options: {
    label: string;
    text: string;
  }[];
  correct_answer: string;
}

const demoQuestions: Question[] = [
  {
    id: 'q1',
    skill_id: 'skill-python',
    text: 'Which Python data type is used to store a collection of unique values?',
    options: [
      { label: 'A', text: 'List' },
      { label: 'B', text: 'Tuple' },
      { label: 'C', text: 'Set' },
      { label: 'D', text: 'String' },
    ],
    correct_answer: 'C',
  },
  {
    id: 'q2',
    skill_id: 'skill-git',
    text: 'Which Git command is commonly used to create a new branch?',
    options: [
      { label: 'A', text: 'git branch' },
      { label: 'B', text: 'git merge' },
      { label: 'C', text: 'git push' },
      { label: 'D', text: 'git clone' },
    ],
    correct_answer: 'A',
  },
  {
    id: 'q3',
    skill_id: 'skill-machine-learning',
    text: 'Which type of machine learning uses labelled training data?',
    options: [
      { label: 'A', text: 'Unsupervised learning' },
      { label: 'B', text: 'Supervised learning' },
      { label: 'C', text: 'Reinforcement learning' },
      { label: 'D', text: 'Random learning' },
    ],
    correct_answer: 'B',
  },
  {
    id: 'q4',
    skill_id: 'skill-sql',
    text: 'Which SQL command is used to retrieve data from a database?',
    options: [
      { label: 'A', text: 'INSERT' },
      { label: 'B', text: 'UPDATE' },
      { label: 'C', text: 'SELECT' },
      { label: 'D', text: 'DELETE' },
    ],
    correct_answer: 'C',
  },
  {
    id: 'q5',
    skill_id: 'skill-statistics',
    text: 'Which measure represents the middle value of an ordered dataset?',
    options: [
      { label: 'A', text: 'Mean' },
      { label: 'B', text: 'Median' },
      { label: 'C', text: 'Variance' },
      { label: 'D', text: 'Range' },
    ],
    correct_answer: 'B',
  },
];

export default function QuizEngine() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);

  const question = demoQuestions[currentQuestion];

  const progress =
    ((currentQuestion + 1) / demoQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!answers[question.id]) {
      return;
    }

    if (currentQuestion < demoQuestions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  const handleSubmit = () => {
    if (!answers[question.id]) {
      return;
    }

    setLoading(true);

    const submittedAnswers = demoQuestions.map((item) => ({
      question_id: item.id,
      selected_option: answers[item.id] || '',
      time_taken_secs: 0,
    }));

    const correctCount = demoQuestions.filter(
      (item) => answers[item.id] === item.correct_answer
    ).length;

    const discrepancyData = {
      session_id: sessionId,
      total_questions: demoQuestions.length,
      correct_answers: correctCount,
      discrepancies: demoQuestions
        .filter(
          (item) =>
            answers[item.id] &&
            answers[item.id] !== item.correct_answer
        )
        .map((item) => ({
          question_id: item.id,
          selected_option: answers[item.id],
          correct_option: item.correct_answer,
        })),
      submitted_answers: submittedAnswers,
    };

    localStorage.setItem(
      'assessment_result',
      JSON.stringify(discrepancyData)
    );

    setTimeout(() => {
      setLoading(false);
      setShowDiscrepancy(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#0A111F] text-white">

      {/* Header */}
      <header className="border-b border-[#1F3152] bg-[#0D1728]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">

          <button
            onClick={() => navigate('/assessment/self')}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">⚡</span>

            <span className="text-xl font-bold">
              VIDYUT
            </span>
          </button>

          <span className="text-sm text-slate-400">
            Career Assessment
          </span>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Progress */}
        <div className="mb-8">

          <div className="flex items-center justify-between mb-3">

            <span className="text-sm text-slate-400">
              Question {currentQuestion + 1} of{' '}
              {demoQuestions.length}
            </span>

            <span className="text-sm text-[#FF9933] font-semibold">
              {Math.round(progress)}%
            </span>

          </div>

          <div className="w-full h-2 bg-[#1F3152] rounded-full overflow-hidden">

            <div
              className="h-full bg-[#FF9933] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>

        {/* Question Card */}
        <div className="bg-[#111D32] border border-[#1F3152] rounded-2xl p-7 md:p-9">

          <p className="text-sm text-[#FF9933] font-semibold mb-4">
            Skill Assessment
          </p>

          <h1 className="text-2xl md:text-3xl font-bold leading-relaxed">
            {question.text}
          </h1>

          {/* Options */}
          <div className="mt-8 space-y-4">

            {question.options.map((option) => {

              const selected =
                answers[question.id] === option.label;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAnswer(option.label)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selected
                      ? 'border-[#FF9933] bg-[#FF9933]/10'
                      : 'border-[#334155] bg-[#0A111F] hover:border-[#FF9933]'
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        selected
                          ? 'bg-[#FF9933] text-white'
                          : 'bg-[#1F3152] text-slate-300'
                      }`}
                    >
                      {option.label}
                    </span>

                    <span className="text-slate-200">
                      {option.text}
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">

            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-5 py-3 rounded-lg border border-[#334155] text-slate-300 hover:border-[#FF9933] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>

            {currentQuestion < demoQuestions.length - 1 ? (

              <button
                type="button"
                onClick={handleNext}
                disabled={!answers[question.id]}
                className="px-6 py-3 rounded-lg bg-[#FF9933] hover:bg-[#e88722] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>

            ) : (

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!answers[question.id] || loading}
                className="px-6 py-3 rounded-lg bg-[#FF9933] hover:bg-[#e88722] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loading
                  ? 'Submitting...'
                  : 'Submit Assessment'}
              </button>

            )}

          </div>

        </div>

        {/* Information */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Answer each question based on your current
          knowledge. There is no negative marking.
        </p>

      </main>

      {/* Discrepancy Modal */}
      {showDiscrepancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-lg rounded-2xl border border-[#1F3152] bg-[#111D32] p-7 shadow-2xl">

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl">
                ✓
              </div>

              <h2 className="text-2xl font-bold">
                Assessment Complete
              </h2>

              <p className="mt-2 text-slate-400">
                Your assessment has been submitted successfully.
              </p>

            </div>

            {/* Result Summary */}
            <div className="mt-6 rounded-xl border border-[#334155] bg-[#0A111F] p-5">

              <h3 className="font-semibold text-white">
                Assessment Summary
              </h3>

              <div className="mt-4 space-y-3">

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Questions
                  </span>

                  <span className="font-semibold">
                    {demoQuestions.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Correct Answers
                  </span>

                  <span className="font-semibold text-green-400">
                    {demoQuestions.filter(
                      (item) =>
                        answers[item.id] === item.correct_answer
                    ).length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Incorrect Answers
                  </span>

                  <span className="font-semibold text-red-400">
                    {demoQuestions.filter(
                      (item) =>
                        answers[item.id] &&
                        answers[item.id] !== item.correct_answer
                    ).length}
                  </span>
                </div>

              </div>

            </div>

            {/* Discrepancy Explanation */}
            <div className="mt-6 rounded-xl border border-[#FF9933]/30 bg-[#FF9933]/10 p-4">

              <p className="text-sm text-slate-300">
                Your quiz performance will be compared with
                your self-assessment to identify skill
                discrepancies and improve your career roadmap.
              </p>

            </div>

            {/* Continue */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full rounded-xl bg-[#FF9933] py-3 font-semibold text-white transition hover:bg-[#e88722]"
            >
              Continue to Dashboard →
            </button>

          </div>

        </div>
      )}

    </div>
  );
}