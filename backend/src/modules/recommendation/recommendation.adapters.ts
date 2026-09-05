import { PrismaClient } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { memoryStore } from '../../database/store';
import { FALLBACK_GRAPHS } from '../skill_graph/router';
import { RESOURCES_SEED } from './seedResources';
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
      const memProf = memoryStore.profiles.get(studentId) ||
        Array.from(memoryStore.profiles.values()).find(p => p.user_id === studentId);
      if (memProf) {
        return {
          id: memProf.id,
          yearOfStudy: memProf.year_of_study || 3,
          interests: memProf.interests || ['Full-Stack Development', 'AI/ML'],
          selectedDomainId: 'domain-backend',
          selectedDomainName: 'Software Engineering',
        };
      }
      if (studentId === 'student-demo' || studentId.startsWith('guest-')) {
        return {
          id: studentId,
          yearOfStudy: 3,
          interests: ['Full-Stack Development', 'AI/ML'],
          selectedDomainId: 'domain-backend',
          selectedDomainName: 'Software Engineering',
        };
      }
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

    if (states.length === 0) {
      const inMemStates = Array.from(memoryStore.skill_states.values()).filter(
        s => s.student_id === studentId
      );
      if (inMemStates.length > 0) {
        return inMemStates.map(state => ({
          skillId: state.skill_id,
          assessedLevel: (state.assessed_level as ProficiencyLevel) ?? null
        }));
      }
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
      // Prisma offline or schema error
    }

    // In-memory seed resources fallback
    const slug = skillId.toLowerCase().replace('skill-', '');
    const matched = RESOURCES_SEED.filter((r: any) =>
      r.skillName.toLowerCase().includes(slug) ||
      slug.includes(r.skillName.toLowerCase().split(' ')[0])
    );

    return matched.map((res: any, idx: number) => ({
      id: `seed-res-${skillId}-${idx + 1}`,
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
    let milestones: any[] = [];
    try {
      milestones = await prisma.milestone.findMany({
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
    } catch {
      milestones = [];
    }

    if (milestones.length === 0) {
      // Fallback 1: selectedRole's skills
      let profile = null;
      try {
        profile = await prisma.studentProfile.findUnique({
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
        if (!profile) {
          profile = await prisma.studentProfile.findFirst({
            where: { userId: studentId },
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
        }
      } catch {
        // ignore
      }

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
      let states: any[] = [];
      try {
        states = await prisma.studentSkillState.findMany({
          where: { studentId },
          include: { skill: true }
        });
      } catch {
        states = [];
      }

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

      // Fallback 3: in-memory store and FALLBACK_GRAPHS
      const memProf = memoryStore.profiles.get(studentId) ||
        Array.from(memoryStore.profiles.values()).find(p => p.user_id === studentId);
      const roleId = memProf?.selected_role_id || 'role-backend';
      const roleGraph = FALLBACK_GRAPHS[roleId] || FALLBACK_GRAPHS['role-backend'];
      const rawSkills = roleGraph?.skills || [];
      if (rawSkills.length > 0) {
        return rawSkills.map((skill: any, idx: number) => {
          const mem = memoryStore.skill_states.get(`${studentId}:${skill.id}`);
          const currentProficiency = (mem?.assessed_level as ProficiencyLevel) ?? null;
          const targetProficiency = (mem?.target_level as ProficiencyLevel) ?? 'PROFICIENT';
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
