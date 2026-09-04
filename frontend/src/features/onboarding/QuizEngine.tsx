import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FadeIn } from '../../components/animations/FadeIn';

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
    text: 'Which Python data type is used to store an unordered collection of unique values?',
    options: [
      { label: 'A', text: 'List' },
      { label: 'B', text: 'Tuple' },
      { label: 'C', text: 'Set' },
      { label: 'D', text: 'Dictionary' },
    ],
    correct_answer: 'C',
  },
  {
    id: 'q2',
    skill_id: 'skill-git',
    text: 'Which Git command is commonly used to create and switch to a new branch in one step?',
    options: [
      { label: 'A', text: 'git checkout -b <branch>' },
      { label: 'B', text: 'git branch --new <branch>' },
      { label: 'C', text: 'git push --set-upstream' },
      { label: 'D', text: 'git merge <branch>' },
    ],
    correct_answer: 'A',
  },
  {
    id: 'q3',
    skill_id: 'skill-machine-learning',
    text: 'Which type of machine learning uses labeled historical training data?',
    options: [
      { label: 'A', text: 'Unsupervised learning' },
      { label: 'B', text: 'Supervised learning' },
      { label: 'C', text: 'Reinforcement learning' },
      { label: 'D', text: 'Self-organizing maps' },
    ],
    correct_answer: 'B',
  },
  {
    id: 'q4',
    skill_id: 'skill-sql',
    text: 'Which SQL clause is used to filter aggregated group records?',
    options: [
      { label: 'A', text: 'WHERE' },
      { label: 'B', text: 'HAVING' },
      { label: 'C', text: 'GROUP BY' },
      { label: 'D', text: 'ORDER BY' },
    ],
    correct_answer: 'B',
  },
  {
    id: 'q5',
    skill_id: 'skill-statistics',
    text: 'Which measure represents the middle value of an ordered dataset?',
    options: [
      { label: 'A', text: 'Mean' },
      { label: 'B', text: 'Median' },
      { label: 'C', text: 'Variance' },
      { label: 'D', text: 'Standard Deviation' },
    ],
    correct_answer: 'B',
  },
];

export default function QuizEngine() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);

  const question = demoQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / demoQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!answers[question.id]) return;
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
    if (!answers[question.id]) return;

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
      session_id: id,
      total_questions: demoQuestions.length,
      correct_answers: correctCount,
      discrepancies: demoQuestions
        .filter(
          (item) =>
            answers[item.id] && answers[item.id] !== item.correct_answer
        )
        .map((item) => ({
          question_id: item.id,
          selected_option: answers[item.id],
          correct_option: item.correct_answer,
        })),
      submitted_answers: submittedAnswers,
    };

    localStorage.setItem('assessment_result', JSON.stringify(discrepancyData));

    setTimeout(() => {
      setLoading(false);
      setShowDiscrepancy(true);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Progress */}
      <FadeIn delay={100}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Question {currentQuestion + 1} of {demoQuestions.length}
            </span>
            <span className="text-xs font-bold text-saffron">
              {Math.round(progress)}% Completed
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-saffron transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </FadeIn>

      {/* Question Card */}
      <FadeIn delay={150}>
        <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-8 shadow-sm">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest text-[#000080] bg-blue-50 rounded-full uppercase">
            Diagnostic Verification
          </span>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
            {question.text}
          </h2>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.label;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAnswer(option.label)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3.5 ${
                    selected
                      ? 'border-saffron bg-saffron/10 text-gray-900 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-saffron text-gray-700'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      selected
                        ? 'bg-saffron text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="text-sm font-medium">{option.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:border-saffron disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>

            {currentQuestion < demoQuestions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!answers[question.id]}
                className="px-6 py-2.5 rounded-lg btn-saffron text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next Question →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!answers[question.id] || loading}
                className="px-6 py-2.5 rounded-lg btn-saffron text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Submitting...' : 'Submit Evaluation'}
              </button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Discrepancy Evaluation Modal */}
      {showDiscrepancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#EAE3B3] bg-[#FFFEF2] p-7 shadow-xl animate-fade-in-up">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 text-2xl font-bold">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-gray-900 font-heading">
                Assessment Evaluated
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Your diagnostic results have been calibrated against your baseline.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Questions:</span>
                <span className="font-bold text-gray-900">{demoQuestions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Correct Answers:</span>
                <span className="font-bold text-green-600">
                  {demoQuestions.filter((item) => answers[item.id] === item.correct_answer).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Identified Gaps:</span>
                <span className="font-bold text-saffron">
                  {demoQuestions.filter((item) => answers[item.id] && answers[item.id] !== item.correct_answer).length}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-saffron/30 bg-saffron/10 p-3">
              <p className="text-xs text-gray-700 leading-relaxed">
                ⚡ Your personalized prerequisite roadmap has been dynamically calculated to prioritize your skill gaps.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full btn-saffron py-3 font-bold text-sm rounded-xl"
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
