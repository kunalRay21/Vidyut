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
 */
export class PrismaProfileService implements ProfileService {
  async getProfile(studentId: string): Promise<StudentProfile> {
    let profile = null;
    try {
      profile = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          selectedRole: {
            include: { domain: true }
          }
        }
      });
    } catch {
      // ignore if studentId is not a valid uuid format for unique lookup
    }

    if (!profile) {
      try {
        profile = await prisma.studentProfile.findFirst({
          where: { userId: studentId },
          include: {
            selectedRole: {
              include: { domain: true }
            }
          }
        });
      } catch {
        // ignore
      }
    }

    if (!profile) {
      throw new Error(`Student profile not found: ${studentId}`);
    }

    return {
      id: profile.id,
      yearOfStudy: profile.yearOfStudy,
      interests: profile.interests,
      selectedDomainId: profile.selectedRole?.domainId ?? null,
      selectedDomainName: profile.selectedRole?.domain?.name ?? null,
    };
  }

  async getSkillStates(studentId: string): Promise<StudentSkillState[]> {
    let states: any[] = [];
    try {
      states = await prisma.studentSkillState.findMany({
        where: { studentId }
      });
      if (states.length === 0) {
        const prof = await prisma.studentProfile.findFirst({
          where: { userId: studentId }
        });
        if (prof) {
          states = await prisma.studentSkillState.findMany({
            where: { studentId: prof.id }
          });
        }
      }
    } catch {
      // ignore
    }

    return states.map(state => ({
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
 * We can simply expose a wrapper around the Prisma client's recommendation model
 * that matches the interface structurally.
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
      // Map existing milestone statuses to the expected RoadmapSkillStatus
      let status: RoadmapSkillStatus = 'NOT_STARTED';
      if (milestone.status === 'IN_PROGRESS') status = 'IN_PROGRESS';
      if (milestone.status === 'COMPLETED') status = 'COMPLETED';
      // 'LOCKED' or any other state maps to 'NOT_STARTED'

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
