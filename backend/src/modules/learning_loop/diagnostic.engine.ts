/**
 * Vidyut Diagnostic Learning & Reassessment Engine
 * Transforms assessment score deficiencies into precision micro-learning drills and verification re-tests.
 */

export interface DiagnosticConceptGap {
  conceptId: string;
  conceptTitle: string;
  category: string;
  errorPattern: string; // Explanation of the mistake made
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
  misunderstoodPrinciple: string;
}

export interface MicroLearningDrill {
  id: string;
  conceptId: string;
  title: string;
  readingMinutes: number;
  coreRule: string;
  codeSnippet: {
    language: string;
    flawedCode: string;
    correctedCode: string;
    explanation: string;
  };
  checkpointQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface ReassessmentQuestion {
  id: string;
  conceptId: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  weight: number;
}

export interface DiagnosticRemediationPackage {
  loopId: string;
  studentId: string;
  sourceExamId: string;
  sourceExamTitle: string;
  skillId: string;
  skillName: string;
  initialScore: number;
  status: 'PENDING_REVIEW' | 'DRILL_IN_PROGRESS' | 'READY_FOR_REASSESSMENT' | 'MASTERED';
  conceptGaps: DiagnosticConceptGap[];
  microDrill: MicroLearningDrill;
  reassessmentQuestions: ReassessmentQuestion[];
  createdTimestamp: string;
  reassessmentScore?: number;
  masteryAchieved?: boolean;
}

// Curated diagnostic knowledge base for common gaps across domains
const DIAGNOSTIC_KNOWLEDGE_BASE: Record<string, {
  conceptTitle: string;
  category: string;
  errorPattern: string;
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
  misunderstoodPrinciple: string;
  drill: Omit<MicroLearningDrill, 'id' | 'conceptId'>;
  reassessment: ReassessmentQuestion[];
}> = {
  'gap-sql-indexing': {
    conceptTitle: 'B-Tree Index Cardinality & Sequential Scans',
    category: 'DATABASE',
    errorPattern: 'Used wildcards at the start of LIKE clauses (%term) and wrapped indexed columns in functions, preventing index usage.',
    severity: 'CRITICAL',
    misunderstoodPrinciple: 'B-Tree indexes cannot use prefix traversal when leading wildcards or functional transforms are applied to indexed columns.',
    drill: {
      title: 'Mastering SARGable Queries & B-Tree Index Traversal',
      readingMinutes: 4,
      coreRule: 'Search Argument Able (SARGable) queries allow the database engine to perform an Index Seek rather than an expensive full Table/Index Scan.',
      codeSnippet: {
        language: 'sql',
        flawedCode: '-- Non-SARGable: B-Tree index on created_at is bypassed!\nSELECT id, email FROM users \nWHERE DATE(created_at) = \'2026-09-01\';',
        correctedCode: '-- SARGable: Index range seek activated\nSELECT id, email FROM users \nWHERE created_at >= \'2026-09-01 00:00:00\' \n  AND created_at <  \'2026-09-02 00:00:00\';',
        explanation: 'Wrapping created_at in DATE() forces PostgreSQL to evaluate every single row. Using a boundary range preserves index seek efficiency.'
      },
      checkpointQuestion: {
        question: 'Which of the following WHERE conditions can utilize a standard B-Tree index on `user_name`?',
        options: [
          'WHERE LOWER(user_name) = "admin"',
          'WHERE user_name LIKE "%kumar"',
          'WHERE user_name LIKE "kumar%"',
          'WHERE SUBSTRING(user_name, 1, 3) = "kum"'
        ],
        correctIndex: 2,
        explanation: 'Only prefix matches like "kumar%" allow the B-Tree search tree to branch down directly to matching nodes.'
      }
    },
    reassessment: [
      {
        id: 'rq-sql-1',
        conceptId: 'gap-sql-indexing',
        prompt: 'Given an indexed column `last_login TIMESTAMP`, how should you query logins from the past 7 days while keeping the query SARGable?',
        options: [
          'WHERE DATEDIFF(NOW(), last_login) <= 7',
          'WHERE last_login >= NOW() - INTERVAL 7 DAY',
          'WHERE DATE_FORMAT(last_login, "%Y-%m-%d") >= "2026-08-28"',
          'WHERE TO_DAYS(last_login) > TO_DAYS(NOW()) - 7'
        ],
        correctOptionIndex: 1,
        weight: 1.0
      },
      {
        id: 'rq-sql-2',
        conceptId: 'gap-sql-indexing',
        prompt: 'Why does creating a composite index on (tenant_id, created_at) fail to optimize `WHERE created_at > ?` if tenant_id is not in the WHERE clause?',
        options: [
          'Composite indexes only work for INNER JOIN statements',
          'A composite index is ordered left-to-right; queries skipping the leading column cannot seek without a skip-scan',
          'created_at must always be the first column in composite indexes',
          'PostgreSQL automatically converts composite indexes into hash maps'
        ],
        correctOptionIndex: 1,
        weight: 1.0
      }
    ]
  },
  'gap-auth-jwt': {
    conceptTitle: 'Stateless JWT Invalidation & Refresh Token Rotation',
    category: 'SECURITY',
    errorPattern: 'Stored long-lived JWT access tokens in localStorage without refresh token rotation or server-side blacklist mechanisms.',
    severity: 'CRITICAL',
    misunderstoodPrinciple: 'Access tokens must be short-lived (5-15 min) in memory; persistent authorization must use HttpOnly Secure refresh cookies with single-use rotation.',
    drill: {
      title: 'Secure Token Lifecycles & Replay Protection',
      readingMinutes: 5,
      coreRule: 'Never store JWT access tokens in localStorage where XSS attacks can exfiltrate them. Use short-lived memory access tokens and rotating HttpOnly refresh tokens.',
      codeSnippet: {
        language: 'typescript',
        flawedCode: '// Flawed: Storing 30-day token in browser storage\nlocalStorage.setItem("authToken", token);\n// Vulnerable to any third-party script injection!',
        correctedCode: '// Correct: Return short-lived token in JSON body, set Refresh Token in HttpOnly cookie\nres.cookie("refreshToken", tokenFamilyId, {\n  httpOnly: true,\n  secure: process.env.NODE_ENV === "production",\n  sameSite: "strict",\n  maxAge: 7 * 24 * 60 * 60 * 1000\n});',
        explanation: 'HttpOnly cookies cannot be read by JavaScript document.cookie, neutralizing token theft via XSS.'
      },
      checkpointQuestion: {
        question: 'What should a backend do when a previously used refresh token from a token family is presented again?',
        options: [
          'Silently issue a new access token anyway',
          'Trigger Refresh Token Reuse Detection: invalidate the entire token family and log out all active sessions',
          'Wait 60 seconds before responding',
          'Update the token expiration by 5 minutes'
        ],
        correctIndex: 1,
        explanation: 'Re-presenting an already consumed refresh token indicates token theft; immediately invalidating the entire family protects the user.'
      }
    },
    reassessment: [
      {
        id: 'rq-auth-1',
        conceptId: 'gap-auth-jwt',
        prompt: 'Which cookie attribute prevents client-side malicious scripts from reading an authentication refresh cookie via document.cookie?',
        options: ['SameSite=Lax', 'HttpOnly', 'Domain=.example.com', 'Path=/auth'],
        correctOptionIndex: 1,
        weight: 1.0
      },
      {
        id: 'rq-auth-2',
        conceptId: 'gap-auth-jwt',
        prompt: 'In a stateless microservices setup, how can a high-privilege logout or revoking of a compromised account be propagated before short-lived JWT expires?',
        options: [
          'Change the microservice database port',
          'Maintain a lightweight Redis blacklist / version counter checked during authorization',
          'Send emails to all active sessions',
          'Re-generate all public/private key pairs every minute'
        ],
        correctOptionIndex: 1,
        weight: 1.0
      }
    ]
  },
  'gap-async-eventloop': {
    conceptTitle: 'Node.js Event Loop Blocking & Microtask Starvation',
    category: 'BACKEND',
    errorPattern: 'Executed CPU-heavy sync computations or uncontrolled recursive Promises directly in Express request handlers.',
    severity: 'MODERATE',
    misunderstoodPrinciple: 'Node.js single-threaded event loop stops processing all I/O events while executing synchronous loops or large JSON parsing.',
    drill: {
      title: 'Offloading Heavy CPU Work & Chunking Large Computations',
      readingMinutes: 4,
      coreRule: 'Keep the event loop turn time under 10ms. Offload heavy cryptographic hashing, image processing, or big data transforms to Worker Threads or external queues.',
      codeSnippet: {
        language: 'typescript',
        flawedCode: '// Flawed: Blocks the entire Node server for 2 seconds!\napp.post("/encrypt-large", (req, res) => {\n  const result = heavySyncCryptoOperation(req.body.data);\n  res.json({ result });\n});',
        correctedCode: '// Correct: Offload to worker thread pool\napp.post("/encrypt-large", async (req, res) => {\n  const result = await workerPool.run({ data: req.body.data });\n  res.json({ result });\n});',
        explanation: 'Worker threads run in separate OS threads with their own V8 isolates, keeping the main HTTP event loop responsive to incoming traffic.'
      },
      checkpointQuestion: {
        question: 'Which queue in Node.js has priority over timers (setTimeout/setInterval) and I/O callbacks on each loop turn?',
        options: [
          'Check queue (setImmediate)',
          'Close callbacks queue',
          'Microtask queue (process.nextTick and Promise.then)',
          'I/O Polling queue'
        ],
        correctIndex: 2,
        explanation: 'The microtask queue drains immediately after the current operation finishes and before moving to the next event loop phase.'
      }
    },
    reassessment: [
      {
        id: 'rq-loop-1',
        conceptId: 'gap-async-eventloop',
        prompt: 'What happens if a Node.js process executes `while(true) {}` inside an Express route handler?',
        options: [
          'Express creates a new thread for subsequent requests',
          'The entire process freezes; zero incoming HTTP requests can be accepted or answered',
          'The OS kills the process after 30 seconds automatically',
          'The garbage collector pauses the loop'
        ],
        correctOptionIndex: 1,
        weight: 1.0
      }
    ]
  }
};

export class DiagnosticEngine {
  /**
   * Generates a personalized remediation package for a student's assessment gap.
   */
  public static createRemediationPackage(
    studentId: string,
    sourceExamId: string,
    sourceExamTitle: string,
    skillId: string,
    initialScore: number
  ): DiagnosticRemediationPackage {
    // Select most relevant gap based on skillId or fallback
    let gapKey = 'gap-sql-indexing';
    if (skillId.includes('auth') || skillId.includes('sec') || skillId.includes('jwt')) {
      gapKey = 'gap-auth-jwt';
    } else if (skillId.includes('node') || skillId.includes('js') || skillId.includes('async')) {
      gapKey = 'gap-async-eventloop';
    }

    const kbItem = DIAGNOSTIC_KNOWLEDGE_BASE[gapKey];
    const loopId = `loop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const conceptGap: DiagnosticConceptGap = {
      conceptId: gapKey,
      conceptTitle: kbItem.conceptTitle,
      category: kbItem.category,
      errorPattern: kbItem.errorPattern,
      severity: kbItem.severity,
      misunderstoodPrinciple: kbItem.misunderstoodPrinciple,
    };

    const microDrill: MicroLearningDrill = {
      id: `drill-${gapKey}`,
      conceptId: gapKey,
      title: kbItem.drill.title,
      readingMinutes: kbItem.drill.readingMinutes,
      coreRule: kbItem.drill.coreRule,
      codeSnippet: kbItem.drill.codeSnippet,
      checkpointQuestion: kbItem.drill.checkpointQuestion,
    };

    return {
      loopId,
      studentId,
      sourceExamId,
      sourceExamTitle,
      skillId,
      skillName: this.formatSkillName(skillId),
      initialScore,
      status: 'PENDING_REVIEW',
      conceptGaps: [conceptGap],
      microDrill,
      reassessmentQuestions: kbItem.reassessment,
      createdTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluates student's answers on the reassessment challenge.
   * Computes score, improvement delta, and determines if mastery is achieved.
   */
  public static evaluateReassessment(
    pkg: DiagnosticRemediationPackage,
    answers: Array<{ questionId: string; selectedIndex: number }>
  ): {
    reassessmentScore: number;
    initialScore: number;
    improvementDelta: number;
    masteryAchieved: boolean;
    feedback: string;
    upgradedStatus: 'MASTERED' | 'DRILL_IN_PROGRESS';
  } {
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const q of pkg.reassessmentQuestions) {
      totalWeight += q.weight;
      const userAns = answers.find(a => a.questionId === q.id);
      if (userAns && userAns.selectedIndex === q.correctOptionIndex) {
        earnedWeight += q.weight;
      }
    }

    const reassessmentScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
    const masteryAchieved = reassessmentScore >= 75;
    const improvementDelta = Math.max(0, reassessmentScore - pkg.initialScore);

    const feedback = masteryAchieved
      ? `Outstanding! You scored ${reassessmentScore}% on the targeted reassessment (+${improvementDelta}% boost). Concept deficit successfully repaired.`
      : `You scored ${reassessmentScore}%. Review the core rule and retry the checkpoint drill to finalize mastery.`;

    return {
      reassessmentScore,
      initialScore: pkg.initialScore,
      improvementDelta,
      masteryAchieved,
      feedback,
      upgradedStatus: masteryAchieved ? 'MASTERED' : 'DRILL_IN_PROGRESS',
    };
  }

  private static formatSkillName(skillId: string): string {
    const raw = skillId.replace(/^skill-/, '').replace(/-/g, ' ');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
}
