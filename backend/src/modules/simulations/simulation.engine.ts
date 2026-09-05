/**
 * Vidyut Job Simulation Engine
 * Manages realistic incident scenarios and scores operational judgment, log analysis, and code patches.
 */

import {
  JobSimulationScenario,
  SimulationSubmission,
  SimulationEvaluation,
} from './job_simulation.types';

const REAL_WORLD_SCENARIOS: JobSimulationScenario[] = [
  {
    id: 'incident-checkout-pool',
    title: 'P0 Outage: Flash Sale 504 Gateway Timeouts & Connection Pool Starvation',
    targetRole: 'Backend & Systems Engineer',
    difficulty: 'PRODUCTION_CRITICAL',
    timeLimitMinutes: 25,
    incidentBrief: 'At 12:02 PM, traffic spiked 8x during the Diwali flash sale. API latency skyrocketed from 45ms to 4,200ms, and /api/checkout endpoints are failing with HTTP 504. The web instances are at low CPU (18%), but requests are hanging.',
    impactStatement: 'Over ₹18 Lakhs in cart abandonment per minute. Immediate incident mitigation required.',
    telemetryLogs: [
      { timestamp: '12:02:14.201', level: 'INFO', service: 'api-gateway', message: 'Inbound traffic surge: 4,500 req/sec routed to checkout-service cluster.' },
      { timestamp: '12:02:18.490', level: 'WARN', service: 'checkout-service', message: 'HikariCP-1 - Connection acquisition time exceeded 1000ms threshold.' },
      { timestamp: '12:02:22.114', level: 'WARN', service: 'checkout-service', message: 'Pool stats: (total=20, active=20, idle=0, waiting=340)' },
      { timestamp: '12:02:25.801', level: 'ERROR', service: 'checkout-service', message: 'HikariCP-1 - Connection is not available, request timed out after 30005ms.' },
      { timestamp: '12:02:28.012', level: 'FATAL', service: 'api-gateway', message: 'Upstream timed out (504 Gateway Timeout) on POST /api/checkout/process' },
      { timestamp: '12:02:30.419', level: 'WARN', service: 'db-pg-primary', message: 'Slow query detected: SELECT * FROM coupons WHERE code = ? (duration: 3820ms, Seq Scan on coupons)' }
    ],
    metricsTimeline: [
      { time: '12:00', cpuPercent: 12, memoryPercent: 34, activeDbConnections: 4, latencyMs: 38, errorRatePercent: 0 },
      { time: '12:02', cpuPercent: 18, memoryPercent: 41, activeDbConnections: 20, latencyMs: 1450, errorRatePercent: 8 },
      { time: '12:04', cpuPercent: 22, memoryPercent: 48, activeDbConnections: 20, latencyMs: 4200, errorRatePercent: 64 },
      { time: '12:06', cpuPercent: 19, memoryPercent: 49, activeDbConnections: 20, latencyMs: 4180, errorRatePercent: 78 }
    ],
    configFile: {
      filename: 'config/database.json',
      language: 'json',
      content: JSON.stringify({
        database: 'ecommerce_production',
        pool: {
          max_connections: 20,
          min_idle: 5,
          connection_timeout_ms: 30000,
          idle_timeout_ms: 600000
        },
        read_replicas: [
          'pg-replica-01.internal',
          'pg-replica-02.internal'
        ]
      }, null, 2)
    },
    flawedSourceCode: {
      filename: 'src/services/coupon.service.ts',
      language: 'typescript',
      content: `import { pool } from '../db';

export async function validateCoupon(code: string) {
  // Bypasses read replica and uses write connection pool with non-indexed sequential scan!
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM coupons WHERE LOWER(code) = LOWER($1)',
      [code]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}`
    },
    rootCauseOptions: [
      {
        id: 'rc-1',
        label: 'Node.js memory leak caused the V8 garbage collector to freeze the event loop.',
        isCorrect: false,
        explanation: 'Memory is stable at 48% and CPU is low (18%); the issue is synchronous I/O waiting on DB connections.'
      },
      {
        id: 'rc-2',
        label: 'Database connection pool starvation caused by unindexed sequential scans on the primary write pool instead of read replicas.',
        isCorrect: true,
        explanation: 'HikariCP stats show 20/20 active connections and 340 waiting threads due to 3.8s sequential scans on the coupon table locking the write pool.'
      },
      {
        id: 'rc-3',
        label: 'API Gateway SSL certificate handshake negotiation failure.',
        isCorrect: false,
        explanation: 'Traffic is successfully reaching the checkout service; timeouts originate from upstream service response delays.'
      }
    ],
    operationalActions: [
      {
        id: 'act-1',
        label: 'Temporarily scale max_connections to 60, route coupon reads to read-replica cluster, and hotfix an index on coupons(code).',
        isOptimal: true,
        rationale: 'Offloads read load to replicas while raising the pool limit safely to unblock active transactions.'
      },
      {
        id: 'act-2',
        label: 'Immediately terminate and restart all API server instances.',
        isOptimal: false,
        rationale: 'Restarting instances drops all in-flight carts without fixing the root cause, causing a thundering herd on restart.'
      },
      {
        id: 'act-3',
        label: 'Rollback the frontend deployment to yesterday’s bundle.',
        isOptimal: false,
        rationale: 'The issue is in the backend database query and connection pool config, not the frontend UI.'
      }
    ],
    expectedPatchKeywords: ['replica', 'index', 'readPool', 'query', 'release']
  },
  {
    id: 'sec-invoice-idor',
    title: 'Security Vulnerability: Horizontal Privilege Escalation (IDOR) on Invoices',
    targetRole: 'Full-Stack & Security Architect',
    difficulty: 'ADVANCED',
    timeLimitMinutes: 20,
    incidentBrief: 'A penetration test disclosed that authenticated enterprise clients can download invoices belonging to competitor organizations by substituting the `invoiceId` UUID parameter in GET /api/v1/invoices/:invoiceId.',
    impactStatement: 'Breach of confidential pricing contracts and enterprise compliance violation (SOC2 / GDPR).',
    telemetryLogs: [
      { timestamp: '14:15:02.102', level: 'INFO', service: 'audit-log', message: 'User usr_alpha (Org: org_acme) requested GET /api/v1/invoices/inv_9842_beta' },
      { timestamp: '14:15:02.115', level: 'WARN', service: 'invoice-controller', message: 'Invoice inv_9842_beta belongs to org_globex, but fetched by user from org_acme with status 200 OK.' }
    ],
    metricsTimeline: [
      { time: '14:10', cpuPercent: 8, memoryPercent: 22, activeDbConnections: 2, latencyMs: 22, errorRatePercent: 0 },
      { time: '14:15', cpuPercent: 9, memoryPercent: 23, activeDbConnections: 2, latencyMs: 24, errorRatePercent: 0 }
    ],
    configFile: {
      filename: 'src/middleware/auth.ts',
      language: 'typescript',
      content: `// Authenticates JWT and attaches req.user: { id, email, organizationId }
export function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  req.user = verifyToken(token);
  next();
}`
    },
    flawedSourceCode: {
      filename: 'src/controllers/invoice.controller.ts',
      language: 'typescript',
      content: `import { Request, Response } from 'express';
import { db } from '../db';

export async function getInvoiceById(req: Request, res: Response) {
  const { invoiceId } = req.params;
  
  // FLAW: Queries solely by invoiceId without scoping to req.user.organizationId!
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId }
  });

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  return res.json({ success: true, invoice });
}`
    },
    rootCauseOptions: [
      {
        id: 'rc-idor-1',
        label: 'Insecure Direct Object Reference (IDOR): The query trusts client input without verifying that the invoice belongs to the requesting tenant organization.',
        isCorrect: true,
        explanation: 'The SQL/ORM query lacks an organizationId tenant constraint, allowing any authenticated user to view arbitrary invoices.'
      },
      {
        id: 'rc-idor-2',
        label: 'SQL Injection vulnerability through the invoiceId parameter string.',
        isCorrect: false,
        explanation: 'An ORM (findUnique) parameterized query is used, so classic SQL injection is mitigated; the flaw is missing authorization checks.'
      }
    ],
    operationalActions: [
      {
        id: 'act-idor-1',
        label: 'Add a compound tenant filter `where: { id: invoiceId, organizationId: req.user.organizationId }` and log unauthorized attempt telemetry.',
        isOptimal: true,
        rationale: 'Enforces strict multi-tenant data isolation and alerts security teams on cross-tenant probes.'
      },
      {
        id: 'act-idor-2',
        label: 'Change the invoiceId format from UUID to sequential integers.',
        isOptimal: false,
        rationale: 'Sequential integers make guessing competitor IDs even easier, exacerbating the vulnerability.'
      }
    ],
    expectedPatchKeywords: ['organizationId', 'req.user', 'tenant', 'status(403)']
  }
];

export class SimulationEngine {
  /**
   * Retrieves all available job simulation scenarios.
   */
  public static getAllScenarios(): JobSimulationScenario[] {
    return REAL_WORLD_SCENARIOS;
  }

  /**
   * Retrieves a specific scenario by ID.
   */
  public static getScenarioById(id: string): JobSimulationScenario | null {
    return REAL_WORLD_SCENARIOS.find(s => s.id === id) || null;
  }

  /**
   * Evaluates a candidate's incident investigation, root cause diagnosis, operational action, and code patch.
   */
  public static evaluateSubmission(submission: SimulationSubmission): SimulationEvaluation {
    const scenario = this.getScenarioById(submission.scenarioId) || REAL_WORLD_SCENARIOS[0];

    // 1. Root Cause Diagnosis (35 pts)
    const selectedRc = scenario.rootCauseOptions.find(o => o.id === submission.selectedRootCauseId);
    const rootCauseScore = selectedRc && selectedRc.isCorrect ? 35 : 10;
    const rootCauseFeedback = selectedRc
      ? selectedRc.explanation
      : 'No valid root cause selected.';

    // 2. Operational Action Decision (10 pts)
    const selectedAct = scenario.operationalActions.find(a => a.id === submission.selectedActionId);
    const operationalJudgmentScore = selectedAct && selectedAct.isOptimal ? 10 : 3;
    const operationalFeedback = selectedAct
      ? selectedAct.rationale
      : 'Action lacked clear operational justification.';

    // 3. Log Analysis & Notes (35 pts)
    let logAnalysisScore = 15;
    const notesLower = (submission.investigationNotes || '').toLowerCase();
    if (notesLower.includes('hikari') || notesLower.includes('connection') || notesLower.includes('pool') || notesLower.includes('idor') || notesLower.includes('tenant')) {
      logAnalysisScore += 10;
    }
    if (notesLower.includes('slow') || notesLower.includes('latency') || notesLower.includes('scan') || notesLower.includes('replica') || notesLower.includes('organization')) {
      logAnalysisScore += 10;
    }

    // 4. Code Patch Quality (20 pts)
    let patchScore = 5;
    const patchLower = (submission.patchCode || '').toLowerCase();
    let matchedKeywords = 0;
    for (const kw of scenario.expectedPatchKeywords) {
      if (patchLower.includes(kw.toLowerCase())) {
        matchedKeywords++;
      }
    }
    if (matchedKeywords >= 3) {
      patchScore = 20;
    } else if (matchedKeywords >= 1) {
      patchScore = 12;
    }

    const patchFeedback = patchScore >= 18
      ? 'Patch adheres to engineering best practices and resolves the vulnerability/incident cleanly.'
      : 'Patch partially addresses the issue but missed key production defensive patterns.';

    const overallScore = rootCauseScore + operationalJudgmentScore + logAnalysisScore + patchScore;
    const passed = overallScore >= 70;

    const readinessTier = overallScore >= 85
      ? 'INDUSTRY_READY'
      : overallScore >= 70
      ? 'INTERN_READY'
      : 'NEEDS_PRACTICE';

    return {
      scenarioId: scenario.id,
      overallScore,
      logAnalysisScore,
      rootCauseScore,
      patchScore,
      operationalJudgmentScore,
      readinessTier,
      passed,
      feedback: {
        rootCauseFeedback,
        operationalFeedback,
        patchFeedback,
      },
      passportEvidenceAwarded: passed,
    };
  }
}
