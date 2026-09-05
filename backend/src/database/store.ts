// In-memory store for offline development when PostgreSQL is not running
export interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  role: 'STUDENT' | 'INSTITUTION' | 'INDUSTRY' | 'ADMIN';
  created_at: string;
}

export interface StoredStudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  institution: string;
  degree: string;
  year_of_study: number;
  interests: string[];
  selected_role_id?: string;
  readiness_pct: number;
}

export interface StoredInstitution {
  id: string;
  user_id: string;
  college_name: string;
  aishe_code: string;
  officer_name: string;
  departments: string[];
}

export interface StoredCompany {
  id: string;
  user_id: string;
  company_name: string;
  sector: string;
  website?: string;
}

// Unified StoredSkillState supporting both auth/profile and assessment modules
export interface StoredSkillState {
  id?: string;
  student_id: string;
  skill_id: string;
  skill_name?: string;
  self_rating?: 'NOT_FAMILIAR' | 'BEGINNER' | 'AVERAGE' | 'GOOD' | 'EXPERT' | string;
  assessed_level: 'AWARENESS' | 'BEGINNER' | 'INTERMEDIATE' | 'PROFICIENT' | 'EXPERT' | string;
  accuracy: number;
  target_level?: string;
  updated_at?: string;
}

export const memoryStore = {
  users: new Map<string, StoredUser>(),
  profiles: new Map<string, StoredStudentProfile>(),
  institutions: new Map<string, StoredInstitution>(),
  companies: new Map<string, StoredCompany>(),
  skill_states: new Map<string, StoredSkillState>(),
};

// ==============================================================================
// In-Memory Storage & Seed Engine (Dual-Persistence Architecture)
// Pre-seeded with 10 Industry MCQs + 5 Algorithmic Coding Challenges (Any 4 Required)
// Multi-language support: Python, Java, C++, C
// ==============================================================================

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
  is_hidden?: boolean;
}

export interface StarterCodeMap {
  python: string;
  java: string;
  cpp: string;
  c: string;
}

export interface QuestionSeed {
  id: string;
  section: 'MCQ' | 'CODING';
  skill_id: string;
  skill_name: string;
  question_text: string;
  problem_description?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: 'A' | 'B' | 'C' | 'D';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation: string;
  question_type: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODE_SNIPPET' | 'CODING_PROBLEM';
  code_snippet?: string;
  code_language?: string;
  points: number;
  tags: string[];
  constraints?: string[];
  test_cases?: TestCase[];
  starter_code?: StarterCodeMap;
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
  coding_language?: 'python' | 'java' | 'cpp' | 'c';
  code_solution?: string;
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// Canonical Question Bank (10 MCQs + 5 Coding Problems with Python, Java, C++, C)
// ------------------------------------------------------------------------------
export const QUESTIONS_STORE: QuestionSeed[] = [
  // ========================== SECTION 1: 10 MCQs ==========================
  {
    id: 'q-mcq-01',
    section: 'MCQ',
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
    id: 'q-mcq-02',
    section: 'MCQ',
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
    id: 'q-mcq-03',
    section: 'MCQ',
    skill_id: 'skill-sql',
    skill_name: 'SQL & Relational Databases',
    question_text: 'Which window function clause correctly calculates student test percentiles partitioned by domain without collapsing rows?',
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
    id: 'q-mcq-04',
    section: 'MCQ',
    skill_id: 'skill-sql',
    skill_name: 'SQL & Relational Databases',
    question_text: 'What happens when attempting to execute this transactional update under PostgreSQL standard READ COMMITTED isolation?',
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
    id: 'q-mcq-05',
    section: 'MCQ',
    skill_id: 'skill-system-design',
    skill_name: 'System Architecture',
    question_text: 'In high-throughput examination systems, which caching strategy is most optimal for real-time timer sync and autosave under burst traffic?',
    code_language: 'text',
    question_type: 'MCQ_SINGLE',
    option_a: 'Write-Through caching with synchronous database persistence',
    option_b: 'Write-Behind (Write-Back) with Redis as the hot cache buffer flushed periodically to disk',
    option_c: 'Cache-Aside with random cache eviction TTL of 1 second',
    option_d: 'Full database bypass without persistent replication',
    correct_option: 'B',
    difficulty: 'HARD',
    explanation: 'Write-Behind caches candidate heartbeats and clicks in ultrafast memory (Redis) and flushes them asynchronously to disk, minimizing DB connection saturation during exam spikes.',
    points: 3,
    tags: ['system-design', 'caching', 'redis', 'scalability']
  },
  {
    id: 'q-mcq-06',
    section: 'MCQ',
    skill_id: 'skill-git',
    skill_name: 'Git & Version Control',
    question_text: 'You have unstaged changes in your working tree and need to switch branches urgently without losing work. Which command safely stashes and restores them?',
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
  },
  {
    id: 'q-mcq-07',
    section: 'MCQ',
    skill_id: 'skill-dsa',
    skill_name: 'Data Structures & Algorithms',
    question_text: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) containing N elements?',
    code_language: 'text',
    question_type: 'MCQ_SINGLE',
    option_a: 'O(log N)',
    option_b: 'O(1)',
    option_c: 'O(N)',
    option_d: 'O(N log N)',
    correct_option: 'C',
    difficulty: 'EASY',
    explanation: 'In the worst case (e.g. inserting elements in strictly sorted order), an unbalanced BST degenerates into a linked list structure, resulting in O(N) search time.',
    points: 1,
    tags: ['dsa', 'trees', 'complexity']
  },
  {
    id: 'q-mcq-08',
    section: 'MCQ',
    skill_id: 'skill-security',
    skill_name: 'Network & API Security',
    question_text: 'Which header and cookie configuration provides the strongest defense against Cross-Site Scripting (XSS) token theft for JWT authentication?',
    code_language: 'text',
    question_type: 'MCQ_SINGLE',
    option_a: 'Storing tokens in window.localStorage with Authorization Bearer header',
    option_b: 'HttpOnly; Secure; SameSite=Strict cookies',
    option_c: 'Base64 cookie without Secure flag',
    option_d: 'Storing tokens in IndexedDB accessible via document.cookie',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    explanation: '`HttpOnly` cookies cannot be accessed by client-side JavaScript, effectively neutralizing token exfiltration via XSS attacks, while `SameSite=Strict` mitigates CSRF.',
    points: 2,
    tags: ['security', 'jwt', 'authentication', 'web']
  },
  {
    id: 'q-mcq-09',
    section: 'MCQ',
    skill_id: 'skill-os',
    skill_name: 'Operating Systems & Concurrency',
    question_text: 'Which of the following conditions is NOT one of Coffman’s four necessary conditions required for a deadlock to occur?',
    code_language: 'text',
    question_type: 'MCQ_SINGLE',
    option_a: 'Mutual Exclusion',
    option_b: 'Hold and Wait',
    option_c: 'Preemption of Resources',
    option_d: 'Circular Wait',
    correct_option: 'C',
    difficulty: 'MEDIUM',
    explanation: 'The condition is **No Preemption** (resources cannot be forcibly confiscated). Allowing preemption actively prevents deadlock from happening.',
    points: 2,
    tags: ['os', 'concurrency', 'deadlocks']
  },
  {
    id: 'q-mcq-10',
    section: 'MCQ',
    skill_id: 'skill-devops',
    skill_name: 'DevOps & Containerization',
    question_text: 'In Docker multi-stage builds, what is the primary architectural advantage of copying artifacts from a builder stage into an alpine runtime image?',
    code_language: 'dockerfile',
    question_type: 'CODE_SNIPPET',
    code_snippet: `FROM golang:1.22 AS builder\nWORKDIR /app\nCOPY . .\nRUN go build -o server .\n\nFROM alpine:3.19\nCOPY --from=builder /app/server /usr/local/bin/\nENTRYPOINT ["server"]`,
    option_a: 'Ensures the container automatically runs with root privileges.',
    option_b: 'Minimizes final image attack surface and deployment size by excluding SDKs and compiler build tools.',
    option_c: 'Allows hot-reloading in production clusters without rebuilding.',
    option_d: 'Bypasses container network virtualization overhead.',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    explanation: 'Multi-stage builds leave the heavy Go/Node compiler, build caches, and system libraries behind, creating a minimal, production-hardened binary image.',
    points: 2,
    tags: ['docker', 'devops', 'containers', 'security']
  },

  // ========================== SECTION 2: 5 CODING PROBLEMS ==========================
  {
    id: 'q-code-01',
    section: 'CODING',
    skill_id: 'skill-dsa',
    skill_name: 'Data Structures & Algorithms',
    question_text: 'Two Sum: Find Indices of Target Pair',
    problem_description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
    question_type: 'CODING_PROBLEM',
    difficulty: 'EASY',
    points: 5,
    tags: ['arrays', 'hash-map', 'two-sum'],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    test_cases: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    starter_code: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}\n`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};\n`,
      c: `#include <stdlib.h>\n\n/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}\n`
    },
    explanation: 'Using an auxiliary hash map stores elements as keys and their indices as values, allowing complement lookups in O(1) time and O(N) overall complexity.'
  },
  {
    id: 'q-code-02',
    section: 'CODING',
    skill_id: 'skill-dsa',
    skill_name: 'Data Structures & Algorithms',
    question_text: 'Valid Parentheses: Balanced Bracket Verification',
    problem_description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    question_type: 'CODING_PROBLEM',
    difficulty: 'EASY',
    points: 5,
    tags: ['stack', 'strings', 'validation'],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    test_cases: [
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All brackets match correctly in nested FIFO order.'
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Parenthesis type mismatch.'
      }
    ],
    starter_code: {
      python: `def isValid(s: str) -> bool:\n    # Write your solution here\n    return False\n`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}\n`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};\n`,
      c: `#include <stdbool.h>\n\nbool isValid(char* s) {\n    // Write your solution here\n    return false;\n}\n`
    },
    explanation: 'A Last-In First-Out (LIFO) stack ensures every closing symbol immediately pairs with the most recently encountered open symbol.'
  },
  {
    id: 'q-code-03',
    section: 'CODING',
    skill_id: 'skill-dsa',
    skill_name: 'Data Structures & Algorithms',
    question_text: 'Maximum Subarray: Kadane’s Dynamic Algorithm',
    problem_description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    question_type: 'CODING_PROBLEM',
    difficulty: 'MEDIUM',
    points: 6,
    tags: ['dynamic-programming', 'arrays', 'kadane'],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    test_cases: [
      {
        input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.'
      },
      {
        input: 'nums = [5, 4, -1, 7, 8]',
        output: '23',
        explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.'
      }
    ],
    starter_code: {
      python: `def maxSubArray(nums: list[int]) -> int:\n    # Write your solution here\n    return 0\n`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n`,
      c: `int maxSubArray(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}\n`
    },
    explanation: 'Kadane’s algorithm scans the array in linear O(N) time by deciding at each index whether to extend the previous contiguous sum or start fresh.'
  },
  {
    id: 'q-code-04',
    section: 'CODING',
    skill_id: 'skill-dsa',
    skill_name: 'Data Structures & Algorithms',
    question_text: 'Reverse a Singly Linked List: In-Place Pointer Manipulation',
    problem_description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list head.

Ensure your algorithm operates in-place using O(1) additional memory.`,
    question_type: 'CODING_PROBLEM',
    difficulty: 'MEDIUM',
    points: 6,
    tags: ['linked-list', 'pointers'],
    constraints: [
      'The number of nodes in the list is in the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    test_cases: [
      {
        input: 'head = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
        explanation: 'All pointer links are reversed.'
      },
      {
        input: 'head = [1, 2]',
        output: '[2, 1]',
        explanation: '2 points to 1.'
      }
    ],
    starter_code: {
      python: `# Definition for singly-linked list.\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head: ListNode) -> ListNode:\n    # Write your solution here\n    return None\n`,
      java: `class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int x) { val = x; }\n}\n\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}\n`,
      cpp: `struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};\n`,
      c: `struct ListNode {\n    int val;\n    struct ListNode *next;\n};\n\nstruct ListNode* reverseList(struct ListNode* head) {\n    // Write your solution here\n    return NULL;\n}\n`
    },
    explanation: 'Iterative three-pointer approach (prev, curr, nextTemp) flips pointers in linear time and strictly constant space.'
  },
  {
    id: 'q-code-05',
    section: 'CODING',
    skill_id: 'skill-system-design',
    skill_name: 'System Architecture & Algorithms',
    question_text: 'LRU Cache Design: Eviction Policy Implementation',
    problem_description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\`: Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\`: Update the value of the \`key\` if the \`key\` exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, evict the least recently used key.

The functions \`get\` and \`put\` must each run in O(1) average time complexity.`,
    question_type: 'CODING_PROBLEM',
    difficulty: 'HARD',
    points: 8,
    tags: ['hash-map', 'doubly-linked-list', 'lru-cache', 'system-design'],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    test_cases: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'Cache evicts key 2, then key 1 when capacity of 2 is exceeded.'
      }
    ],
    starter_code: {
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        # Initialize LRU Cache\n        pass\n\n    def get(self, key: int) -> int:\n        # Write your solution here\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        # Write your solution here\n        pass\n`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        // Initialize LRU Cache\n    }\n\n    public int get(int key) {\n        // Write your solution here\n        return -1;\n    }\n\n    public void put(int key, int value) {\n        // Write your solution here\n    }\n}\n`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Initialize LRU Cache\n    }\n\n    int get(int key) {\n        // Write your solution here\n        return -1;\n    }\n\n    void put(int key, int value) {\n        // Write your solution here\n    }\n};\n`,
      c: `#include <stdlib.h>\n\ntypedef struct {\n    int capacity;\n} LRUCache;\n\nLRUCache* lRUCacheCreate(int capacity) {\n    // Initialize LRU Cache\n    return NULL;\n}\n\nint lRUCacheGet(LRUCache* obj, int key) {\n    // Write your solution here\n    return -1;\n}\n\nvoid lRUCachePut(LRUCache* obj, int key, int value) {\n    // Write your solution here\n}\n\nvoid lRUCacheFree(LRUCache* obj) {\n    // Free memory\n}\n`
    },
    explanation: 'Combining a Hash Map with a Doubly Linked List achieves O(1) get and put operations while maintaining accurate access order.'
  }
];

// In-Memory Storage Instances
export const inMemorySessions = new Map<string, StoredSession>();
export const inMemoryResponses = new Map<string, StoredResponse>(); // key: `${sessionId}:${questionId}`
export const inMemorySkillStates = memoryStore.skill_states; // Unified alias sharing the same Map instance: key: `${studentId}:${skillId}`
export const inMemorySelfRatings = new Map<string, Record<string, string>>(); // studentId -> { skillId: rating }

// Helper Seed Accessor
export function getAllQuestions(): QuestionSeed[] {
  return [...QUESTIONS_STORE];
}

export function getQuestionById(id: string): QuestionSeed | undefined {
  return QUESTIONS_STORE.find(q => q.id === id);
}

