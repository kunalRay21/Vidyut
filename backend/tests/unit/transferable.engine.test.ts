import { TransferableEngine } from '../../src/modules/simulator/transferable.engine';

describe('Feature 3 & 4: TransferableEngine & Career Simulator', () => {
  it('identifies transferable skills when switching from Backend to Data Engineering', () => {
    const backendSkills = ['skill-python', 'skill-sql', 'skill-git', 'skill-rest', 'skill-docker'];
    const simulation = TransferableEngine.simulateRoleTransition(backendSkills, 'role-data', 'role-backend');

    expect(simulation.sourceRoleId).toBe('role-backend');
    expect(simulation.targetRoleId).toBe('role-data');
    expect(simulation.transferabilityIndex).toBeGreaterThanOrEqual(40);
    expect(simulation.transferableSkills.length).toBeGreaterThan(0);

    // SQL transfers to Advanced SQL
    const sqlTransfer = simulation.transferableSkills.find(
      s => s.sourceSkillId === 'skill-sql' && s.targetSkillId === 'skill-adv-sql'
    );
    expect(sqlTransfer).toBeDefined();
    expect(sqlTransfer?.transferRatio).toBe(0.85);

    // Remaining gap skills
    expect(simulation.gapSkills.length).toBeGreaterThan(0);
    expect(simulation.totalEstimatedHours).toBeGreaterThan(0);
    expect(simulation.estimatedWeeksAt10HoursPerWeek).toBeGreaterThan(0);
  });

  it('calculates 100% transferability if all skills match directly', () => {
    const cloudSkills = ['skill-linux', 'skill-networking', 'skill-docker', 'skill-cicd', 'skill-k8s', 'skill-terraform'];
    const simulation = TransferableEngine.simulateRoleTransition(cloudSkills, 'role-cloud', 'role-cloud');

    expect(simulation.gapSkills.length).toBe(0);
    expect(simulation.totalEstimatedHours).toBe(0);
    expect(simulation.transferabilityIndex).toBeGreaterThanOrEqual(90);
    expect(simulation.executiveSummary).toContain('immediate-application ready');
  });

  it('computes accurate estimated learning hours based on gap skill difficulties', () => {
    const beginnerSkills = ['skill-python'];
    const simulation = TransferableEngine.simulateRoleTransition(beginnerSkills, 'role-ml', 'role-backend');

    expect(simulation.gapSkills.length).toBeGreaterThan(2);
    // Each gap skill has positive estimated hours
    simulation.gapSkills.forEach(gap => {
      expect(gap.estimatedHours).toBeGreaterThanOrEqual(6);
      expect(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).toContain(gap.difficulty);
    });

    const expectedHoursSum = simulation.gapSkills.reduce((acc, g) => acc + g.estimatedHours, 0);
    expect(simulation.totalEstimatedHours).toBe(expectedHoursSum);
  });
});
