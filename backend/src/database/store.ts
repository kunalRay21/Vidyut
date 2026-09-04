// ==============================================================================
// In-Memory Storage & Seed Engine (Dual-Persistence Architecture)
// Enables zero-dependency local development and offline test execution.
// ==============================================================================

export interface QuestionSeed {
  id: string;
  skill_id: string;
  skill_name: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation: string;
  question_type: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODE_SNIPPET';
  code_snippet?: string;
  code_language?: string;
  points: number;
  tags: string[];
}

export interface StoredSession {
  id: string;
  student_id: string;
  role_id: string;
  test_title: string;
  status: 'STARTED' | 'COMPLETED';
  score: number;
  total_time_seconds: number;
  time_remaining_seconds: number;
  current_question_index: number;
  tab_switch_count: number;
  question_ids: string[];
  created_at: string;
  completed_at?: string;
}

export interface StoredResponse {
  id: string;
  session_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  selected_options?: string[];
  is_correct: boolean | null;
  is_marked_for_review: boolean;
  time_spent_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface StoredSkillState {
  id: string;
  student_id: string;
  skill_id: string;
  skill_name: string;
  self_rating: 'NOT_FAMILIAR' | 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT';
  assessed_level: 'AWARENESS' | 'BEGINNER' | 'INTERMEDIATE' | 'PROFICIENT' | 'EXPERT';
  accuracy: number;
  target_level: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// Canonical Question Bank with Rich Code Snippets & Explanations
// ------------------------------------------------------------------------------
export const QUESTIONS_STORE: QuestionSeed[] = [
  {
    id: 'q-py-01',
    skill_id: 'skill-python',
    skill_name: 'Python Programming',
    question_text: 'What will be the output of executing this list comprehension with variable mutation in Python 3?',
    code_language: 'python',
    question_type: 'CODE_SNIPPET',
    code_snippet: `data = [1, 2, 3, 4, 5]\nresult = [x * 2 for x in data if x % 2 == 0]\nprint(result)`,
    option_a: '[2, 4, 6, 8, 10]',
    option_b: '[4, 8]',
    option_c: '[2, 6, 10]',
    option_d: '[4, 16]',
    correct_option: 'B',
    difficulty: 'EASY',
    explanation: 'The filter `if x % 2 == 0` filters out odd numbers, selecting [2, 4]. Multiplying each by 2 yields [4, 8].',
    points: 1,
    tags: ['python', 'data-structures', 'comprehensions']
  },
  {
    id: 'q-py-02',
    skill_id: 'skill-python',
    skill_name: 'Python Programming',
    question_text: 'Examine this decorator implementation. When `greet("Vidyut")` is called, in what order are messages printed?',
    code_language: 'python',
    question_type: 'CODE_SNIPPET',
    code_snippet: `def audit_log(func):\n    def wrapper(*args, **kwargs):\n        print("Entering...")\n        res = func(*args, **kwargs)\n        print("Exiting...")\n        return res\n    return wrapper\n\n@audit_log\ndef greet(name):\n    print(f"Namaste, {name}")`,
    option_a: 'Namaste, Vidyut -> Entering... -> Exiting...',
    option_b: 'Entering... -> Namaste, Vidyut -> Exiting...',
    option_c: 'Entering... -> Exiting... -> Namaste, Vidyut',
    option_d: 'Exiting... -> Namaste, Vidyut -> Entering...',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    explanation: 'The decorator wrapper intercepts the function call, executes "Entering...", calls the decorated `greet`, and finally prints "Exiting...".',
    points: 2,
    tags: ['python', 'decorators', 'closures']
  },
  {
    id: 'q-sql-01',
    skill_id: 'skill-sql',
    skill_name: 'SQL & Relational Databases',
    question_text: 'Consider the query below calculating student test percentiles. Which window function clause correctly partitions by domain without collapsing rows?',
    code_language: 'sql',
    question_type: 'CODE_SNIPPET',
    code_snippet: `SELECT student_id, score,\n       DENSE_RANK() OVER (/* Clause here */) as rank_pos\nFROM assessment_sessions\nWHERE status = 'COMPLETED';`,
    option_a: 'PARTITION BY domain_id ORDER BY score DESC',
    option_b: 'GROUP BY domain_id ORDER BY score DESC',
    option_c: 'DISTINCT ON (domain_id) ORDER BY score ASC',
    option_d: 'ORDER BY domain_id, score DESC',
    correct_option: 'A',
    difficulty: 'MEDIUM',
    explanation: 'In window functions, `PARTITION BY <column>` segments calculations within each group while preserving all output rows.',
    points: 2,
    tags: ['sql', 'window-functions', 'analytics']
  },
  {
    id: 'q-sql-02',
    skill_id: 'skill-sql',
    skill_name: 'SQL & Relational Databases',
    question_text: 'What will happen when attempting to execute this transactional update under PostgreSQL standard READ COMMITTED isolation?',
    code_language: 'sql',
    question_type: 'CODE_SNIPPET',
    code_snippet: `BEGIN;\nUPDATE student_profiles \nSET readiness_pct = readiness_pct + 5 \nWHERE id = 'a7d18e21-0000-4000-8000-000000000001';\n-- A concurrent transaction commits an update on the same row here\nCOMMIT;`,
    option_a: 'The transaction will automatically rollback with a serialization error.',
    option_b: 'The transaction blocks until the first completes, then applies its update on the newest committed version.',
    option_c: 'The update will silently overwrite the concurrent transaction without reading it.',
    option_d: 'PostgreSQL raises a deadlock failure exception immediately.',
    correct_option: 'B',
    difficulty: 'HARD',
    explanation: 'Under READ COMMITTED, row-level locks block concurrent updates. Once released, the second update re-evaluates the query condition against the new committed row snapshot.',
    points: 3,
    tags: ['sql', 'transactions', 'concurrency', 'acid']
  },
  {
    id: 'q-sys-01',
    skill_id: 'skill-system-design',
    skill_name: 'System Architecture',
    question_text: 'In high-throughput examination systems, which cache invalidation strategy is most optimal for real-time timer sync and session recovery?',
    code_language: 'text',
    question_type: 'MCQ_SINGLE',
    option_a: 'Write-Through caching with synchronous database persistence',
    option_b: 'Write-Behind (Write-Back) with Redis as the hot cache buffer flushed periodically',
    option_c: 'Cache-Aside with random cache eviction TTL of 1 second',
    option_d: 'Full database bypass without persistent replication',
    correct_option: 'B',
    difficulty: 'HARD',
    explanation: 'Write-Behind caches candidate heartbeats and clicks in ultrafast memory (Redis) and flushes them asynchronously to disk, minimizing DB connection saturation during exam spikes.',
    points: 3,
    tags: ['system-design', 'caching', 'redis', 'scalability']
  },
  {
    id: 'q-git-01',
    skill_id: 'skill-git',
    skill_name: 'Git & Version Control',
    question_text: 'You have unstaged changes in your working tree and need to switch branches urgently without losing work. Which command sequence safely stashes and restores them?',
    code_language: 'bash',
    question_type: 'CODE_SNIPPET',
    code_snippet: `git stash push -u -m "wip-exam-module"\ngit checkout develop\n# Return to work:\ngit checkout feat/assessment-platform\n/* Restore command */`,
    option_a: 'git stash drop',
    option_b: 'git stash pop',
    option_c: 'git stash clear',
    option_d: 'git rebase --continue',
    correct_option: 'B',
    difficulty: 'EASY',
    explanation: '`git stash pop` applies the top stashed modifications and removes them from the stash stack.',
    points: 1,
    tags: ['git', 'cli', 'version-control']
  }
];

// In-Memory Storage Instances
export const inMemorySessions = new Map<string, StoredSession>();
export const inMemoryResponses = new Map<string, StoredResponse>(); // key: `${sessionId}:${questionId}`
export const inMemorySkillStates = new Map<string, StoredSkillState>(); // key: `${studentId}:${skillId}`
export const inMemorySelfRatings = new Map<string, Record<string, string>>(); // studentId -> { skillId: rating }

// Helper Seed Accessor
export function getAllQuestions(): QuestionSeed[] {
  return [...QUESTIONS_STORE];
}

export function getQuestionById(id: string): QuestionSeed | undefined {
  return QUESTIONS_STORE.find(q => q.id === id);
}
