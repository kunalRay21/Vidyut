import { DiagnosticEngine } from '../../src/modules/learning_loop/diagnostic.engine';
import { LearningLoopService } from '../../src/modules/learning_loop/learning_loop.service';
import { PassportService } from '../../src/modules/passport/passport.service';

describe('Feature 5: Assessment -> Learning -> Reassessment Loop', () => {
  it('generates a precision remediation package for an assessment failure', () => {
    const pkg = DiagnosticEngine.createRemediationPackage(
      'student-test-1',
      'exam-sql-opt',
      'Database Optimization & Indexing',
      'skill-sql',
      52
    );

    expect(pkg.studentId).toBe('student-test-1');
    expect(pkg.initialScore).toBe(52);
    expect(pkg.status).toBe('PENDING_REVIEW');
    expect(pkg.conceptGaps.length).toBeGreaterThan(0);

    // Micro-learning drill checks
    expect(pkg.microDrill.readingMinutes).toBeGreaterThan(0);
    expect(pkg.microDrill.coreRule).toBeDefined();
    expect(pkg.microDrill.codeSnippet.language).toBe('sql');
    expect(pkg.microDrill.codeSnippet.flawedCode).toContain('Non-SARGable');
    expect(pkg.microDrill.codeSnippet.correctedCode).toContain('SARGable');

    // Reassessment questions exist
    expect(pkg.reassessmentQuestions.length).toBeGreaterThan(0);
  });

  it('evaluates reassessment answers and flags mastery when score >= 75%', () => {
    const pkg = DiagnosticEngine.createRemediationPackage(
      'student-test-1',
      'exam-sql-opt',
      'Database Optimization & Indexing',
      'skill-sql',
      50
    );

    // Provide correct answers for all questions
    const answers = pkg.reassessmentQuestions.map(q => ({
      questionId: q.id,
      selectedIndex: q.correctOptionIndex,
    }));

    const result = DiagnosticEngine.evaluateReassessment(pkg, answers);

    expect(result.reassessmentScore).toBe(100);
    expect(result.masteryAchieved).toBe(true);
    expect(result.improvementDelta).toBe(50);
    expect(result.upgradedStatus).toBe('MASTERED');
    expect(result.feedback).toContain('Outstanding');
  });

  it('keeps status in progress when student fails the reassessment challenge', () => {
    const pkg = DiagnosticEngine.createRemediationPackage(
      'student-test-1',
      'exam-sql-opt',
      'Database Optimization & Indexing',
      'skill-sql',
      50
    );

    // Provide wrong answers
    const wrongAnswers = pkg.reassessmentQuestions.map(q => ({
      questionId: q.id,
      selectedIndex: (q.correctOptionIndex + 1) % 4,
    }));

    const result = DiagnosticEngine.evaluateReassessment(pkg, wrongAnswers);

    expect(result.reassessmentScore).toBe(0);
    expect(result.masteryAchieved).toBe(false);
    expect(result.upgradedStatus).toBe('DRILL_IN_PROGRESS');
  });

  it('integrates full loop in service and updates Skill Passport evidence upon mastery', async () => {
    const studentId = 'student-remedial-loop-test';
    const active = await LearningLoopService.getActiveRemediation(studentId);
    expect(active).toBeDefined();

    // Mark drill complete
    const drillFinished = await LearningLoopService.completeDrill(studentId, active.loopId);
    expect(drillFinished.status).toBe('READY_FOR_REASSESSMENT');

    // Submit correct answers
    const answers = drillFinished.reassessmentQuestions.map(q => ({
      questionId: q.id,
      selectedIndex: q.correctOptionIndex,
    }));

    const finalResult = await LearningLoopService.submitReassessment(studentId, active.loopId, answers);
    expect(finalResult.evaluation.masteryAchieved).toBe(true);
    expect(finalResult.package.status).toBe('MASTERED');
    expect(finalResult.passportUpdated).toBe(true);

    // Verify passport evidence was created
    const passport = await PassportService.getOrCreatePassport(studentId);
    const sqlSkill = passport.skills.find(s => s.skillId === drillFinished.skillId);
    expect(sqlSkill).toBeDefined();
    const remedialProof = sqlSkill?.evidenceItems.find(e => e.title.includes('Diagnostic Loop Mastered'));
    expect(remedialProof).toBeDefined();
  });
});
