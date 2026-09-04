import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FadeIn } from '../../components/animations/FadeIn';
import { roles } from './SelfAssessmentPage';
import { MOCK_STUDENT_PROFILE } from '../../mocks/studentSessionMock';

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

const questionBank: Record<string, Question> = {
  'skill-python': {
    id: 'q-python',
    skill_id: 'skill-python',
    text: 'Which Python data type is used to store an unordered collection of unique values?',
    options: [
      { label: 'A', text: 'List' }, { label: 'B', text: 'Tuple' },
      { label: 'C', text: 'Set' }, { label: 'D', text: 'Dictionary' },
    ],
    correct_answer: 'C',
  },
  'skill-git': {
    id: 'q-git',
    skill_id: 'skill-git',
    text: 'Which Git command is commonly used to create and switch to a new branch in one step?',
    options: [
      { label: 'A', text: 'git checkout -b <branch>' }, { label: 'B', text: 'git branch --new <branch>' },
      { label: 'C', text: 'git push --set-upstream' }, { label: 'D', text: 'git merge <branch>' },
    ],
    correct_answer: 'A',
  },
  'skill-machine-learning': {
    id: 'q-ml',
    skill_id: 'skill-machine-learning',
    text: 'Which type of machine learning uses labeled historical training data?',
    options: [
      { label: 'A', text: 'Unsupervised learning' }, { label: 'B', text: 'Supervised learning' },
      { label: 'C', text: 'Reinforcement learning' }, { label: 'D', text: 'Self-organizing maps' },
    ],
    correct_answer: 'B',
  },
  'skill-sql': {
    id: 'q-sql',
    skill_id: 'skill-sql',
    text: 'Which SQL clause is used to filter aggregated group records?',
    options: [
      { label: 'A', text: 'WHERE' }, { label: 'B', text: 'HAVING' },
      { label: 'C', text: 'GROUP BY' }, { label: 'D', text: 'ORDER BY' },
    ],
    correct_answer: 'B',
  },
  'skill-statistics': {
    id: 'q-stats',
    skill_id: 'skill-statistics',
    text: 'Which measure represents the middle value of an ordered dataset?',
    options: [
      { label: 'A', text: 'Mean' }, { label: 'B', text: 'Median' },
      { label: 'C', text: 'Variance' }, { label: 'D', text: 'Standard Deviation' },
    ],
    correct_answer: 'B',
  },
  'skill-java': {
    id: 'q-java',
    skill_id: 'skill-java',
    text: 'Which keyword in Java is used to inherit a class?',
    options: [
      { label: 'A', text: 'implement' }, { label: 'B', text: 'extends' },
      { label: 'C', text: 'inherits' }, { label: 'D', text: 'super' },
    ],
    correct_answer: 'B',
  },
  'skill-dsa': {
    id: 'q-dsa',
    skill_id: 'skill-dsa',
    text: 'Which data structure follows the First In First Out (FIFO) principle?',
    options: [
      { label: 'A', text: 'Stack' }, { label: 'B', text: 'Tree' },
      { label: 'C', text: 'Queue' }, { label: 'D', text: 'Graph' },
    ],
    correct_answer: 'C',
  },
  'skill-oop': {
    id: 'q-oop',
    skill_id: 'skill-oop',
    text: 'Which OOP principle is demonstrated by hiding internal state and requiring all interaction to be performed through an object\'s methods?',
    options: [
      { label: 'A', text: 'Inheritance' }, { label: 'B', text: 'Polymorphism' },
      { label: 'C', text: 'Encapsulation' }, { label: 'D', text: 'Abstraction' },
    ],
    correct_answer: 'C',
  },
  'skill-pandas': {
    id: 'q-pandas',
    skill_id: 'skill-pandas',
    text: 'In Pandas, what is the primary 2-dimensional data structure called?',
    options: [
      { label: 'A', text: 'Series' }, { label: 'B', text: 'Array' },
      { label: 'C', text: 'DataFrame' }, { label: 'D', text: 'Table' },
    ],
    correct_answer: 'C',
  },
  'skill-linux': {
    id: 'q-linux',
    skill_id: 'skill-linux',
    text: 'Which Linux command is used to list directory contents with detailed permissions?',
    options: [
      { label: 'A', text: 'ls -a' }, { label: 'B', text: 'ls -l' },
      { label: 'C', text: 'dir /w' }, { label: 'D', text: 'cd -' },
    ],
    correct_answer: 'B',
  },
  'skill-docker': {
    id: 'q-docker',
    skill_id: 'skill-docker',
    text: 'Which file contains instructions to build a Docker image?',
    options: [
      { label: 'A', text: 'docker.yaml' }, { label: 'B', text: 'Dockerbuild' },
      { label: 'C', text: 'Dockerfile' }, { label: 'D', text: 'docker-compose' },
    ],
    correct_answer: 'C',
  },
  'skill-cloud': {
    id: 'q-cloud',
    skill_id: 'skill-cloud',
    text: 'Which cloud service model provides a platform allowing customers to develop, run, and manage applications without the complexity of building infrastructure?',
    options: [
      { label: 'A', text: 'IaaS' }, { label: 'B', text: 'PaaS' },
      { label: 'C', text: 'SaaS' }, { label: 'D', text: 'FaaS' },
    ],
    correct_answer: 'B',
  },
  'skill-networking': {
    id: 'q-networking',
    skill_id: 'skill-networking',
    text: 'Which protocol is used to securely browse the web?',
    options: [
      { label: 'A', text: 'HTTP' }, { label: 'B', text: 'FTP' },
      { label: 'C', text: 'HTTPS' }, { label: 'D', text: 'SSH' },
    ],
    correct_answer: 'C',
  }
};

export default function QuizEngine() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);

  // Load questions dynamically based on selected role's skills
  useEffect(() => {
    const saved = localStorage.getItem('self_assessment');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const questions: Question[] = [];
        if (data.ratings) {
          data.ratings.forEach((r: any) => {
            if (questionBank[r.skill_id]) {
              questions.push(questionBank[r.skill_id]);
            }
          });
        }
        if (questions.length > 0) {
          setActiveQuestions(questions);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback if no valid assessment data is found (defaults to ML Engineer prototype)
    setActiveQuestions([
      questionBank['skill-python'],
      questionBank['skill-git'],
      questionBank['skill-machine-learning'],
      questionBank['skill-sql'],
      questionBank['skill-statistics']
    ]);
  }, []);

  if (activeQuestions.length === 0) return null;

  const question = activeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / activeQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!answers[question.id]) return;
    if (currentQuestion < activeQuestions.length - 1) {
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

    const submittedAnswers = activeQuestions.map((item) => ({
      question_id: item.id,
      selected_option: answers[item.id] || '',
      time_taken_secs: 0,
    }));

    const correctCount = activeQuestions.filter(
      (item) => answers[item.id] === item.correct_answer
    ).length;

    const discrepancyData = {
      session_id: id,
      total_questions: activeQuestions.length,
      correct_answers: correctCount,
      discrepancies: activeQuestions
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

  const handleContinue = () => {
    const saved = localStorage.getItem('self_assessment');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const selectedRoleId = data.role_id;
        const role = roles.find(r => r.id === selectedRoleId);
        
        if (role) {
          MOCK_STUDENT_PROFILE.selected_role = role.name;
          
          const newSkills = role.skills.map((skill, index) => {
            const userRating = data.ratings.find((r: any) => r.skill_id === skill.id)?.rating || 'BEGINNER';
            
            let baseProgress = 0;
            let currentLevel = 0;
            switch(userRating) {
              case 'BEGINNER': baseProgress = 20; currentLevel = 1; break;
              case 'AVERAGE': baseProgress = 50; currentLevel = 2; break;
              case 'GOOD': baseProgress = 75; currentLevel = 3; break;
              case 'EXPERT': baseProgress = 90; currentLevel = 4; break;
            }
            
            const questionForSkill = activeQuestions.find(q => q.skill_id === skill.id);
            if (questionForSkill) {
               const isCorrect = answers[questionForSkill.id] === questionForSkill.correct_answer;
               if (isCorrect) {
                 baseProgress = Math.min(100, baseProgress + 15);
                 currentLevel = Math.min(4, currentLevel + 1);
               } else {
                 baseProgress = Math.max(0, baseProgress - 15);
                 currentLevel = Math.max(0, currentLevel - 1);
               }
            }
            
            const stepNum = Math.min(5, Math.floor(1 + (index * 5) / role.skills.length));
            
            return {
              id: skill.id.replace('skill-', ''),
              name: skill.name,
              progress: baseProgress,
              currentLevel,
              roadmap_id: `step${stepNum}`
            };
          });
          
          MOCK_STUDENT_PROFILE.skills = newSkills;
          
          const correctCount = activeQuestions.filter((item) => answers[item.id] === item.correct_answer).length;
          MOCK_STUDENT_PROFILE.readiness_pct = Math.round((correctCount / activeQuestions.length) * 100);
        }
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/dashboard');
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
                <span className="font-bold text-gray-900">{activeQuestions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Correct Answers:</span>
                <span className="font-bold text-green-600">
                  {activeQuestions.filter((item) => answers[item.id] === item.correct_answer).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Identified Gaps:</span>
                <span className="font-bold text-saffron">
                  {activeQuestions.filter((item) => answers[item.id] && answers[item.id] !== item.correct_answer).length}
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
              onClick={handleContinue}
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
