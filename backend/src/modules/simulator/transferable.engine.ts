/**
 * Vidyut Transferable Skill & Career Simulation Engine
 * Computes cross-career semantic skill transferability, gap complexity, and learning time projections.
 */

import { FALLBACK_GRAPHS } from '../skill_graph/router';

export interface TransferableSkillMatch {
  sourceSkillId: string;
  sourceSkillName: string;
  targetSkillId: string;
  targetSkillName: string;
  transferRatio: number; // 0.0 to 1.0 (e.g. 0.85 means 85% transferable)
  rationale: string;
}

export interface CareerGapSkill {
  skillId: string;
  skillName: string;
  category: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  prerequisites: string[];
}

export interface CareerSimulationResult {
  sourceRoleId: string;
  sourceRoleName: string;
  targetRoleId: string;
  targetRoleName: string;
  targetRoleDescription: string;
  currentReadinessPct: number;
  projectedReadinessPct: number;
  transferabilityIndex: number; // e.g. 62%
  transferableSkills: TransferableSkillMatch[];
  gapSkills: CareerGapSkill[];
  totalAdditionalSkills: number;
  totalEstimatedHours: number;
  estimatedWeeksAt10HoursPerWeek: number;
  unlockedOpportunitiesEstimate: {
    count: number;
    sampleRoles: string[];
    averageStipend: string;
  };
  executiveSummary: string;
}

// Cross-domain semantic transferability affinity matrix
const SEMANTIC_TRANSFER_RULES: Array<{
  sourcePattern: string;
  targetPattern: string;
  ratio: number;
  rationale: string;
}> = [
  // Direct identity matches
  { sourcePattern: 'python', targetPattern: 'python', ratio: 1.0, rationale: 'Exact language runtime and syntax alignment.' },
  { sourcePattern: 'git', targetPattern: 'git', ratio: 1.0, rationale: 'Standard collaborative distributed version control.' },
  { sourcePattern: 'docker', targetPattern: 'docker', ratio: 1.0, rationale: 'Identical containerization architecture.' },
  // Cross-role transferability
  { sourcePattern: 'sql', targetPattern: 'adv-sql', ratio: 0.85, rationale: 'Relational query basics accelerate advanced window functions and query optimization.' },
  { sourcePattern: 'sql', targetPattern: 'sql', ratio: 0.9, rationale: 'Relational data query syntax transfers directly.' },
  { sourcePattern: 'sql', targetPattern: 'etl', ratio: 0.70, rationale: 'Schema transformation principles map directly to ETL data stages.' },
  { sourcePattern: 'python', targetPattern: 'numpy', ratio: 0.75, rationale: 'Vectorized computing builds directly on core Python data structures.' },
  { sourcePattern: 'python', targetPattern: 'pandas', ratio: 0.70, rationale: 'Data manipulation syntax is native to Python scripting.' },
  { sourcePattern: 'python', targetPattern: 'prob-stats', ratio: 0.50, rationale: 'Python numeric algorithms facilitate statistical modeling.' },
  { sourcePattern: 'auth', targetPattern: 'iam', ratio: 0.80, rationale: 'JWT and OAuth session mechanisms transfer to enterprise IAM policies.' },
  { sourcePattern: 'rest', targetPattern: 'node-api', ratio: 0.85, rationale: 'HTTP protocol and API route design principles are identical.' },
  { sourcePattern: 'docker', targetPattern: 'k8s', ratio: 0.75, rationale: 'Pod definitions and container runtimes build on Docker images.' },
  { sourcePattern: 'python', targetPattern: 'spark', ratio: 0.80, rationale: 'PySpark API leverages standard Python syntax for distributed data transformations.' },
  { sourcePattern: 'http', targetPattern: 'sec-net', ratio: 0.65, rationale: 'Web transport knowledge transfers to packet and network inspection.' },
  { sourcePattern: 'db-design', targetPattern: 'adv-sql', ratio: 0.80, rationale: 'Index design and normalization directly improve complex queries.' },
  { sourcePattern: 'prog-fund', targetPattern: 'ts', ratio: 0.70, rationale: 'Core control flow and functions transfer to typed JavaScript.' },
  { sourcePattern: 'react', targetPattern: 'nextjs', ratio: 0.85, rationale: 'Component JSX, hooks, and props transfer 100% to Next.js server components.' },
  { sourcePattern: 'rest', targetPattern: 'owasp', ratio: 0.65, rationale: 'Endpoint parameter design transfers to input validation hardening.' },
];

export class TransferableEngine {
  /**
   * Simulates switching from a student's current skill profile to any target role.
   */
  public static simulateRoleTransition(
    currentSkillIds: string[],
    targetRoleId: string,
    sourceRoleId = 'role-backend'
  ): CareerSimulationResult {
    const targetGraph = FALLBACK_GRAPHS[targetRoleId] || FALLBACK_GRAPHS['role-data'];
    const sourceGraph = FALLBACK_GRAPHS[sourceRoleId] || FALLBACK_GRAPHS['role-backend'];

    const targetSkills: any[] = targetGraph.skills || [];
    const targetPrereqs: any[] = targetGraph.prerequisites || [];

    const transferableMatches: TransferableSkillMatch[] = [];
    const matchedTargetSkillIds = new Set<string>();

    // 1. Identify direct matches and semantic transfers
    for (const curSkillId of currentSkillIds) {
      const cleanCur = curSkillId.toLowerCase().replace(/^skill-/, '');

      for (const tSkill of targetSkills) {
        const cleanTarget = tSkill.id.toLowerCase().replace(/^skill-/, '');

        if (cleanCur === cleanTarget) {
          transferableMatches.push({
            sourceSkillId: curSkillId,
            sourceSkillName: this.formatSkillName(curSkillId),
            targetSkillId: tSkill.id,
            targetSkillName: tSkill.name,
            transferRatio: 1.0,
            rationale: 'Direct 100% foundational skill match.',
          });
          matchedTargetSkillIds.add(tSkill.id);
          break;
        }

        // Check semantic rule
        const rule = SEMANTIC_TRANSFER_RULES.find(
          r => (cleanCur.includes(r.sourcePattern) || r.sourcePattern.includes(cleanCur)) &&
               (cleanTarget.includes(r.targetPattern) || r.targetPattern.includes(cleanTarget))
        );

        if (rule && !matchedTargetSkillIds.has(tSkill.id)) {
          transferableMatches.push({
            sourceSkillId: curSkillId,
            sourceSkillName: this.formatSkillName(curSkillId),
            targetSkillId: tSkill.id,
            targetSkillName: tSkill.name,
            transferRatio: rule.ratio,
            rationale: rule.rationale,
          });
          matchedTargetSkillIds.add(tSkill.id);
        }
      }
    }

    // 2. Identify remaining gap skills
    const gapSkills: CareerGapSkill[] = [];
    for (const tSkill of targetSkills) {
      if (!matchedTargetSkillIds.has(tSkill.id)) {
        const prereqs = targetPrereqs
          .filter(p => p.skill_id === tSkill.id)
          .map(p => p.prerequisite_name || p.prerequisite_skill_id);

        const difficulty = tSkill.category === 'BIG_DATA' || tSkill.category === 'ORCHESTRATION' || tSkill.category === 'MACHINE_LEARNING'
          ? 'ADVANCED'
          : tSkill.category === 'TOOLS' || tSkill.category === 'WEB'
          ? 'BEGINNER'
          : 'INTERMEDIATE';

        const estimatedHours = difficulty === 'ADVANCED' ? 14 : difficulty === 'INTERMEDIATE' ? 9 : 6;

        gapSkills.push({
          skillId: tSkill.id,
          skillName: tSkill.name,
          category: tSkill.category || 'SPECIALIZATION',
          description: tSkill.description || 'Target competency required for role readiness.',
          difficulty,
          estimatedHours,
          prerequisites: prereqs,
        });
      }
    }

    // 3. Compute Transferability Index & Hours
    const totalTargetSkills = Math.max(1, targetSkills.length);
    const transferredCreditSum = transferableMatches.reduce((acc, m) => acc + m.transferRatio, 0);
    const transferabilityIndex = Math.min(95, Math.round((transferredCreditSum / totalTargetSkills) * 100));

    const totalEstimatedHours = gapSkills.reduce((acc, g) => acc + g.estimatedHours, 0);
    const estimatedWeeks = Math.max(1, Math.round((totalEstimatedHours / 10) * 10) / 10);

    const currentReadinessPct = Math.max(15, Math.round(transferabilityIndex * 0.9));
    const projectedReadinessPct = Math.min(96, currentReadinessPct + Math.round((gapSkills.length > 0 ? 32 : 10)));

    // 4. Sample market unlocked opportunities
    const opportunityProfiles: Record<string, { count: number; sample: string[]; stipend: string }> = {
      'role-data': { count: 24, sample: ['Big Data Intern @ Swiggy', 'Data Platform Trainee @ CRED', 'Analytics Engineer @ Razorpay'], stipend: '₹42,000 / month' },
      'role-ml': { count: 19, sample: ['ML Engineer Intern @ Fractal', 'AI Research Trainee @ InMobi', 'Computer Vision Intern @ Zenoti'], stipend: '₹48,000 / month' },
      'role-cloud': { count: 22, sample: ['DevOps & SRE Intern @ Razorpay', 'Cloud Infrastructure Trainee @ BrowserStack'], stipend: '₹45,000 / month' },
      'role-fullstack': { count: 31, sample: ['Full-Stack Intern @ Zepto', 'Frontend Engineer Trainee @ Postman'], stipend: '₹40,000 / month' },
      'role-security': { count: 14, sample: ['SecOps Trainee @ PayU', 'Application Security Intern @ QuickHeal'], stipend: '₹50,000 / month' },
      'role-backend': { count: 28, sample: ['Backend Systems Intern @ CRED', 'Platform Engineer @ PhonePe'], stipend: '₹46,000 / month' },
    };

    const oppStats = opportunityProfiles[targetRoleId] || {
      count: 18,
      sample: [`${targetGraph.role?.name || 'Technical'} Trainee @ Tech Partner`],
      stipend: '₹40,000 / month',
    };

    const executiveSummary = gapSkills.length === 0
      ? `You already possess complete foundational alignment (${transferabilityIndex}%) for ${targetGraph.role?.name}. You are immediate-application ready!`
      : `Switching from ${sourceGraph.role?.name} to ${targetGraph.role?.name} requires ${gapSkills.length} additional skills and approximately ${totalEstimatedHours} learning hours (~${estimatedWeeks} weeks at 10h/week). You already possess ${transferabilityIndex}% of the foundational skill requirements.`;

    return {
      sourceRoleId,
      sourceRoleName: sourceGraph.role?.name || 'Backend Developer',
      targetRoleId,
      targetRoleName: targetGraph.role?.name || 'Data Engineer',
      targetRoleDescription: targetGraph.role?.description || '',
      currentReadinessPct,
      projectedReadinessPct,
      transferabilityIndex,
      transferableSkills: transferableMatches,
      gapSkills,
      totalAdditionalSkills: gapSkills.length,
      totalEstimatedHours,
      estimatedWeeksAt10HoursPerWeek: estimatedWeeks,
      unlockedOpportunitiesEstimate: {
        count: oppStats.count,
        sampleRoles: oppStats.sample,
        averageStipend: oppStats.stipend,
      },
      executiveSummary,
    };
  }

  private static formatSkillName(id: string): string {
    const raw = id.replace(/^skill-/, '').replace(/-/g, ' ');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
}
