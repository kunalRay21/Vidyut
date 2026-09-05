/**
 * Vidyut Digital Twin Service
 * Connects Skill Passport telemetry, explainable readiness attribution, and 12-hour crunch plans.
 */

import { DigitalTwinEngine } from './digital_twin.engine';
import {
  DigitalTwinProfile,
  Opportunity12HourPlan,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
} from './digital_twin.types';
import { PassportService } from '../passport/passport.service';

export class DigitalTwinService {
  /**
   * Retrieves the live Digital Twin profile for a student.
   */
  public static async getStudentDigitalTwin(studentId: string): Promise<DigitalTwinProfile> {
    const passport = await PassportService.getOrCreatePassport(studentId);
    return DigitalTwinEngine.computeDigitalTwin(passport);
  }

  /**
   * Runs what-if counterfactual scenario projection.
   */
  public static async simulateWhatIf(
    studentId: string,
    input: WhatIfScenarioInput
  ): Promise<WhatIfScenarioResult> {
    const currentTwin = await this.getStudentDigitalTwin(studentId);
    return DigitalTwinEngine.simulateWhatIf(currentTwin, input);
  }

  /**
   * Generates a 12-Hour Prep Plan for a target opportunity.
   */
  public static async getPrepPlan(
    studentId: string,
    opportunityId: string
  ): Promise<Opportunity12HourPlan> {
    // Look up opportunity name if available, else default to realistic fintech opening
    return DigitalTwinEngine.generate12HourPrepPlan(
      opportunityId,
      'Backend Systems & Platform Engineer Intern',
      'Razorpay'
    );
  }
}
