import { AuthenticityEngine, EVIDENCE_WEIGHTS } from '../../src/modules/passport/authenticity.engine';
import { EvidenceItem } from '../../src/modules/passport/skillPassport.types';

describe('Feature 1 & 6: AuthenticityEngine & Skill Decay', () => {
  it('assigns higher confidence to diagnostic test than resume claim', () => {
    const resumeClaim: EvidenceItem = {
      id: 'e1',
      type: 'RESUME_PARSED',
      title: 'Python mentioned on resume',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'Vidyut Resume Parser',
      weight: EVIDENCE_WEIGHTS.RESUME_PARSED,
    };

    const diagnosticTest: EvidenceItem = {
      id: 'e2',
      type: 'DIAGNOSTIC_ASSESSMENT',
      title: 'Python Diagnostic Assessment',
      score: 85,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'Vidyut Testing Engine',
      weight: EVIDENCE_WEIGHTS.DIAGNOSTIC_ASSESSMENT,
    };

    const claimResult = AuthenticityEngine.calculateCompoundConfidence([resumeClaim]);
    const testResult = AuthenticityEngine.calculateCompoundConfidence([diagnosticTest]);

    expect(claimResult.confidence).toBeLessThan(testResult.confidence);
    expect(testResult.level).toBe('ASSESSMENT_VERIFIED');
    expect(claimResult.level).toBe('UNVERIFIED_CLAIM');
  });

  it('boosts confidence when multiple tiered evidence sources are combined', () => {
    const multiSource: EvidenceItem[] = [
      {
        id: 'e1',
        type: 'DIAGNOSTIC_ASSESSMENT',
        title: 'Python Test',
        score: 90,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Testing Engine',
        weight: 0.8,
      },
      {
        id: 'e2',
        type: 'GITHUB_REPOSITORY',
        title: 'FastAPI Production Project',
        sourceUrl: 'https://github.com/student/app',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'GitHub Auditor',
        weight: 0.55,
      },
      {
        id: 'e3',
        type: 'PRACTICAL_SIMULATION',
        title: 'API Bug Troubleshooting Sandbox',
        score: 95,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Simulation Engine',
        weight: 0.95,
      },
    ];

    const result = AuthenticityEngine.calculateCompoundConfidence(multiSource);

    expect(result.confidence).toBeGreaterThanOrEqual(85);
    expect(result.level).toBe('SIMULATION_VALIDATED');
    expect(result.breakdown.assessmentPct).toBeGreaterThan(0);
    expect(result.breakdown.practicalProjectsPct).toBeGreaterThan(0);
  });

  it('calculates skill decay accurately after 90-day grace period', () => {
    const recentDate = new Date(Date.now() - 30 * 86400000).toISOString(); // 30 days ago
    const oldDate = new Date(Date.now() - 150 * 86400000).toISOString();   // 150 days ago (60 days overdue)

    const recentDecay = AuthenticityEngine.calculateDecay(85, recentDate);
    expect(recentDecay.isDecayed).toBe(false);
    expect(recentDecay.currentConfidence).toBe(85);
    expect(recentDecay.refresherRecommended).toBe(false);

    const overdueDecay = AuthenticityEngine.calculateDecay(85, oldDate);
    expect(overdueDecay.isDecayed).toBe(true);
    expect(overdueDecay.currentConfidence).toBeLessThan(85);
    expect(overdueDecay.decayPercentage).toBeGreaterThan(0);
    expect(overdueDecay.refresherRecommended).toBe(true);
    expect(overdueDecay.recommendedRefresherTimeMinutes).toBeGreaterThanOrEqual(15);
  });

  it('maps confidence score correctly to proficiency levels', () => {
    expect(AuthenticityEngine.deriveProficiency(92)).toBe('EXPERT');
    expect(AuthenticityEngine.deriveProficiency(75)).toBe('PROFICIENT');
    expect(AuthenticityEngine.deriveProficiency(55)).toBe('COMPETENT');
    expect(AuthenticityEngine.deriveProficiency(30)).toBe('NOVICE');
    expect(AuthenticityEngine.deriveProficiency(15)).toBe('AWARENESS');
  });
});
