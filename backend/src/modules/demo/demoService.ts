import bcrypt from 'bcryptjs';
import { query, checkDatabaseConnection, isDbConnected } from '../../database/db';
import { memoryStore, inMemorySkillStates } from '../../database/store';
import { logger } from '../../core/logger';
import { generateAccessToken } from '../../auth/jwt';

export interface DemoStudentState {
  userId: string;
  studentId: string;
  fullName: string;
  email: string;
  academicBranchCode: string;
  academicBranchName: string;
  domainId: string;
  domainName: string;
  roleId: string;
  roleName: string;
  selectedBranchId: string;
  selectedBranchOption: string;
  token: string;
  skillStates: Array<{
    skillId: string;
    skillName: string;
    assessedLevel: string;
    targetLevel: string;
    accuracy: number;
  }>;
}

export class DemoService {
  public static readonly DEMO_EMAIL = 'ananya.sharma@vidyut.ac.in';
  public static readonly DEMO_NAME = 'Ananya Sharma';
  public static readonly DEMO_PASSWORD = 'Password@123';
  public static readonly DEMO_USER_ID = '00000000-0000-4000-a000-000000000001';
  public static readonly DEMO_STUDENT_ID = '00000000-0000-4000-a000-000000000002';

  /**
   * Resets and initializes the deterministic Demo Student scenario.
   * Cleans only demo-specific data without touching any production data or canonical taxonomy.
   */
  public async resetDemoEnvironment(): Promise<DemoStudentState> {
    logger.info('DemoService', 'Initiating deterministic demo environment reset');

    const dbConnected = await checkDatabaseConnection();
    const passwordHash = await bcrypt.hash(DemoService.DEMO_PASSWORD, 10);

    // 1. Resolve Academic Branch for CSE
    let branchId = 'academic-branch-cse';
    let branchName = 'Computer Science & Engineering';

    // 2. Resolve Role for Backend Developer
    let domainId = 'domain-backend';
    let domainName = 'Backend Development';
    let roleId = 'role-backend';
    let roleName = 'Backend Developer';

    // 3. Resolve Skills for role-backend
    let progFundSkillId = 'skill-prog-fund';
    let pythonSkillId = 'skill-python';
    let sqlSkillId = 'skill-sql';
    let httpSkillId = 'skill-http';
    let restSkillId = 'skill-rest';
    let dockerSkillId = 'skill-docker';
    let techBranchId = 'branch-backend-framework';
    let techBranchOptionId = 'opt-fastapi';

    if (dbConnected) {
      try {
        // Resolve real DB IDs if present
        const branchRes = await query(`SELECT id, name FROM academic_branches WHERE code = 'CSE' LIMIT 1`);
        if (branchRes.rows.length > 0) {
          branchId = branchRes.rows[0].id;
          branchName = branchRes.rows[0].name;
        }

        const roleRes = await query(`
          SELECT r.id AS role_id, r.name AS role_name, d.id AS domain_id, d.name AS domain_name
          FROM roles r
          JOIN domains d ON d.id = r.domain_id
          WHERE r.name ILIKE '%Backend Developer%'
          LIMIT 1
        `);
        if (roleRes.rows.length > 0) {
          roleId = roleRes.rows[0].role_id;
          roleName = roleRes.rows[0].role_name;
          domainId = roleRes.rows[0].domain_id;
          domainName = roleRes.rows[0].domain_name;
        }

        const skillsRes = await query(`SELECT id, name FROM skills WHERE role_id = $1`, [roleId]);
        for (const s of skillsRes.rows) {
          const lower = s.name.toLowerCase();
          if (lower.includes('programming') || lower.includes('fundamentals')) progFundSkillId = s.id;
          else if (lower.includes('python')) pythonSkillId = s.id;
          else if (lower.includes('sql')) sqlSkillId = s.id;
          else if (lower === 'http') httpSkillId = s.id;
          else if (lower.includes('rest')) restSkillId = s.id;
          else if (lower.includes('docker')) dockerSkillId = s.id;
        }

        const branchRes2 = await query(`SELECT id FROM technology_branches WHERE role_id = $1 LIMIT 1`, [roleId]);
        if (branchRes2.rows.length > 0) {
          techBranchId = branchRes2.rows[0].id;
        }

        // Clean up ONLY demo student data in PostgreSQL
        const existingUser = await query(`SELECT id FROM users WHERE email = $1`, [DemoService.DEMO_EMAIL]);
        let existingUserId = DemoService.DEMO_USER_ID;
        let existingStudentId = DemoService.DEMO_STUDENT_ID;

        if (existingUser.rows.length > 0) {
          existingUserId = existingUser.rows[0].id;
          const profRes = await query(`SELECT id FROM student_profiles WHERE user_id = $1`, [existingUserId]);
          if (profRes.rows.length > 0) {
            existingStudentId = profRes.rows[0].id;
          }

          // Clean up student child tables
          await query(`DELETE FROM recommendations WHERE student_id = $1`, [existingStudentId]);
          await query(`DELETE FROM roadmap_states WHERE student_id = $1`, [existingStudentId]);
          await query(`DELETE FROM student_skill_states WHERE student_id = $1`, [existingStudentId]);
          await query(`DELETE FROM assessment_sessions WHERE student_id = $1`, [existingStudentId]);

          // Update student profile
          await query(`
            UPDATE student_profiles
            SET full_name = $1, academic_branch_id = $2, selected_role_id = $3, year_of_study = 3, readiness_pct = 0.0, updated_at = NOW()
            WHERE id = $4
          `, [DemoService.DEMO_NAME, branchId, roleId, existingStudentId]);
        } else {
          // Insert User
          await query(`
            INSERT INTO users (id, email, password_hash, role)
            VALUES ($1, $2, $3, 'STUDENT')
            ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
          `, [existingUserId, DemoService.DEMO_EMAIL, passwordHash]);

          // Insert Student Profile
          await query(`
            INSERT INTO student_profiles (id, user_id, full_name, institution, degree, academic_branch_id, year_of_study, selected_role_id, readiness_pct)
            VALUES ($1, $2, $3, 'National Institute of Technology', 'B.Tech', $4, 3, $5, 0.0)
            ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, selected_role_id = EXCLUDED.selected_role_id
          `, [existingStudentId, existingUserId, DemoService.DEMO_NAME, branchId, roleId]);
        }

        // Insert initial deterministic skill states in PostgreSQL
        await query(`
          INSERT INTO student_skill_states (student_id, skill_id, self_rating, assessed_level, accuracy, target_level)
          VALUES 
            ($1, $2, 'GOOD', 'PROFICIENT', 0.90, 'PROFICIENT'),
            ($1, $3, 'BEGINNER', 'BEGINNER', 0.35, 'PROFICIENT'),
            ($1, $4, 'BEGINNER', 'BEGINNER', 0.40, 'INTERMEDIATE')
          ON CONFLICT (student_id, skill_id) DO UPDATE
          SET assessed_level = EXCLUDED.assessed_level, accuracy = EXCLUDED.accuracy, target_level = EXCLUDED.target_level
        `, [existingStudentId, progFundSkillId, pythonSkillId, sqlSkillId]);

      } catch (err: any) {
        logger.warn('DemoService', `Postgres demo seeding notice: ${err.message}. Ensuring in-memory state is synchronized.`);
      }
    }

    // Synchronize In-Memory Dual-Persistence Store
    const userId = DemoService.DEMO_USER_ID;
    const studentId = DemoService.DEMO_STUDENT_ID;

    memoryStore.users.set(userId, {
      id: userId,
      email: DemoService.DEMO_EMAIL,
      password_hash: passwordHash,
      role: 'STUDENT',
      created_at: new Date().toISOString(),
    });

    memoryStore.profiles.set(studentId, {
      id: studentId,
      user_id: userId,
      full_name: DemoService.DEMO_NAME,
      institution: 'National Institute of Technology',
      degree: 'B.Tech',
      academic_branch_id: branchId,
      year_of_study: 3,
      interests: ['Backend Systems', 'Distributed Computing', 'APIs'],
      selected_role_id: roleId,
      readiness_pct: 0.0,
    });
    // Also index by userId for lookup resilience
    memoryStore.profiles.set(userId, memoryStore.profiles.get(studentId)!);

    // Clear previous demo student skill states in memory
    for (const key of Array.from(memoryStore.skill_states.keys())) {
      if (key.startsWith(`${studentId}:`) || key.startsWith(`${userId}:`)) {
        memoryStore.skill_states.delete(key);
      }
    }
    for (const key of Array.from(inMemorySkillStates.keys())) {
      if (key.startsWith(`${studentId}:`) || key.startsWith(`${userId}:`)) {
        inMemorySkillStates.delete(key);
      }
    }

    // Set deterministic Initial Skill States
    const initialSkills = [
      {
        skill_id: progFundSkillId,
        skill_name: 'Programming Fundamentals',
        self_rating: 'GOOD',
        assessed_level: 'PROFICIENT',
        target_level: 'PROFICIENT',
        accuracy: 0.90,
      },
      {
        skill_id: pythonSkillId,
        skill_name: 'Python',
        self_rating: 'BEGINNER',
        assessed_level: 'BEGINNER',
        target_level: 'PROFICIENT',
        accuracy: 0.35,
      },
      {
        skill_id: sqlSkillId,
        skill_name: 'SQL',
        self_rating: 'BEGINNER',
        assessed_level: 'BEGINNER',
        target_level: 'INTERMEDIATE',
        accuracy: 0.40,
      },
    ];

    for (const s of initialSkills) {
      const stateObj = {
        student_id: studentId,
        skill_id: s.skill_id,
        skill_name: s.skill_name,
        self_rating: s.self_rating,
        assessed_level: s.assessed_level,
        target_level: s.target_level,
        accuracy: s.accuracy,
        updated_at: new Date().toISOString(),
      };
      memoryStore.skill_states.set(`${studentId}:${s.skill_id}`, stateObj);
      memoryStore.skill_states.set(`${userId}:${s.skill_id}`, stateObj);
      inMemorySkillStates.set(`${studentId}:${s.skill_id}`, stateObj);
      inMemorySkillStates.set(`${userId}:${s.skill_id}`, stateObj);
    }

    const token = generateAccessToken({
      id: userId,
      email: DemoService.DEMO_EMAIL,
      role: 'STUDENT',
    });

    logger.info('DemoService', 'Deterministic demo environment reset complete', {
      student: DemoService.DEMO_NAME,
      email: DemoService.DEMO_EMAIL,
      branch: branchName,
      role: roleName,
    });

    return {
      userId,
      studentId,
      fullName: DemoService.DEMO_NAME,
      email: DemoService.DEMO_EMAIL,
      academicBranchCode: 'CSE',
      academicBranchName: branchName,
      domainId,
      domainName,
      roleId,
      roleName,
      selectedBranchId: techBranchId,
      selectedBranchOption: 'FastAPI',
      token,
      skillStates: initialSkills.map(s => ({
        skillId: s.skill_id,
        skillName: s.skill_name,
        assessedLevel: s.assessed_level,
        targetLevel: s.target_level,
        accuracy: s.accuracy,
      })),
    };
  }

  /**
   * Simulates the student improving Python skill state from BEGINNER to PROFICIENT
   * Demonstrates the adaptive feedback loop: reassessment -> updated state -> roadmap adaptation.
   */
  public async advanceDemoStudentSkill(skillName: string = 'Python', newLevel: string = 'PROFICIENT', accuracy: number = 0.95): Promise<void> {
    const studentId = DemoService.DEMO_STUDENT_ID;
    const userId = DemoService.DEMO_USER_ID;

    // Find skill ID
    let targetSkillId = 'skill-python';
    if (skillName.toLowerCase().includes('python')) targetSkillId = 'skill-python';
    else if (skillName.toLowerCase().includes('sql')) targetSkillId = 'skill-sql';

    if (isDbConnected()) {
      try {
        await query(`
          UPDATE student_skill_states
          SET assessed_level = $1, accuracy = $2, updated_at = NOW()
          WHERE student_id = $3 AND skill_id IN (SELECT id FROM skills WHERE name ILIKE $4)
        `, [newLevel, accuracy, studentId, `%${skillName}%`]);
      } catch (err: any) {
        logger.warn('DemoService', `DB skill advancement notice: ${err.message}`);
      }
    }

    // Update in-memory stores
    const stateObj = {
      student_id: studentId,
      skill_id: targetSkillId,
      skill_name: skillName,
      self_rating: 'GOOD',
      assessed_level: newLevel,
      target_level: 'PROFICIENT',
      accuracy,
      updated_at: new Date().toISOString(),
    };

    memoryStore.skill_states.set(`${studentId}:${targetSkillId}`, stateObj);
    memoryStore.skill_states.set(`${userId}:${targetSkillId}`, stateObj);
    inMemorySkillStates.set(`${studentId}:${targetSkillId}`, stateObj);
    inMemorySkillStates.set(`${userId}:${targetSkillId}`, stateObj);

    logger.info('DemoService', `Demo student skill updated: ${skillName} -> ${newLevel} (accuracy ${accuracy})`);
  }
}

export const demoService = new DemoService();
