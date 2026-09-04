export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface HelpQuestion {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  tags: string[];
  actionLink?: {
    label: string;
    url: string;
  };
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'roadmaps',
    name: 'Roadmaps & Milestones',
    icon: '🗺️',
    description: 'Career progression DAGs, milestones, statuses, and technology branches.',
  },
  {
    id: 'assessments',
    name: 'Skill Assessments & Scoring',
    icon: '📝',
    description: 'Proficiency evaluation, retakes, accuracy metrics, and difficulty tiers.',
  },
  {
    id: 'opportunities',
    name: 'Opportunity Matching & Scores',
    icon: '🎯',
    description: 'Compatibility scoring formula, Readiness segments, and AI match explanations.',
  },
  {
    id: 'resources',
    name: 'Learning Resources & Courses',
    icon: '📚',
    description: 'Free accredited courses, NPTEL, SWAYAM, MIT OCW, and skill gap priorities.',
  },
  {
    id: 'institutions',
    name: 'Universities & Industry Talent',
    icon: '🏛️',
    description: 'Talent pool discovery, institutional dashboards, and verified digital portfolios.',
  },
  {
    id: 'account',
    name: 'Account, Profile & Navigation',
    icon: '⚙️',
    description: 'Changing study details, switching career tracks, and session troubleshooting.',
  },
];

export const HELP_QUESTIONS: HelpQuestion[] = [
  // =========================================================================
  // ROADMAPS & MILESTONES
  // =========================================================================
  {
    id: 'rm-1',
    categoryId: 'roadmaps',
    question: 'How is my personalized career roadmap generated?',
    answer:
      'Your roadmap is dynamically generated from your target career role (such as Backend Developer or Machine Learning Engineer) and your initial skill assessment. Vidyut\'s Directed Acyclic Graph (DAG) evaluates your assessed proficiency, determines prerequisite dependencies, and sequences your learning milestones so foundational skills are acquired before advanced architectures.',
    tags: ['roadmap', 'dag', 'milestones', 'prerequisites', 'role', 'generation'],
    actionLink: { label: 'View Your Roadmap', url: '/roadmap' },
  },
  {
    id: 'rm-2',
    categoryId: 'roadmaps',
    question: 'What do the milestone statuses mean (Not Started, In Progress, Completed)?',
    answer:
      '• NOT_STARTED: Upcoming milestones in your career progression that unlock as prerequisite skills are satisfied.\n• IN_PROGRESS: The current active milestone you are studying or preparing to assess.\n• COMPLETED: Milestones where you have successfully demonstrated the required proficiency level through verified assessments.',
    tags: ['status', 'milestones', 'progress', 'completed', 'in progress', 'not started'],
    actionLink: { label: 'Check Milestone Statuses', url: '/roadmap' },
  },
  {
    id: 'rm-3',
    categoryId: 'roadmaps',
    question: 'How do technology branches and decision points work?',
    answer:
      'Certain career roles feature alternative technical paths called Technology Branches (for example, choosing FastAPI vs Django in Backend Engineering, or PyTorch vs TensorFlow in Machine Learning). When your roadmap reaches a Decision Point milestone, you can choose your preferred framework branch, which tailors all subsequent milestones and learning resources accordingly.',
    tags: ['branch', 'technology branch', 'decision point', 'fastapi', 'django', 'pytorch', 'tensorflow'],
    actionLink: { label: 'Explore Roadmap Decisions', url: '/roadmap' },
  },
  {
    id: 'rm-4',
    categoryId: 'roadmaps',
    question: 'Can I switch my career track or regenerate my roadmap?',
    answer:
      'Yes! You can explore and switch career domains at any time by visiting "Explore Domains". When you switch roles or complete a new assessment, Vidyut updates your active roadmap milestones while preserving all your previously completed skill assessments and credentials.',
    tags: ['switch role', 'change track', 'regenerate', 'reset roadmap', 'explore'],
    actionLink: { label: 'Explore Other Domains', url: '/explore' },
  },

  // =========================================================================
  // SKILL ASSESSMENTS & SCORING
  // =========================================================================
  {
    id: 'as-1',
    categoryId: 'assessments',
    question: 'How does the assessment engine calculate my proficiency level?',
    answer:
      'Vidyut\'s adaptive assessment engine evaluates your responses across multiple difficulty tiers (Easy, Medium, Hard). Based on your answer accuracy, timing, and question complexity weights, your skill state is calculated on a standardized 6-level scale: UNASSESSED, AWARENESS, BEGINNER, INTERMEDIATE, PROFICIENT, and EXPERT.',
    tags: ['assessment', 'scoring', 'proficiency', 'accuracy', 'evaluation', 'tiers'],
    actionLink: { label: 'Take an Assessment', url: '/assessment/self' },
  },
  {
    id: 'as-2',
    categoryId: 'assessments',
    question: 'Can I retake an assessment if I score poorly?',
    answer:
      'Yes, absolutely. Skill assessments are not one-time barriers. You can study the recommended learning resources and retake the skill test whenever you feel ready. Your student profile, accuracy metrics, and roadmap milestones immediately update with your improved score.',
    tags: ['retake', 'try again', 're-eval', 'low score', 'improvement'],
    actionLink: { label: 'Go to Self-Assessment', url: '/assessment/self' },
  },
  {
    id: 'as-3',
    categoryId: 'assessments',
    question: 'What are the 6 proficiency levels recognized by Vidyut?',
    answer:
      '• UNASSESSED: Not yet formally evaluated in this skill.\n• AWARENESS: Familiar with high-level terminology and concepts.\n• BEGINNER: Able to write basic syntax and solve guided problems.\n• INTERMEDIATE: Independently builds components and understands idiomatic patterns.\n• PROFICIENT: Production-grade capability, handles edge cases and performance.\n• EXPERT: Architectural mastery, distributed scalability, and systems tuning.',
    tags: ['proficiency levels', 'beginner', 'intermediate', 'proficient', 'expert', 'awareness'],
    actionLink: { label: 'View Your Current Skills', url: '/dashboard' },
  },
  {
    id: 'as-4',
    categoryId: 'assessments',
    question: 'Are assessments timed, and how are my answers verified?',
    answer:
      'Practice and self-assessment quizzes allow self-paced evaluation with instant feedback. Institutional certification and proctored assessment sessions have specific time windows. Every response submission is cryptographically validated and logged to maintain academic integrity.',
    tags: ['timed', 'proctored', 'duration', 'time limit', 'integrity'],
    actionLink: { label: 'Start Quiz Session', url: '/assessment/quiz' },
  },

  // =========================================================================
  // OPPORTUNITY MATCHING & COMPATIBILITY
  // =========================================================================
  {
    id: 'op-1',
    categoryId: 'opportunities',
    question: 'How is my compatibility score calculated for internships and jobs?',
    answer:
      'Vidyut uses a multi-factor mathematical scoring engine with 4 weighted criteria:\n1. Skill Proficiency Match (50%): Compares your assessed skill levels against the role\'s requirements.\n2. Career Alignment (25%): 1.0 for direct role matches, 0.65 for adjacent disciplines.\n3. Eligibility Match (15%): Academic qualification and current year of study.\n4. Student Interest Overlap (10%): Alignment with your declared areas of interest.',
    tags: ['compatibility score', 'formula', 'weights', 'calculation', 'matching', 'opportunities'],
    actionLink: { label: 'View Matched Opportunities', url: '/opportunities' },
  },
  {
    id: 'op-2',
    categoryId: 'opportunities',
    question: 'What is the difference between Ready Now, Almost Ready, and Aspirational?',
    answer:
      '• READY NOW (Score ≥ 0.70): Strong alignment. You meet or exceed the required skills and are ready to apply immediately.\n• ALMOST READY (Score 0.45 – 0.69): Moderate alignment. You are 1 or 2 specific skills away. Follow the recommended roadmap milestones to qualify.\n• ASPIRATIONAL (Score < 0.45): High-tier or advanced roles that serve as motivating long-term milestones for subsequent years of study.',
    tags: ['ready now', 'almost ready', 'aspirational', 'segments', 'tiers'],
    actionLink: { label: 'Explore Opportunity Segments', url: '/opportunities' },
  },
  {
    id: 'op-3',
    categoryId: 'opportunities',
    question: 'What information do the AI match explanations provide?',
    answer:
      'Every scored opportunity includes an AI-synthesized breakdown highlighting your exact Matching Skills, your specific Skill Gaps, a Gap Severity index (None, Minor, Moderate, Significant), and a concise actionable summary explaining what to focus on before applying.',
    tags: ['ai explanation', 'match explanation', 'skill gaps', 'feedback', 'actionable advice'],
    actionLink: { label: 'Inspect AI Explanations', url: '/opportunities' },
  },

  // =========================================================================
  // LEARNING RESOURCES & COURSES
  // =========================================================================
  {
    id: 'res-1',
    categoryId: 'resources',
    question: 'Are all the recommended courses and learning materials free?',
    answer:
      'Yes! Vidyut specifically curates verified, high-quality free and open-access materials. This includes accredited Indian national courses (NPTEL, SWAYAM, IIT Madras, IIT Kharagpur, IIT Ropar), premier international open courseware (MIT OpenCourseWare, Stanford Online, Harvard CS50), interactive practice sandboxes (Kaggle Learn, Killercoda, OverTheWire), and official developer documentation.',
    tags: ['free', 'cost', 'resources', 'nptel', 'swayam', 'mit', 'open source'],
    actionLink: { label: 'Check Recommended Resources', url: '/dashboard' },
  },
  {
    id: 'res-2',
    categoryId: 'resources',
    question: 'How does Vidyut decide which learning resources to suggest for me?',
    answer:
      'The recommendation engine analyzes your active roadmap milestones and identifies skills where your assessed level is below the milestone target. It then selects curated resources matching that skill, ordering free accredited courses and interactive tutorials first.',
    tags: ['recommendation logic', 'resource selection', 'skill gaps', 'priority'],
    actionLink: { label: 'View Skill Gaps', url: '/dashboard' },
  },
  {
    id: 'res-3',
    categoryId: 'resources',
    question: 'Can I access NPTEL and SWAYAM courses directly on Vidyut?',
    answer:
      'Yes. Vidyut links directly to accredited NPTEL and SWAYAM engineering courses taught by premier IIT and IISc faculty, covering Linear Algebra, Probability, Machine Learning, Database Systems, Operating Systems, and Python Programming.',
    tags: ['nptel', 'swayam', 'iit', 'indian courses', 'accredited'],
    actionLink: { label: 'Explore Courses', url: '/dashboard' },
  },

  // =========================================================================
  // UNIVERSITIES & INDUSTRY TALENT POOL
  // =========================================================================
  {
    id: 'inst-1',
    categoryId: 'institutions',
    question: 'How do hiring partners discover students in the Industry Talent Pool?',
    answer:
      'Partner companies and tech recruiters search the Industry Talent Pool based on verified skill proficiencies, assessment scores, and completed milestones—not just keyword-stuffed resumes. This ensures students with genuine capability get noticed for competitive internships and full-time roles.',
    tags: ['industry', 'talent pool', 'recruitment', 'hiring', 'internships', 'jobs'],
    actionLink: { label: 'View Talent Pool Portal', url: '/industry/talent' },
  },
  {
    id: 'inst-2',
    categoryId: 'institutions',
    question: 'Can my college or university placement cell track my progress?',
    answer:
      'Yes. Through the Institutional Dashboard, accredited colleges and universities can monitor aggregate batch skill readiness, identify domain gaps across academic departments, and support students in securing placement opportunities.',
    tags: ['college', 'university', 'placement cell', 'institution', 'tracking'],
    actionLink: { label: 'Institution Portal', url: '/institution/onboard' },
  },
  {
    id: 'inst-3',
    categoryId: 'institutions',
    question: 'What is the verified digital portfolio and how do I share it?',
    answer:
      'Vidyut compiles your completed assessments, skill badges, and milestone verifications into a shareable digital portfolio. You can include your portfolio link on your resume, LinkedIn profile, or GitHub repository as tamper-proof evidence of your skills.',
    tags: ['portfolio', 'badges', 'resume', 'evidence', 'share', 'linkedin'],
    actionLink: { label: 'Go to Student Dashboard', url: '/dashboard' },
  },

  // =========================================================================
  // ACCOUNT, PROFILE & NAVIGATION
  // =========================================================================
  {
    id: 'acc-1',
    categoryId: 'account',
    question: 'How do I update my college, degree, or current year of study?',
    answer:
      'Your institution, degree, and study year are displayed on your Student Dashboard. When you update your year of study, Vidyut immediately recalculates your eligibility and compatibility scores across all live opportunities.',
    tags: ['profile', 'institution', 'degree', 'year of study', 'update profile'],
    actionLink: { label: 'Update Profile Details', url: '/dashboard' },
  },
  {
    id: 'acc-2',
    categoryId: 'account',
    question: 'Where can I see available domains and career tracks?',
    answer:
      'Visit the "Explore Domains" page in the navigation bar to browse comprehensive breakdowns of Backend Development, Machine Learning & AI, Cloud & DevOps, and Data Science, including prerequisites, active job counts, and technology DAGs.',
    tags: ['explore', 'domains', 'career tracks', 'overview'],
    actionLink: { label: 'Explore Career Domains', url: '/explore' },
  },
  {
    id: 'acc-3',
    categoryId: 'account',
    question: 'What should I do if a page or assessment does not load?',
    answer:
      'First ensure your internet connection is active. You can safely refresh the page or log out and log back in. Your completed milestones, quiz submissions, and skill states are securely preserved in the PostgreSQL cloud database.',
    tags: ['troubleshoot', 'loading error', 'offline', 'refresh', 'help'],
    actionLink: { label: 'Sign In Page', url: '/login' },
  },
];

const STOP_WORDS = new Set([
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is',
  'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or',
  'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'don', 'should', 'now', 'give', 'get', 'tell', 'me',
  'please', 'want', 'know', 'like', 'show'
]);

export function matchQuestionClient(queryStr: string): {
  matchedQuestion: HelpQuestion | null;
  candidates: HelpQuestion[];
} {
  const cleanQuery = queryStr.trim().toLowerCase();
  if (!cleanQuery) {
    return { matchedQuestion: null, candidates: HELP_QUESTIONS.slice(0, 4) };
  }

  // Exact or near-exact question match
  const exactMatch = HELP_QUESTIONS.find(
    (q) =>
      q.question.toLowerCase() === cleanQuery ||
      q.question.toLowerCase().includes(cleanQuery) ||
      cleanQuery.includes(q.question.toLowerCase().replace('?', ''))
  );

  if (exactMatch) {
    const others = HELP_QUESTIONS.filter(
      (q) => q.id !== exactMatch.id && q.categoryId === exactMatch.categoryId
    );
    return { matchedQuestion: exactMatch, candidates: others.slice(0, 3) };
  }

  // Token-based relevance scoring excluding stop words
  const queryTokens = cleanQuery
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (queryTokens.length === 0) {
    return {
      matchedQuestion: null,
      candidates: HELP_QUESTIONS.slice(0, 4),
    };
  }

  const scored = HELP_QUESTIONS.map((q) => {
    let score = 0;
    const qLower = q.question.toLowerCase();
    const aLower = q.answer.toLowerCase();

    for (const token of queryTokens) {
      if (qLower.includes(token)) score += 6;
      if (q.tags.some((t) => t.toLowerCase().includes(token))) score += 5;
      if (aLower.includes(token)) score += 2;
    }

    return { question: q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score >= 8) {
    const best = scored[0].question;
    const candidates = scored
      .slice(1, 4)
      .filter((s) => s.score > 0)
      .map((s) => s.question);
    return { matchedQuestion: best, candidates };
  }

  return {
    matchedQuestion: null,
    candidates: HELP_QUESTIONS.slice(0, 4),
  };
}
