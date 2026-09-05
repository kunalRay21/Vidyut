import { PrismaClient } from '@prisma/client';
import { prisma } from '../../database/prisma';
import type { 
  ProfileService, 
  OpportunityRepository, 
  StudentProfile, 
  ScoringOpportunity,
  RecommendationPersistenceClient
} from './recommendation.service';
import type { 
  StudentSkillState,
  ProficiencyLevel,
  RecommendationSegment,
  MatchExplanation,
  RoadmapSkillState,
  ResourceItem,
  RoadmapSkillStatus
} from './recommendation.types';
import type { ResourceRepository, RoadmapRepository } from './resource-recommendation.service';

/**
 * Adapter for ProfileService to fetch student data via Prisma.
 *
 * Supports two kinds of studentId:
 *   - student_profiles.id  (UUID from registration response / x-student-id header)
 *   - users.id             (JWT sub claim / user.id stored in localStorage)
 * The second lookup is needed because the frontend may send either value.
 */
export class PrismaProfileService implements ProfileService {
  async getProfile(studentId: string): Promise<StudentProfile> {
    // 1. Try exact match by student_profiles.id
    let profile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        selectedRole: {
          include: { domain: true }
        }
      }
    }).catch(() => null);

    // 2. Fall back: look up by users.id (userId FK)
    if (!profile) {
      profile = await prisma.studentProfile.findFirst({
        where: { userId: studentId },
        include: {
          selectedRole: {
            include: { domain: true }
          }
        }
      }).catch(() => null);
    }

    if (!profile) {
      throw new Error(`Student profile not found for id: ${studentId}`);
    }

    const academicBranchId = (profile as any).academicBranchId ?? null;
    const academicBranchRelevanceMap: Record<string, string> = {};

    if (academicBranchId) {
      const branchDomains = await (prisma as any).academicBranchDomain.findMany({
        where: { academicBranchId }
      }).catch(() => []);
      for (const bd of branchDomains) {
        academicBranchRelevanceMap[bd.domainId] = bd.relevance;
      }
    }

    return {
      id: profile.id,
      yearOfStudy: profile.yearOfStudy,
      interests: profile.interests,
      selectedDomainId: profile.selectedRole?.domainId ?? null,
      selectedDomainName: profile.selectedRole?.domain?.name ?? null,
      academicBranchId,
      academicBranchRelevanceMap,
    };
  }

  async getSkillStates(studentId: string): Promise<StudentSkillState[]> {
    // Try by studentId directly (student_profiles.id)
    let states = await prisma.studentSkillState.findMany({
      where: { studentId }
    }).catch(() => [] as any[]);

    // If empty, studentId may be a users.id — resolve the profile first
    if (states.length === 0) {
      const prof = await prisma.studentProfile.findFirst({
        where: { userId: studentId }
      }).catch(() => null);
      if (prof) {
        states = await prisma.studentSkillState.findMany({
          where: { studentId: prof.id }
        }).catch(() => []);
      }
    }

    return states.map((state: any) => ({
      skillId: state.skillId,
      assessedLevel: (state.assessedLevel as ProficiencyLevel) ?? null
    }));
  }
}

/**
 * Adapter for OpportunityRepository to fetch active opportunities.
 */
export class PrismaOpportunityRepository implements OpportunityRepository {
  async findAllActive(): Promise<ScoringOpportunity[]> {
    const opportunities = await prisma.opportunity.findMany({
      where: { isActive: true },
      include: {
        domain: true,
        skillTags: {
          include: { skill: true }
        }
      }
    });

    return opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      organization: opp.organization,
      type: opp.type,
      mode: opp.mode,
      originalUrl: opp.originalUrl ?? '',
      deadline: opp.deadline,
      stipend: opp.stipend,
      source: opp.source,
      location: opp.location,
      domainId: opp.domainId,
      domain: opp.domain ? { name: opp.domain.name } : null,
      eligibilityRaw: opp.eligibilityRaw,
      skillTags: opp.skillTags.map(tag => ({
        skillId: tag.skillId,
        skill: { name: tag.skill.name },
        confidence: tag.weight ?? 1.0,
        requiredLevel: (tag.minProficiency as ProficiencyLevel) ?? 'INTERMEDIATE'
      }))
    }));
  }
}

/**
 * Adapter for RecommendationPersistenceClient.
 * Wraps the Prisma client's recommendation model to match the interface.
 */
export class PrismaRecommendationPersistenceClient implements RecommendationPersistenceClient {
  public recommendation = {
    async upsert(args: any): Promise<{ id: string }> {
      return prisma.recommendation.upsert(args);
    },
    async findMany(args: any): Promise<any[]> {
      return prisma.recommendation.findMany(args);
    },
    async groupBy(args: any): Promise<any[]> {
      return prisma.recommendation.groupBy(args);
    }
  };
}

/**
 * Adapter for ResourceRepository.
 */
export class PrismaResourceRepository implements ResourceRepository {
  async findResourcesBySkillId(skillId: string): Promise<ResourceItem[]> {
    const resources = await prisma.resource.findMany({
      where: { skillId }
    });

    return resources.map(res => ({
      id: res.id,
      title: res.title,
      url: res.url,
      type: res.type,
      isFree: res.isFree,
      provider: res.provider
    }));
  }
}

/**
 * Adapter for RoadmapRepository.
 * Three-tier fallback: milestones → role skills → skill states.
 */
export class PrismaRoadmapRepository implements RoadmapRepository {
  async getStudentRoadmap(studentId: string): Promise<RoadmapSkillState[]> {
    const milestones = await prisma.milestone.findMany({
      where: {
        roadmap: { studentId },
        skillId: { not: null }
      },
      include: {
        skill: {
          include: {
            skillStates: {
              where: { studentId }
            }
          }
        }
      },
      orderBy: {
        milestoneOrder: 'asc'
      }
    });

    if (milestones.length === 0) {
      // Fallback 1: selectedRole's skills
      const profile = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          selectedRole: {
            include: {
              skills: {
                include: {
                  skillStates: {
                    where: { studentId }
                  }
                }
              }
            }
          }
        }
      });

      const roleSkills = profile?.selectedRole?.skills;
      if (roleSkills && roleSkills.length > 0) {
        return roleSkills.map((skill, idx) => {
          const skillState = skill.skillStates[0];
          const currentProficiency = (skillState?.assessedLevel as ProficiencyLevel) ?? null;
          const targetProficiency = (skillState?.targetLevel as ProficiencyLevel) ?? 'PROFICIENT';
          let status: RoadmapSkillStatus = 'NOT_STARTED';
          if (currentProficiency === 'PROFICIENT' || currentProficiency === 'EXPERT') {
            status = 'COMPLETED';
          } else if (currentProficiency) {
            status = 'IN_PROGRESS';
          }

          return {
            skillId: skill.id,
            skillName: skill.name,
            status,
            sequence: idx + 1,
            currentProficiency,
            targetProficiency
          };
        });
      }

      // Fallback 2: student's existing skillStates
      const states = await prisma.studentSkillState.findMany({
        where: { studentId },
        include: { skill: true }
      });

      if (states.length > 0) {
        return states.map((s, idx) => {
          const currentProficiency = (s.assessedLevel as ProficiencyLevel) ?? null;
          const targetProficiency = (s.targetLevel as ProficiencyLevel) ?? 'PROFICIENT';
          let status: RoadmapSkillStatus = 'NOT_STARTED';
          if (currentProficiency === 'PROFICIENT' || currentProficiency === 'EXPERT') {
            status = 'COMPLETED';
          } else if (currentProficiency) {
            status = 'IN_PROGRESS';
          }

          return {
            skillId: s.skillId,
            skillName: s.skill.name,
            status,
            sequence: idx + 1,
            currentProficiency,
            targetProficiency
          };
        });
      }
    }

    return milestones.map(milestone => {
      let status: RoadmapSkillStatus = 'NOT_STARTED';
      if (milestone.status === 'IN_PROGRESS') status = 'IN_PROGRESS';
      if (milestone.status === 'COMPLETED') status = 'COMPLETED';

      const skillState = milestone.skill?.skillStates[0];
      const currentProficiency = (skillState?.assessedLevel as ProficiencyLevel) ?? null;
      const targetProficiency = (skillState?.targetLevel as ProficiencyLevel) ?? 'PROFICIENT';

      return {
        skillId: milestone.skillId!,
        skillName: milestone.skill?.name ?? 'Unknown Skill',
        status,
        sequence: milestone.milestoneOrder,
        currentProficiency,
        targetProficiency
      };
    });
  }
}
