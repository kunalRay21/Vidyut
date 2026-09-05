import { DigitalTwinEngine } from '../../src/modules/digital_twin/digital_twin.engine';
import { DigitalTwinService } from '../../src/modules/digital_twin/digital_twin.service';
import { PassportService } from '../../src/modules/passport/passport.service';

describe('Feature 9 & 10: Digital Twin & 12-Hour Prep Plan Engine', () => {
  it('computes explainable 4-pillar digital twin from passport telemetry', async () => {
    const studentId = 'student-twin-tester';
    const passport = await PassportService.getOrCreatePassport(studentId);

    const twin = DigitalTwinEngine.computeDigitalTwin(passport);

    expect(twin.studentId).toBe(studentId);
    expect(twin.overallReadinessScore).toBeGreaterThanOrEqual(40);
    expect(twin.overallReadinessScore).toBeLessThanOrEqual(100);

    // Verify 4 pillars
    expect(twin.pillars.foundationalSyllabus).toBeGreaterThan(0);
    expect(twin.pillars.evidenceAuthenticity).toBeGreaterThan(0);
    expect(twin.pillars.operationalSandbox).toBeGreaterThan(0);
    expect(twin.pillars.recencyVelocity).toBeGreaterThan(0);

    // Verify explainable attribution
    expect(twin.attributionFactors.length).toBeGreaterThan(0);
    twin.attributionFactors.forEach(factor => {
      expect(factor.impactPercent).not.toBe(0);
      expect(factor.actionableStep.length).toBeGreaterThan(10);
    });

    expect(twin.unlockedOpportunityCount).toBeGreaterThan(0);
  });

  it('runs what-if counterfactual projections and forecasts readiness leap', async () => {
    const studentId = 'student-twin-tester-2';
    const twin = await DigitalTwinService.getStudentDigitalTwin(studentId);

    const projection = DigitalTwinEngine.simulateWhatIf(twin, {
      refreshDecayedSkills: true,
      completeSandboxSimulation: true,
      masterTwoGapSkills: true,
      verifyGithubEvidence: false,
    });

    expect(projection.scoreDelta).toBe(7 + 11 + 9); // 27 pts
    expect(projection.projectedScore).toBe(Math.min(98, twin.overallReadinessScore + 27));
    expect(projection.timeInvestmentHours).toBe(1 + 2 + 6); // 9 hours
    expect(projection.actionSummary).toContain('Restored 100% freshness');
    expect(projection.actionSummary).toContain('Passed P0 Incident');
  });

  it('generates a 12-Hour Opportunity Prep Plan with 4 chronological phases', () => {
    const plan = DigitalTwinEngine.generate12HourPrepPlan('opp-razorpay-backend', 'Backend Engineer Intern', 'Razorpay');

    expect(plan.opportunityId).toBe('opp-razorpay-backend');
    expect(plan.companyName).toBe('Razorpay');
    expect(plan.schedule.length).toBe(4);

    const totalDuration = plan.schedule.reduce((acc, b) => acc + b.durationMinutes, 0);
    expect(totalDuration).toBe(12 * 60); // 720 minutes = 12 hours

    expect(plan.projectedMatchPercentageAfterPlan).toBeGreaterThan(plan.currentMatchPercentage);
    expect(plan.identifiedGaps.length).toBeGreaterThan(0);
    expect(plan.cheatSheetSummary.coreFormulas.length).toBeGreaterThan(0);
    expect(plan.cheatSheetSummary.commonGotchas.length).toBeGreaterThan(0);
  });
});
