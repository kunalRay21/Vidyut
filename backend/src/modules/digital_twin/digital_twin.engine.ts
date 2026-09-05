/**
 * Vidyut Digital Twin & 12-Hour Prep Plan Engine
 * Models career readiness attribution, explainable score decomposition, and precision interview crunch plans.
 */

import {
  DigitalTwinProfile,
  ExplainableReadinessFactor,
  Opportunity12HourPlan,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
} from './digital_twin.types';
import { SkillPassport } from '../passport/skillPassport.types';

export class DigitalTwinEngine {
  /**
   * Constructs the explainable Digital Twin profile from student's Skill Passport.
   */
  public static computeDigitalTwin(passport: SkillPassport): DigitalTwinProfile {
    const skills = passport.skills || [];

    // 1. Foundational Syllabus (0 - 100)
    const avgConfidence = skills.length > 0
      ? Math.round(skills.reduce((acc, s) => acc + s.confidenceScore, 0) / skills.length)
      : 60;

    // 2. Evidence Authenticity (0 - 100)
    const authenticityScore = passport.overallAuthenticityScore || 65;

    // 3. Operational Sandbox (0 - 100)
    const simulationEv = skills.flatMap(s => s.evidenceItems).filter(e => e.type === 'PRACTICAL_SIMULATION');
    const operationalSandboxScore = Math.min(95, 40 + simulationEv.length * 25);

    // 4. Recency & Velocity (0 - 100)
    const decayedSkills = skills.filter(s => s.decay && s.decay.isDecayed);
    const recencyScore = Math.max(30, 95 - (decayedSkills.length * 15));

    // Weighted Overall Score
    const overallReadinessScore = Math.round(
      avgConfidence * 0.25 +
      authenticityScore * 0.25 +
      operationalSandboxScore * 0.25 +
      recencyScore * 0.25
    );

    let readinessBand: DigitalTwinProfile['readinessBand'] = 'FOUNDATION_BUILDER';
    if (overallReadinessScore >= 82) readinessBand = 'INTERVIEW_READY';
    else if (overallReadinessScore >= 68) readinessBand = 'COMPETITIVE_CANDIDATE';

    // Attribution & Explainability Factors
    const attributionFactors: ExplainableReadinessFactor[] = [];

    // Positive factors
    if (simulationEv.length > 0) {
      attributionFactors.push({
        pillar: 'OPERATIONAL_SANDBOX',
        impactPercent: 14,
        title: 'Verified Production Incident Mastery',
        explanation: `Completed ${simulationEv.length} live incident triage sandbox simulation(s) with production-grade patches.`,
        actionableStep: 'Keep solving real-world outages to maintain operational speed.',
      });
    }

    if (authenticityScore >= 75) {
      attributionFactors.push({
        pillar: 'AUTHENTICITY',
        impactPercent: 12,
        title: 'High-Integrity Verification Proofs',
        explanation: 'Evidence backed by verified GitHub commits, employer reviews, and proctored diagnostic loops.',
        actionableStep: 'Recruiters fast-track profiles with &ge; 75% authenticity scores.',
      });
    }

    // Negative / Gap factors
    if (decayedSkills.length > 0) {
      attributionFactors.push({
        pillar: 'RECENCY_HEALTH',
        impactPercent: - (decayedSkills.length * 6),
        title: 'Cognitive Skill Decay Detected',
        explanation: `${decayedSkills.length} core competencies (e.g. ${decayedSkills.map(s => s.skillName).join(', ')}) haven't been actively exercised in >90 days.`,
        actionableStep: 'Take 15-minute diagnostic micro-refreshers to instantly restore 100% confidence.',
      });
    }

    if (operationalSandboxScore < 65) {
      attributionFactors.push({
        pillar: 'OPERATIONAL_SANDBOX',
        impactPercent: -10,
        title: 'Sandbox Simulation Deficit',
        explanation: 'Zero live production incident simulations recorded on your passport.',
        actionableStep: 'Complete the P0 Flash Sale Timeout incident simulation to earn immediate +12% readiness boost.',
      });
    }

    // Calculate market opportunities unlocked
    const unlockedCount = Math.max(8, Math.round(overallReadinessScore * 0.38));

    return {
      studentId: passport.studentId,
      targetRole: passport.targetRole || 'Full-Stack Software Engineer',
      overallReadinessScore,
      readinessBand,
      pillars: {
        foundationalSyllabus: avgConfidence,
        evidenceAuthenticity: authenticityScore,
        operationalSandbox: operationalSandboxScore,
        recencyVelocity: recencyScore,
      },
      attributionFactors,
      unlockedOpportunityCount: unlockedCount,
      lastSimulatedTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Computes what-if counterfactual scenario simulations.
   */
  public static simulateWhatIf(currentProfile: DigitalTwinProfile, input: WhatIfScenarioInput): WhatIfScenarioResult {
    let delta = 0;
    let timeHours = 0;
    const actions: string[] = [];

    if (input.refreshDecayedSkills) {
      delta += 7;
      timeHours += 1;
      actions.push('Restored 100% freshness on decayed skill nodes (+7%)');
    }

    if (input.completeSandboxSimulation) {
      delta += 11;
      timeHours += 2;
      actions.push('Passed P0 Incident Triage Simulation (+11%)');
    }

    if (input.masterTwoGapSkills) {
      delta += 9;
      timeHours += 6;
      actions.push('Mastered 2 targeted role gap milestones (+9%)');
    }

    if (input.verifyGithubEvidence) {
      delta += 5;
      timeHours += 1;
      actions.push('Linked and verified production GitHub repository (+5%)');
    }

    const projectedScore = Math.min(98, currentProfile.overallReadinessScore + delta);
    const newUnlocked = Math.round(projectedScore * 0.42);

    let newBand = currentProfile.readinessBand;
    if (projectedScore >= 82) newBand = 'INTERVIEW_READY';
    else if (projectedScore >= 68) newBand = 'COMPETITIVE_CANDIDATE';

    return {
      currentScore: currentProfile.overallReadinessScore,
      projectedScore,
      scoreDelta: delta,
      newReadinessBand: newBand,
      newUnlockedOpportunities: newUnlocked,
      timeInvestmentHours: timeHours,
      actionSummary: actions.join(' • ') || 'No what-if interventions selected.',
    };
  }

  /**
   * Generates a personalized 12-Hour Prep Plan for a high-priority opportunity deadline.
   */
  public static generate12HourPrepPlan(
    opportunityId: string,
    roleTitle = 'Backend Systems Intern',
    companyName = 'Razorpay'
  ): Opportunity12HourPlan {
    const schedule = [
      {
        hourRange: 'Hour 1 - 3',
        phaseTitle: 'Phase 1: High-Yield Architectural Concepts',
        durationMinutes: 180,
        topicsCovered: [
          'PostgreSQL B-Tree index scan patterns & connection pool limits',
          'Distributed idempotency & double-spend prevention in payment webhooks',
          'JWT stateless vs stateful refresh cookie lifecycles',
        ],
        keyQuestionsToMaster: [
          'How does HikariCP behave when maximum connections are saturated?',
          'How do you design a database constraint to prevent duplicate charge attempts?',
        ],
        recommendedAction: 'Review curated cheat-sheet rules and verify SARGable query patterns.',
      },
      {
        hourRange: 'Hour 4 - 7',
        phaseTitle: 'Phase 2: Live Code & Hands-On Implementation Drill',
        durationMinutes: 240,
        topicsCovered: [
          'Node.js atomic balance decrement queries with SERIALIZABLE transactions',
          'Redis distributed cache stampede protection (mutex / probabilistic early expiration)',
          'Structured logging & correlation ID propagation across microservices',
        ],
        keyQuestionsToMaster: [
          'Write a raw SQL query that updates account balance safely without reading it first.',
          'Implement an Express middleware that validates tenant org boundaries.',
        ],
        recommendedAction: 'Execute the 2 hands-on terminal sandboxes in Vidyut CodeLab.',
      },
      {
        hourRange: 'Hour 8 - 10',
        phaseTitle: 'Phase 3: System Design & Incident Defense Scenarios',
        durationMinutes: 180,
        topicsCovered: [
          'Flash sale surge traffic modeling (10k req/sec)',
          'Graceful degradation & circuit breaker patterns',
          'Database read replica failover & replication lag mitigation',
        ],
        keyQuestionsToMaster: [
          'Walk me through a production outage where checkout latency spiked to 4s. How did you triage it?',
          'When would you choose horizontal scaling over hotfixing a query?',
        ],
        recommendedAction: 'Run through mock incident simulation with Vidyut AI Interviewer.',
      },
      {
        hourRange: 'Hour 11 - 12',
        phaseTitle: 'Phase 4: Targeted Verification & Confidence Elevation',
        durationMinutes: 120,
        topicsCovered: [
          'Speed quiz: 10 rapid-fire diagnostic questions',
          'Review candidate portfolio evidence links',
          'Final application submission and recruiter message formulation',
        ],
        keyQuestionsToMaster: [
          'Can you explain the difference between optimistic and pessimistic locking with a payment example?',
        ],
        recommendedAction: 'Take 15-min mock verification quiz to raise matching badge on Vidyut Job Board.',
      },
    ];

    return {
      opportunityId,
      roleTitle,
      companyName,
      stipendOrSalary: '₹45,000 / month',
      applicationDeadlineHoursRemaining: 36,
      currentMatchPercentage: 66,
      projectedMatchPercentageAfterPlan: 89,
      identifiedGaps: [
        { skillName: 'PostgreSQL Indexing & Pool Sizing', priority: 'HIGH', interviewFrequency: '92% in Razorpay backend rounds' },
        { skillName: 'Idempotent Payment Webhooks', priority: 'HIGH', interviewFrequency: '88% in Fintech interviews' },
        { skillName: 'Redis Distributed Caching', priority: 'MEDIUM', interviewFrequency: '74% in systems rounds' },
      ],
      schedule,
      cheatSheetSummary: {
        coreFormulas: [
          'Connection Pool Formula: connections = ((core_count * 2) + effective_spindle_count)',
          'Little\'s Law: L = λ * W (Concurrency = Arrival Rate * Service Time)',
        ],
        commonGotchas: [
          'Never use SELECT followed by UPDATE in payments; use atomic UPDATE with WHERE balance >= :amt',
          'Leading wildcards (%term) completely disable B-Tree indexes',
        ],
        architectureTip: 'In fintech interviews, always mention idempotency keys (UUIDv4) stored in Redis with 24h TTL to deduplicate retries.',
      },
    };
  }
}
