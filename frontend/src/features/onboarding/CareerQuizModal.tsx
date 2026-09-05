import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Compass, Brain, Server, Globe, Shield, BarChart3, Cloud } from 'lucide-react';

export interface CareerSuggestion {
  key: string;
  interestValue: string;
  title: string;
  matchScore: number;
  icon: any;
  description: string;
  rationale: string;
  topSkills: string[];
}

interface CareerQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCareer: (suggestion: CareerSuggestion) => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    text: string;
    category: 'AI_ML' | 'BACKEND' | 'FRONTEND' | 'CLOUD' | 'SECURITY' | 'DATA';
    icon?: any;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What kind of activities excite you the most?",
    subtitle: "Pick what naturally grabs your curiosity when using technology",
    options: [
      {
        label: "A",
        text: "Training smart bots, AI models, and making computers understand language or vision",
        category: "AI_ML",
      },
      {
        label: "B",
        text: "Building high-performance servers, databases, and writing the invisible logic behind apps",
        category: "BACKEND",
      },
      {
        label: "C",
        text: "Designing interactive visual interfaces, sleek web apps, and user experiences",
        category: "FRONTEND",
      },
      {
        label: "D",
        text: "Automating cloud systems, managing server uptime, and container deployments",
        category: "CLOUD",
      },
      {
        label: "E",
        text: "Catching cybersecurity flaws, ethical hacking, and defending systems from intruders",
        category: "SECURITY",
      },
      {
        label: "F",
        text: "Finding hidden patterns in numbers, analyzing trends, and building executive charts",
        category: "DATA",
      },
    ],
  },
  {
    id: 2,
    question: "Which type of problem would you enjoy solving on a weekend?",
    subtitle: "Think about where you'd lose track of time effortlessly",
    options: [
      {
        label: "A",
        text: "Teaching a machine learning model to predict cricket match results or stock prices",
        category: "AI_ML",
      },
      {
        label: "B",
        text: "Optimizing database queries so an API responds in 5 milliseconds instead of 500ms",
        category: "BACKEND",
      },
      {
        label: "C",
        text: "Recreating the clean UI and animations of Spotify, Airbnb, or Instagram",
        category: "FRONTEND",
      },
      {
        label: "D",
        text: "Setting up a private Linux server or automated build pipeline for your code",
        category: "CLOUD",
      },
      {
        label: "E",
        text: "Investigating how a website password was leaked and how to patch the vulnerability",
        category: "SECURITY",
      },
      {
        label: "F",
        text: "Transforming a messy spreadsheet into clean, insightful visual dashboards",
        category: "DATA",
      },
    ],
  },
  {
    id: 3,
    question: "What is your preferred style of thinking?",
    subtitle: "How your brain naturally likes to process challenges",
    options: [
      {
        label: "A",
        text: "Analytical & Experimental — I love testing hypotheses and seeing what algorithms learn",
        category: "AI_ML",
      },
      {
        label: "B",
        text: "Architectural & Structured — I like strict logic, reliable schemas, and clean rules",
        category: "BACKEND",
      },
      {
        label: "C",
        text: "Creative & User-Centered — I care deeply about how things look, feel, and flow",
        category: "FRONTEND",
      },
      {
        label: "D",
        text: "Scalability & Resilience — I focus on uptime, automation, and bulletproof infrastructure",
        category: "CLOUD",
      },
      {
        label: "E",
        text: "Investigative & Cautious — I like finding edge cases, loopholes, and protecting assets",
        category: "SECURITY",
      },
      {
        label: "F",
        text: "Storytelling with Data — I like translating complex data into clear business decisions",
        category: "DATA",
      },
    ],
  },
  {
    id: 4,
    question: "Which of these technologies or keywords sounds coolest to you?",
    subtitle: "Don't worry if you don't know them yet — which spark your interest?",
    options: [
      {
        label: "A",
        text: "Neural Networks, LLMs, Computer Vision, PyTorch, Transformers",
        category: "AI_ML",
      },
      {
        label: "B",
        text: "Distributed APIs, PostgreSQL, Redis Caching, Microservices, Go",
        category: "BACKEND",
      },
      {
        label: "C",
        text: "React, Next.js, Tailwind CSS, Smooth Animations, Web Design",
        category: "FRONTEND",
      },
      {
        label: "D",
        text: "Docker, Kubernetes, AWS Cloud, Terraform, Linux Terminal",
        category: "CLOUD",
      },
      {
        label: "E",
        text: "Penetration Testing, Kali Linux, Cryptography, Firewall Security",
        category: "SECURITY",
      },
      {
        label: "F",
        text: "SQL Queries, Power BI, Tableau, Pandas, Business Intelligence",
        category: "DATA",
      },
    ],
  },
  {
    id: 5,
    question: "What would make you proudest in your first job?",
    subtitle: "Imagine telling your friends and family what you built",
    options: [
      {
        label: "A",
        text: "\"I trained the AI model that powers our intelligent product features!\"",
        category: "AI_ML",
      },
      {
        label: "B",
        text: "\"I built the payment backend that processes 10,000 transactions per second without crashing!\"",
        category: "BACKEND",
      },
      {
        label: "C",
        text: "\"I built the web app that millions of customers use on their screens every day!\"",
        category: "FRONTEND",
      },
      {
        label: "D",
        text: "\"I automated the global cloud infrastructure that keeps the entire platform running 24/7!\"",
        category: "CLOUD",
      },
      {
        label: "E",
        text: "\"I defended our enterprise network and prevented unauthorized cyber intrusions!\"",
        category: "SECURITY",
      },
      {
        label: "F",
        text: "\"I built the analytics dashboards that the leadership team relies on to steer the company!\"",
        category: "DATA",
      },
    ],
  },
];

const CAREER_DEFINITIONS: Record<string, {
  title: string;
  interestValue: string;
  icon: any;
  description: string;
  rationale: string;
  topSkills: string[];
}> = {
  AI_ML: {
    title: "Artificial Intelligence & Machine Learning",
    interestValue: "AI/ML",
    icon: Brain,
    description: "Build intelligent systems, train predictive algorithms, and work with neural networks and generative AI.",
    rationale: "You demonstrated a strong appetite for experimentation, algorithmic learning, and working with intelligent autonomous systems.",
    topSkills: ["Python", "Machine Learning Fundamentals", "PyTorch / TensorFlow", "Data Preprocessing"],
  },
  BACKEND: {
    title: "Backend & Distributed Systems",
    interestValue: "Backend",
    icon: Server,
    description: "Design high-performance server architectures, robust databases, API layers, and transaction pipelines.",
    rationale: "Your choices highlight an affinity for solid architectural logic, database management, and building high-throughput systems.",
    topSkills: ["Node.js / Go", "PostgreSQL & SQL", "REST / gRPC APIs", "Redis Caching"],
  },
  FRONTEND: {
    title: "Full Stack & Web Application Development",
    interestValue: "Frontend",
    icon: Globe,
    description: "Create engaging user interfaces, modern responsive applications, and seamless end-to-end client experiences.",
    rationale: "You naturally lean towards visual design, user empathy, interactive animations, and responsive web technology.",
    topSkills: ["React / Next.js", "TypeScript", "Tailwind CSS", "REST API Integration"],
  },
  CLOUD: {
    title: "Cloud Computing & DevOps Architecture",
    interestValue: "Cloud",
    icon: Cloud,
    description: "Automate delivery pipelines, containerize microservices, and operate secure cloud infrastructure.",
    rationale: "Your answers show a love for automation, terminal scripting, zero-downtime reliability, and scalable infrastructure.",
    topSkills: ["Docker & Containers", "Kubernetes", "AWS / Azure Cloud", "Linux Administration"],
  },
  SECURITY: {
    title: "Cybersecurity & Ethical Defense",
    interestValue: "Cyber Security",
    icon: Shield,
    description: "Protect systems, identify software vulnerabilities, and ensure information security against modern threats.",
    rationale: "You showed great interest in investigative problem-solving, security protocols, and protecting digital assets.",
    topSkills: ["Network Security", "Linux Systems", "Cryptography Basics", "Vulnerability Scanning"],
  },
  DATA: {
    title: "Data Science & Business Analytics",
    interestValue: "Data Science",
    icon: BarChart3,
    description: "Extract actionable insights from raw data, build interactive dashboards, and drive business strategies.",
    rationale: "You enjoy finding actionable stories in datasets, statistical reasoning, and building visual intelligence reports.",
    topSkills: ["SQL & Data Modeling", "Python (Pandas)", "Power BI / Tableau", "Statistics"],
  },
};

export const CareerQuizModal: React.FC<CareerQuizModalProps> = ({
  isOpen,
  onClose,
  onApplyCareer,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [suggestion, setSuggestion] = useState<CareerSuggestion | null>(null);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (category: string) => {
    const nextAnswers = { ...answers, [currentQ.id]: category };
    setAnswers(nextAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate scores
      calculateResults(nextAnswers);
    }
  };

  const calculateResults = (allAnswers: Record<number, string>) => {
    const tallies: Record<string, number> = {
      AI_ML: 0,
      BACKEND: 0,
      FRONTEND: 0,
      CLOUD: 0,
      SECURITY: 0,
      DATA: 0,
    };

    Object.values(allAnswers).forEach((cat) => {
      if (tallies[cat] !== undefined) {
        tallies[cat] += 20;
      }
    });

    // Find highest category
    let topCat = 'AI_ML';
    let maxScore = -1;

    Object.entries(tallies).forEach(([cat, score]) => {
      if (score > maxScore) {
        maxScore = score;
        topCat = cat;
      }
    });

    // Ensure realistic match percentage between 85% and 97%
    const calculatedPercentage = Math.min(97, Math.max(86, 75 + maxScore));
    const def = CAREER_DEFINITIONS[topCat] || CAREER_DEFINITIONS.AI_ML;

    setSuggestion({
      key: topCat,
      interestValue: def.interestValue,
      title: def.title,
      matchScore: calculatedPercentage,
      icon: def.icon,
      description: def.description,
      rationale: def.rationale,
      topSkills: def.topSkills,
    });
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setSuggestion(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFED] border border-[#EAE3B3] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/80 bg-white/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-saffron-100 text-saffron-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 font-heading">
                1-Minute Career Discovery Quiz
              </h3>
              <p className="text-[11px] text-gray-500">
                5 quick questions to match your natural strengths with the best Vidyut career track
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!suggestion ? (
            <div>
              {/* Progress Bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1.5">
                  <span className="text-saffron-700">Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</span>
                  <span>{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-saffron rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Header */}
              <div className="mb-4">
                <h4 className="text-base sm:text-lg font-bold text-gray-950 font-heading">
                  {currentQ.question}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {currentQ.subtitle}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.category;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectOption(opt.category)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-saffron bg-saffron-50/80 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-saffron/60 hover:bg-saffron-50/30'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-saffron text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Step Navigation Back Button */}
              {currentStep > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Question</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{suggestion.matchScore}% Match Found!</span>
              </span>

              <h3 className="text-xl font-extrabold text-gray-950 font-heading">
                {suggestion.title}
              </h3>

              <p className="text-xs text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                {suggestion.description}
              </p>

              {/* Why this fits */}
              <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200/80 text-left text-xs">
                <p className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-saffron" />
                  <span>Why this fits you:</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {suggestion.rationale}
                </p>

                <div className="mt-3 pt-2.5 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Recommended Core Skills to Start With:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestion.topSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md text-[11px] font-semibold border border-gray-200"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => onApplyCareer(suggestion)}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-saffron hover:bg-saffron-600 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select & Auto-fill Registration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold transition cursor-pointer"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
