/**
 * Vidyut Learning Loop Service
 * Orchestrates diagnostic reviews, micro-drill completions, reassessments, and passport upgrades.
 */

import { DiagnosticEngine, DiagnosticRemediationPackage } from './diagnostic.engine';
import { PassportService } from '../passport/passport.service';

const studentRemediationStore = new Map<string, DiagnosticRemediationPackage>();

export class LearningLoopService {
  /**
   * Retrieves or initializes an active remediation package for a student.
   */
  public static async getActiveRemediation(studentId: string): Promise<DiagnosticRemediationPackage> {
    let pkg = studentRemediationStore.get(studentId);
    if (!pkg) {
      // Create a default active remediation based on a common assessment gap
      pkg = DiagnosticEngine.createRemediationPackage(
        studentId,
        'exam-db-adv',
        'Advanced Backend & SQL Optimization Exam',
        'skill-sql',
        58 // initial score
      );
      studentRemediationStore.set(studentId, pkg);
    }
    return pkg;
  }

  /**
   * Completes the micro-learning drill, unlocking the reassessment stage.
   */
  public static async completeDrill(studentId: string, loopId: string): Promise<DiagnosticRemediationPackage> {
    let pkg = studentRemediationStore.get(studentId);
    if (!pkg || pkg.loopId !== loopId) {
      pkg = await this.getActiveRemediation(studentId);
    }

    pkg.status = 'READY_FOR_REASSESSMENT';
    studentRemediationStore.set(studentId, pkg);
    return pkg;
  }

  /**
   * Submits student's reassessment answers and upgrades passport if mastered.
   */
  public static async submitReassessment(
    studentId: string,
    loopId: string,
    answers: Array<{ questionId: string; selectedIndex: number }>
  ): Promise<{
    package: DiagnosticRemediationPackage;
    evaluation: ReturnType<typeof DiagnosticEngine.evaluateReassessment>;
    passportUpdated: boolean;
  }> {
    let pkg = studentRemediationStore.get(studentId);
    if (!pkg || pkg.loopId !== loopId) {
      pkg = await this.getActiveRemediation(studentId);
    }

    const evaluation = DiagnosticEngine.evaluateReassessment(pkg, answers);

    pkg.reassessmentScore = evaluation.reassessmentScore;
    pkg.masteryAchieved = evaluation.masteryAchieved;
    pkg.status = evaluation.upgradedStatus;
    studentRemediationStore.set(studentId, pkg);

    let passportUpdated = false;
    if (evaluation.masteryAchieved) {
      try {
        // Upgrade Skill Passport with verified reassessment proof
        await PassportService.addEvidence(studentId, pkg.skillId, {
          type: 'DIAGNOSTIC_ASSESSMENT',
          title: `Diagnostic Loop Mastered: ${pkg.sourceExamTitle}`,
          sourceUrl: `/remediation/verify/${pkg.loopId}`,
          verifiedBy: 'Vidyut Diagnostic Precision Engine',
          score: evaluation.reassessmentScore,
        });
        passportUpdated = true;
      } catch (err) {
        console.warn('[LearningLoopService] Could not auto-upgrade passport:', err);
      }
    }

    return {
      package: pkg,
      evaluation,
      passportUpdated,
    };
  }

  /**
   * Reset / trigger a new remedial loop for testing.
   */
  public static triggerNewLoop(
    studentId: string,
    skillId = 'skill-sql',
    initialScore = 55
  ): DiagnosticRemediationPackage {
    const pkg = DiagnosticEngine.createRemediationPackage(
      studentId,
      'exam-custom',
      'Diagnostic Competency Evaluation',
      skillId,
      initialScore
    );
    studentRemediationStore.set(studentId, pkg);
    return pkg;
  }
}
