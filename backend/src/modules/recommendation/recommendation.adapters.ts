import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { query } from '../../database/db';
import { memoryStore } from '../../database/store';
import { FALLBACK_GRAPHS } from '../skill_graph/router';
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
      const mem = memoryStore.profiles.get(studentId) || 
        Array.from(memoryStore.profiles.values()).find(p => p.id === studentId || p.user_id === studentId);
      if (mem) {
        return {
          id: mem.id,
          yearOfStudy: mem.year_of_study || 3,
          interests: mem.interests || ['Full-Stack Development', 'AI/ML'],
          selectedDomainId: mem.selected_role_id || 'role-backend',
          selectedDomainName: mem.resume_matched_role || 'Backend Development',
        };
      }
      return {
        id: studentId,
        yearOfStudy: 3,
        interests: ['Full-Stack Development', 'AI/ML'],
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

    if (states.length > 0) {
      return states.map(state => ({
        skillId: state.skillId,
        assessedLevel: (state.assessedLevel as ProficiencyLevel) ?? null
      }));
    }

    const inMemStates = Array.from(memoryStore.skill_states.values()).filter(
      s => s.student_id === studentId
    );
    if (inMemStates.length > 0) {
      return inMemStates.map(state => ({
        skillId: state.skill_id,
        assessedLevel: (state.assessed_level as ProficiencyLevel) ?? null
      }));
    }

    // Check memoryStore or PostgreSQL for RESUME-EXTRACTED SKILLS (Only if resume provided!)
    let profile = memoryStore.profiles.get(studentId) || Array.from(memoryStore.profiles.values()).find(p => p.id === studentId || p.user_id === studentId);
    if (!profile) {
      try {
        const dbProf = await query<any>(
          `SELECT parsed_skills, resume_parsed_data, resume_matched_role FROM student_profiles WHERE id::text = $1 OR user_id::text = $1 LIMIT 1`,
          [studentId]
        );
        if (dbProf.rows.length > 0) profile = dbProf.rows[0];
      } catch {
        // ignore
      }
    }

    if (profile) {
      const skillsList: string[] = profile.parsed_skills || profile.resume_parsed_data?.extractedSkills || [];
      if (skillsList.length > 0) {
        const skillStates: StudentSkillState[] = [];
        for (const sk of skillsList) {
          const cleanSk = (sk || '').toLowerCase().trim();
          if (!cleanSk) continue;
          skillStates.push({ skillId: sk, assessedLevel: 'PROFICIENT' });
          skillStates.push({ skillId: cleanSk, assessedLevel: 'PROFICIENT' });
          skillStates.push({ skillId: `skill-${cleanSk.replace(/[^a-z0-9]/g, '-')}`, assessedLevel: 'PROFICIENT' });
        }
        return skillStates;
      }
    }

    return [];
  }
}

/**
 * Adapter for OpportunityRepository to fetch active opportunities.
 */
export class PrismaOpportunityRepository implements OpportunityRepository {
  async findAllActive(): Promise<ScoringOpportunity[]> {
    try {
      const opportunities = await prisma.opportunity.findMany({
        where: { isActive: true },
        include: {
          domain: true,
          skillTags: {
            include: { skill: true }
          }
        }
      });

      if (opportunities && opportunities.length > 0) {
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
    } catch {
      // Prisma offline or schema missing
    }

    // Fallback: read opportunities from backend/data/seed_opportunities.json
    try {
      const seedPath = path.resolve(__dirname, '../../../data/seed_opportunities.json');
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf8');
        const items = JSON.parse(raw);
        return items.map((item: any, index: number) => ({
          id: item.id || item.external_id || `seed-opp-${index + 1}`,
          title: item.title,
          organization: item.organization,
          type: item.type || 'INTERNSHIP',
          mode: item.mode || 'REMOTE',
          originalUrl: item.original_url || 'https://internshala.com',
          deadline: item.deadline || '2026-10-31',
          stipend: item.stipend || 'Competitive Stipend',
          source: (item.source || 'DIRECT').toUpperCase(),
          location: item.location || 'Pan-India',
          domainId: item.domain_id || 'domain-backend',
          domain: item.domain_id ? { name: item.domain_id } : { name: 'Software Engineering' },
          eligibilityRaw: item.description_raw || null,
          skillTags: (item.required_skills || []).map((s: any) => ({
            skillId: s.skill_id || `skill-${(s.raw_mention || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            skill: { name: s.raw_mention || s.skill_id },
            confidence: 1.0,
            requiredLevel: (s.min_proficiency as ProficiencyLevel) ?? 'INTERMEDIATE'
          }))
        }));
      }
    } catch (e) {
      console.warn('Seed opportunities read warning:', e);
    }

    return [];
  }
}

/**
 * Adapter for RecommendationPersistenceClient.
 * Safeguarded for offline mode and non-UUID student IDs.
 */
export class PrismaRecommendationPersistenceClient implements RecommendationPersistenceClient {
  public recommendation = {
    async upsert(args: any): Promise<{ id: string }> {
      try {
        const studentId = args.where?.studentId_opportunityId?.studentId;
        if (studentId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
          return { id: `rec-${Date.now()}` };
        }
        return await prisma.recommendation.upsert(args);
      } catch {
        return { id: `rec-${Date.now()}` };
      }
    },
    async findMany(args: any): Promise<any[]> {
      try {
        const studentId = args.where?.studentId;
        if (studentId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
          return [];
        }
        return await prisma.recommendation.findMany(args);
      } catch {
        return [];
      }
    },
    async groupBy(args: any): Promise<any[]> {
      try {
        return await prisma.recommendation.groupBy(args);
      } catch {
        return [];
      }
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
      // Prisma offline or schema error
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
      Array.from(memoryStore.profiles.values()).find(p => p.id === studentId || p.user_id === studentId);
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

    // Fallback 4: domain taxonomy
    const matchedRole = memProf?.resume_matched_role || memProf?.selected_role_id || 'role-backend';
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
