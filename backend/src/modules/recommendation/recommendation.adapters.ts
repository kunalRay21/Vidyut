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
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        selectedRole: {
          include: { domain: true }
        }
      }
    });

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
    const states = await prisma.studentSkillState.findMany({
      where: { studentId }
    });

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
