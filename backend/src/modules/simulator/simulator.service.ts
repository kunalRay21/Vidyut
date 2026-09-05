/**
 * Vidyut Career Simulator Service
 * Coordinates transition simulations and target role adoptions.
 */

import { memoryStore } from '../../database/store';
import { prisma } from '../../database/prisma';
import { FALLBACK_GRAPHS } from '../skill_graph/router';
import { TransferableEngine, CareerSimulationResult } from './transferable.engine';
import { PassportService } from '../passport/passport.service';

export interface SimulatableRoleSummary {
  id: string;
  title: string;
  name?: string;
  description: string;
  coreSkillCount: number;
  skillCount?: number;
  marketDemandRating: 'VERY_HIGH' | 'HIGH' | 'STABLE';
}

export class SimulatorService {
  /**
   * Returns all roles that students can simulate transitions into.
   */
  public static getSimulatableRoles(): SimulatableRoleSummary[] {
    return Object.keys(FALLBACK_GRAPHS).map((roleId) => {
      const graph = FALLBACK_GRAPHS[roleId];
      const demandMap: Record<string, 'VERY_HIGH' | 'HIGH' | 'STABLE'> = {
        'role-backend': 'VERY_HIGH',
        'role-ml': 'VERY_HIGH',
        'role-cloud': 'VERY_HIGH',
        'role-data': 'HIGH',
        'role-fullstack': 'HIGH',
        'role-security': 'HIGH',
      };

      return {
        id: roleId,
        title: graph.role?.name || roleId,
        name: graph.role?.name || roleId,
        description: graph.role?.description || 'Calibrated industry competency DAG.',
        coreSkillCount: (graph.skills || []).length,
        skillCount: (graph.skills || []).length,
        marketDemandRating: demandMap[roleId] || 'HIGH',
      };
    });
  }

  /**
   * Simulates what happens if a candidate targets a new career role.
   */
  public static async simulateRoleChange(
    studentId: string,
    targetRoleId: string
  ): Promise<CareerSimulationResult> {
    // 1. Resolve student's current skills from Skill Passport
    const passport = await PassportService.getOrCreatePassport(studentId);
    const currentSkillIds = passport.skills.map(s => s.skillId);

    // Fallback: add memoryStore skills if any
    const inMemStates = Array.from(memoryStore.skill_states.values()).filter(
      s => s.student_id === studentId
    );
    for (const s of inMemStates) {
      if (!currentSkillIds.includes(s.skill_id)) {
        currentSkillIds.push(s.skill_id);
      }
    }

    // Default core skills if profile is brand new
    if (currentSkillIds.length === 0) {
      currentSkillIds.push('skill-python', 'skill-sql', 'skill-git', 'skill-rest', 'skill-docker');
    }

    // 2. Resolve current role
    let currentRoleId = 'role-backend';
    try {
      const profile = await prisma.studentProfile.findFirst({
        where: { OR: [{ id: studentId }, { userId: studentId }] },
      });
      if (profile?.selectedRoleId) currentRoleId = profile.selectedRoleId;
    } catch {
      const mem = memoryStore.profiles.get(studentId);
      if (mem?.selected_role_id) currentRoleId = mem.selected_role_id;
    }

    // 3. Execute Transferability & Gap Simulation
    return TransferableEngine.simulateRoleTransition(currentSkillIds, targetRoleId, currentRoleId);
  }

  /**
   * Adopts the simulated target role as the student's active career goal,
   * updating their profile and dynamic roadmap.
   */
  public static async adoptTargetRole(
    studentId: string,
    targetRoleId: string
  ): Promise<{ success: boolean; newRoleName: string; message: string }> {
    const targetGraph = FALLBACK_GRAPHS[targetRoleId] || FALLBACK_GRAPHS['role-data'];
    const newRoleName = targetGraph.role?.name || 'Selected Career';

    // 1. Update in memoryStore
    let mem = memoryStore.profiles.get(studentId);
    if (!mem) {
      for (const p of memoryStore.profiles.values()) {
        if (p.id === studentId || p.user_id === studentId) {
          mem = p;
          break;
        }
      }
    }

    if (mem) {
      mem.selected_role_id = targetRoleId;
      mem.resume_matched_role = newRoleName;
    } else {
      memoryStore.profiles.set(studentId, {
        id: studentId,
        user_id: studentId,
        full_name: 'Priya Sharma',
        institution: 'Vidyut Institute of Technology',
        degree: 'B.Tech',
        year_of_study: 3,
        selected_role_id: targetRoleId,
        resume_matched_role: newRoleName,
        interests: ['Full-Stack Development', 'AI/ML'],
        readiness_pct: 68,
      });
    }

    // 2. Update in Prisma if online
    try {
      await prisma.studentProfile.updateMany({
        where: { OR: [{ id: studentId }, { userId: studentId }] },
        data: { selectedRoleId: targetRoleId },
      });
    } catch {
      // Prisma offline, memoryStore is source of truth
    }

    // 3. Update Skill Passport target role
    const passport = await PassportService.getOrCreatePassport(studentId);
    passport.targetRole = newRoleName;
    passport.lastUpdatedAt = new Date().toISOString();

    return {
      success: true,
      newRoleName,
      message: `Career target updated to ${newRoleName}. Dynamic roadmap and diagnostic questions re-calibrated.`,
    };
  }
}
