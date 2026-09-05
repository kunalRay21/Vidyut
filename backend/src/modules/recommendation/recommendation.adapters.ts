import { PrismaClient } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { memoryStore } from '../../database/store';
import { RESOURCES_SEED } from './seedResources';
import { BACKEND_DOMAIN_TAXONOMY } from '../resume/resumeService';
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
 * Adapter for ProfileService to fetch student data via Prisma with offline fallback.
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
      const mem = memoryStore.profiles.get(studentId) || Array.from(memoryStore.profiles.values()).find(p => p.id === studentId || p.user_id === studentId);
      if (mem) {
        return {
          id: mem.id,
          yearOfStudy: mem.year_of_study || 3,
          interests: mem.interests || [],
          selectedDomainId: mem.selected_role_id || 'role-backend',
          selectedDomainName: mem.resume_matched_role || 'Backend Development',
        };
      }
      return {
        id: studentId,
        yearOfStudy: 3,
        interests: ['Backend', 'AI/ML'],
        selectedDomainId: 'role-backend',
        selectedDomainName: 'Backend Development',
      };
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
 * Adapter for ResourceRepository with fallback to RESOURCES_SEED.
 */
export class PrismaResourceRepository implements ResourceRepository {
  async findResourcesBySkillId(skillId: string): Promise<ResourceItem[]> {
    try {
      const resources = await prisma.resource.findMany({
        where: { skillId }
      });

      if (resources && resources.length > 0) {
        return resources.map(res => ({
          id: res.id,
          title: res.title,
          url: res.url,
          type: res.type,
          isFree: res.isFree,
          provider: res.provider
        }));
      }
    } catch {
      // Offline fallback
    }

    // Fallback: match against curated RESOURCES_SEED
    const cleanId = (skillId || '').toLowerCase().replace(/^skill-/, '').replace(/-/g, ' ');
    const matched = RESOURCES_SEED.filter(r => {
      const sName = r.skillName.toLowerCase();
      return sName.includes(cleanId) || cleanId.includes(sName);
    });

    const list = matched.length > 0 ? matched : RESOURCES_SEED.slice(0, 3);
    return list.map((res, idx) => ({
      id: `seed-res-${idx}-${cleanId}`,
      title: res.title,
      url: res.url,
      type: res.type,
      isFree: res.isFree,
      provider: res.provider
    }));
  }
}

/**
 * Adapter for RoadmapRepository with offline fallback to memoryStore & domain taxonomy.
 */
export class PrismaRoadmapRepository implements RoadmapRepository {
  async getStudentRoadmap(studentId: string): Promise<RoadmapSkillState[]> {
    const isUuid = studentId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);

    if (isUuid) {
      try {
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

        if (milestones && milestones.length > 0) {
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
      } catch {
        // Fall through to memoryStore fallback
      }
    }

    // Fallback: resolve student profile from memoryStore or return default roadmap
    let profile = memoryStore.profiles.get(studentId);
    if (!profile) {
      for (const p of memoryStore.profiles.values()) {
        if (p.id === studentId || p.user_id === studentId) {
          profile = p;
          break;
        }
      }
    }

    const matchedRole = profile?.resume_matched_role || profile?.selected_role_id || 'role-backend';
    const domainTax = BACKEND_DOMAIN_TAXONOMY[matchedRole] || BACKEND_DOMAIN_TAXONOMY['role-backend'];
    const skills = [...domainTax.coreSkills.slice(0, 6)];

    return skills.map((sk, idx) => ({
      skillId: `skill-${sk.replace(/[^a-zA-Z0-9]/g, '-')}`,
      skillName: sk.charAt(0).toUpperCase() + sk.slice(1),
      status: idx < 2 ? 'IN_PROGRESS' : 'NOT_STARTED',
      sequence: idx + 1,
      currentProficiency: idx === 0 ? 'AWARENESS' : null,
      targetProficiency: 'PROFICIENT'
    }));
  }
}
