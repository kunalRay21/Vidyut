import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FadeIn } from '../components/animations/FadeIn';
import { CheckCircle2, ChevronRight, X, Timer, Check, XCircle, ArrowRight, Award } from 'lucide-react';
import { MOCK_STUDENT_PROFILE } from '../mocks/studentSessionMock';

export const AssessmentQuizPage: React.FC = () => {
  const { skillId = 'Python' } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds

  useEffect(() => {
    if (isCompleted) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isCompleted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const questions = [
    {
      id: 1,
      question: `What is the output of the following Python code?\n\nprint(type([]) is list)`,
      options: ['True', 'False', 'TypeError', 'None'],
      correct: 0
    },
    {
      id: 2,
      question: `Which of the following is NOT a core data type in Python?`,
      options: ['List', 'Dictionary', 'Class', 'Tuple'],
      correct: 2
    },
    {
      id: 3,
      question: `How do you create a virtual environment in Python 3?`,
      options: ['python -m venv env', 'python -make env', 'pip install venv', 'virtualenv create env'],
      correct: 0
    }
  ];

  const handleNext = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (isCompleted) {
    const score = answers.reduce((acc, curr, idx) => acc + (curr === questions[idx].correct ? 1 : 0), 0);
    const scorePct = Math.round((score / questions.length) * 100);

    const handleContinue = () => {
      // Mock update to global profile readiness
      MOCK_STUDENT_PROFILE.readiness_pct = 19.0;
      navigate('/dashboard');
    };

    return (
      <div className="max-w-3xl mx-auto p-6 py-12 space-y-8">
        <FadeIn delay={100} className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 text-[#138808] rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-[#000080]">Calibration Assessment Complete</h1>
          <p className="text-gray-600 text-lg">
            You scored <strong className="text-[#138808]">{score}/{questions.length}</strong> ({scorePct}%)
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="bg-[#FFFFED] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-[#FEFCE2] rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Calibration Outcome</h2>
              <p className="text-gray-600 mb-4">Your <span className="font-semibold capitalize">{skillId}</span> calibration has been updated based on your performance.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block text-sm text-gray-500 mb-1">Previous Readiness</span>
                  <span className="text-2xl font-bold text-gray-700">14%</span>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <span className="block text-sm text-green-700 mb-1">Updated Readiness</span>
                  <span className="text-2xl font-bold text-[#138808]">19%</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <h3 className="font-bold text-gray-800 text-lg">Question Review</h3>
              
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isCorrect = answers[idx] === q.correct;
                  return (
                    <FadeIn key={q.id} delay={300 + idx * 100}>
                      <div className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'border-l-[#138808] bg-green-50/50' : 'border-l-[#FF9933] bg-orange-50/50'} border border-gray-100`}>
                        <p className="font-medium text-gray-900 mb-3 whitespace-pre-wrap text-sm">
                          {idx + 1}. {q.question}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className={`flex items-start gap-2 ${isCorrect ? 'text-[#138808]' : 'text-[#FF9933]'}`}>
                            {isCorrect ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                            <div>
                              <span className="font-semibold">Your Answer: </span>
                              {q.options[answers[idx]]}
                            </div>
                          </div>
                          
                          {!isCorrect && (
                            <div className="flex items-start gap-2 text-gray-600 mt-1">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                              <div>
                                <span className="font-semibold">Correct Answer: </span>
                                {q.options[q.correct]}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 bg-[#FEFCE2] border-t border-gray-200 flex justify-center rounded-b-xl">
              <button 
                onClick={handleContinue}
                className="bg-[#000080] text-white px-8 py-3 rounded-md font-bold hover:bg-blue-900 transition-colors flex items-center gap-2"
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 py-12 space-y-8">
      <FadeIn delay={100}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#000080]">Calibration Assessment</h1>
            <p className="text-gray-500 mt-2">Skill: <span className="font-semibold text-gray-800 capitalize">{skillId}</span></p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="bg-[#FFFFED] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-[#FEFCE2] flex justify-between items-center rounded-t-xl">
            <div className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="flex items-center gap-2 text-[#FF9933] font-semibold text-sm bg-[#FF9933]/10 px-3 py-1.5 rounded-md">
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-200">
            <div 
              className="h-full bg-[#138808] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8">
            <h2 className="text-xl font-medium text-gray-900 mb-6 whitespace-pre-wrap">
              {questions[currentQuestion].question}
            </h2>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                    selectedAnswer === index 
                      ? 'border-[#000080] bg-blue-50 text-[#000080]' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  {selectedAnswer === index && <CheckCircle2 className="w-5 h-5 text-[#000080]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-[#FEFCE2] border-t border-gray-200 flex justify-end rounded-b-xl">
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className={`px-6 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors ${
                selectedAnswer !== null 
                  ? 'bg-[#000080] hover:bg-blue-900 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentQuestion === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
              {currentQuestion !== questions.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};
