import { SimulationEngine } from '../../src/modules/simulations/simulation.engine';
import { SimulationService } from '../../src/modules/simulations/simulation.service';
import { PassportService } from '../../src/modules/passport/passport.service';

describe('Feature 7: Real-World Job Readiness Simulations', () => {
  it('loads production-grade incident scenarios with telemetry logs and config files', () => {
    const scenarios = SimulationEngine.getAllScenarios();
    expect(scenarios.length).toBeGreaterThanOrEqual(2);

    const checkoutScenario = scenarios.find(s => s.id === 'incident-checkout-pool');
    expect(checkoutScenario).toBeDefined();
    expect(checkoutScenario?.telemetryLogs.length).toBeGreaterThan(3);
    expect(checkoutScenario?.metricsTimeline.length).toBeGreaterThan(2);
    expect(checkoutScenario?.configFile.filename).toContain('database.json');
    expect(checkoutScenario?.flawedSourceCode.content).toContain('coupons');
    expect(checkoutScenario?.rootCauseOptions.length).toBeGreaterThan(1);
    expect(checkoutScenario?.operationalActions.length).toBeGreaterThan(1);
  });

  it('evaluates candidate performance across log analysis, root cause, action, and patch', () => {
    const evaluation = SimulationEngine.evaluateSubmission({
      scenarioId: 'incident-checkout-pool',
      selectedRootCauseId: 'rc-2', // Correct: DB connection pool starvation
      selectedActionId: 'act-1', // Correct: scale pool, route reads to replica, index coupons
      investigationNotes: 'Inspected HikariCP connection timeout logs; 340 threads waiting due to slow scan on coupons without read replica.',
      patchCode: `
        // Route to read replica pool and release client cleanly
        const client = await readPool.connect();
        try {
          return await client.query('SELECT * FROM coupons WHERE code = $1', [code]);
        } finally {
          client.release();
        }
      `,
    });

    expect(evaluation.passed).toBe(true);
    expect(evaluation.overallScore).toBeGreaterThanOrEqual(80);
    expect(evaluation.rootCauseScore).toBe(35);
    expect(evaluation.operationalJudgmentScore).toBe(10);
    expect(evaluation.readinessTier).toBe('INDUSTRY_READY');
    expect(evaluation.passportEvidenceAwarded).toBe(true);
  });

  it('penalizes incorrect diagnostic assumptions and risky operational actions', () => {
    const evaluation = SimulationEngine.evaluateSubmission({
      scenarioId: 'incident-checkout-pool',
      selectedRootCauseId: 'rc-1', // Wrong: memory leak
      selectedActionId: 'act-2', // Wrong: restart instances blindly
      investigationNotes: 'I think the server ran out of RAM so I will restart it.',
      patchCode: 'process.exit(1);',
    });

    expect(evaluation.passed).toBe(false);
    expect(evaluation.overallScore).toBeLessThan(70);
    expect(evaluation.readinessTier).toBe('NEEDS_PRACTICE');
    expect(evaluation.passportEvidenceAwarded).toBe(false);
  });

  it('integrates with SimulationService to automatically record practical simulation evidence on passport', async () => {
    const studentId = 'student-sim-tester';

    const evaluation = await SimulationService.evaluateAndRecord(studentId, {
      scenarioId: 'sec-invoice-idor',
      selectedRootCauseId: 'rc-idor-1',
      selectedActionId: 'act-idor-1',
      investigationNotes: 'IDOR vulnerability detected in invoice controller. Tenant check missing for organizationId.',
      patchCode: `
        const invoice = await db.invoice.findFirst({
          where: { id: invoiceId, organizationId: req.user.organizationId }
        });
        if (!invoice) return res.status(403).json({ error: 'Unauthorized tenant access' });
      `,
    });

    expect(evaluation.passed).toBe(true);
    expect(evaluation.passportEvidenceAwarded).toBe(true);

    // Verify passport evidence item
    const passport = await PassportService.getOrCreatePassport(studentId);
    const authSkill = passport.skills.find((s: any) => s.skillId === 'skill-auth-jwt');
    expect(authSkill).toBeDefined();
    const simProof = authSkill?.evidenceItems.find((e: any) => e.type === 'PRACTICAL_SIMULATION');
    expect(simProof).toBeDefined();
    expect(simProof?.title).toContain('Real-World Simulation Passed');
  });
});
