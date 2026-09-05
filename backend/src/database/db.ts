import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vidyut_db';

export const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 4000,
});

let isPostgresAvailable = false;

pool.on('error', (err) => {
  console.warn('⚠️ [Database Pool Warning]: Unexpected client error:', err.message);
  isPostgresAvailable = false;
});

export function getPool(): Pool {
  return pool;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isPostgresAvailable = true;
    return true;
  } catch {
    isPostgresAvailable = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isPostgresAvailable;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SQL Query] (${duration}ms):`, text.replace(/\s+/g, ' ').trim().slice(0, 80));
  }
  return res;
}

export async function initDatabaseSchema(): Promise<boolean> {
  const schemaSQL = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users Table (Owned by Team Leader)
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'INSTITUTION', 'INDUSTRY', 'ADMIN')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Domains Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS domains (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      demand_level VARCHAR(50) DEFAULT 'MEDIUM',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Roles Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(domain_id, name)
    );

    -- Student Profiles Table (Owned by Team Leader)
    CREATE TABLE IF NOT EXISTS student_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      institution VARCHAR(255),
      degree VARCHAR(100),
      year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 5),
      selected_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
      interests TEXT[],
      readiness_pct FLOAT DEFAULT 0.0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Institutions Table (Owned by Team Leader)
    CREATE TABLE IF NOT EXISTS institutions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      college_name VARCHAR(255) NOT NULL,
      aishe_code VARCHAR(50),
      officer_name VARCHAR(255),
      departments TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Companies Table (Owned by Team Leader)
    CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      company_name VARCHAR(255) NOT NULL,
      sector VARCHAR(100),
      website VARCHAR(255),
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Skills Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS skills (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(50) DEFAULT 'TECHNICAL',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(role_id, name)
    );

    -- Skill Prerequisites DAG Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS skill_prerequisites (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      prerequisite_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(skill_id, prerequisite_skill_id)
    );

    -- Technology Branches Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS technology_branches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(role_id, name)
    );

    -- Technology Branch Options Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS technology_branch_options (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      branch_id UUID NOT NULL REFERENCES technology_branches(id) ON DELETE CASCADE,
      skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(branch_id, skill_id)
    );

    -- Questions Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS questions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
      difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
      explanation TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Assessment Sessions Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      status VARCHAR(30) NOT NULL DEFAULT 'STARTED',
      score FLOAT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );

    -- Question Responses Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS question_responses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      selected_option CHAR(1),
      is_correct BOOLEAN,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(session_id, question_id)
    );

    -- Student Skill States Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS student_skill_states (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      self_rating VARCHAR(30),
      assessed_level VARCHAR(30),
      accuracy FLOAT DEFAULT 0,
      target_level VARCHAR(30) DEFAULT 'PROFICIENT',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(student_id, skill_id)
    );

    -- Roadmap States Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS roadmap_states (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      selected_branch_id UUID REFERENCES technology_branches(id) ON DELETE SET NULL,
      readiness_pct FLOAT DEFAULT 0.0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(student_id, role_id)
    );

    -- Milestones Table (Owned by Member 4)
    CREATE TABLE IF NOT EXISTS milestones (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      roadmap_id UUID NOT NULL REFERENCES roadmap_states(id) ON DELETE CASCADE,
      skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      phase INTEGER NOT NULL,
      milestone_order INTEGER NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'LOCKED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Opportunities Table (Owned by Member 5)
    CREATE TABLE IF NOT EXISTS opportunities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      external_id VARCHAR(255),
      source VARCHAR(50) NOT NULL DEFAULT 'DIRECT',
      original_url TEXT,
      title VARCHAR(255) NOT NULL,
      organization VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'INTERNSHIP',
      mode VARCHAR(50) NOT NULL DEFAULT 'REMOTE',
      location VARCHAR(255),
      deadline VARCHAR(100),
      stipend VARCHAR(100),
      description_raw TEXT,
      eligibility_raw TEXT,
      domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
      fingerprint VARCHAR(255) UNIQUE,
      is_active BOOLEAN DEFAULT TRUE,
      extracted_at TIMESTAMPTZ DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE SET NULL;

    -- Opportunity Skill Tags Table (Owned by Member 5)
    CREATE TABLE IF NOT EXISTS opportunity_skill_tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
      skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      min_proficiency VARCHAR(50) DEFAULT 'BEGINNER',
      weight FLOAT DEFAULT 1.0
    );

    -- Resources Table (Role 5)
    CREATE TABLE IF NOT EXISTS resources (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      is_free BOOLEAN NOT NULL DEFAULT TRUE,
      provider VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Recommendations Table (Role 5)
    CREATE TABLE IF NOT EXISTS recommendations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      compatibility_score FLOAT NOT NULL,
      segment VARCHAR(50) NOT NULL,
      explanation_json JSONB NOT NULL,
      generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(student_id, opportunity_id)
    );

    -- Assessment Platform Upgrade Additions (Safe non-destructive ALTERs)
    ALTER TABLE questions
      ADD COLUMN IF NOT EXISTS question_type VARCHAR(30) DEFAULT 'MCQ_SINGLE',
      ADD COLUMN IF NOT EXISTS code_snippet TEXT,
      ADD COLUMN IF NOT EXISTS code_language VARCHAR(50) DEFAULT 'python',
      ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

    ALTER TABLE assessment_sessions
      ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 900,
      ADD COLUMN IF NOT EXISTS time_remaining_seconds INTEGER DEFAULT 900,
      ADD COLUMN IF NOT EXISTS current_question_index INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS test_title VARCHAR(255) DEFAULT 'Diagnostic Assessment';

    ALTER TABLE question_responses
      ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_marked_for_review BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS selected_options TEXT[] DEFAULT '{}';

    ALTER TABLE student_profiles
      ADD COLUMN IF NOT EXISTS resume_filename VARCHAR(255),
      ADD COLUMN IF NOT EXISTS resume_raw_text TEXT,
      ADD COLUMN IF NOT EXISTS parsed_skills TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS resume_matched_role VARCHAR(100),
      ADD COLUMN IF NOT EXISTS resume_match_score FLOAT DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS resume_parsed_data JSONB;
  `;

  try {
    const client = await pool.connect();
    try {
      await client.query(schemaSQL);
      isPostgresAvailable = true;
      console.log('✅ [Database]: Core schemas initialized (users, student_profiles, institutions, companies, opportunities, skill graph, assessments, roadmap, recommendations, resources).');
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn(`⚠️ [Database]: PostgreSQL not available (${err.message}). Using in-memory fallback store for offline development.`);
    isPostgresAvailable = false;
    return false;
  }
}
