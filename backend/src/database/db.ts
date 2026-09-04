import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vidyut_db';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

pool.on('error', (err) => {
  console.warn('⚠️ [Database Pool Warning]: Unexpected client error:', err.message);
});

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

    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'INSTITUTION', 'INDUSTRY', 'ADMIN')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Student Profiles Table
    CREATE TABLE IF NOT EXISTS student_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      institution VARCHAR(255) NOT NULL,
      degree VARCHAR(255) NOT NULL,
      year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 5),
      interests TEXT[] DEFAULT '{}',
      selected_role_id UUID,
      readiness_pct FLOAT DEFAULT 0.0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Academic Institutions Table
    CREATE TABLE IF NOT EXISTS institutions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      college_name VARCHAR(255) NOT NULL,
      aishe_code VARCHAR(100),
      officer_name VARCHAR(255) NOT NULL,
      departments TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Industry Partner Companies Table
    CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      company_name VARCHAR(255) NOT NULL,
      sector VARCHAR(100) NOT NULL,
      website VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Opportunities Table
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
      fingerprint VARCHAR(255) UNIQUE,
      is_active BOOLEAN DEFAULT TRUE,
      extracted_at TIMESTAMPTZ DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Opportunity Skill Tags Table
    CREATE TABLE IF NOT EXISTS opportunity_skill_tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
      skill_id VARCHAR(100) NOT NULL,
      min_proficiency VARCHAR(50) DEFAULT 'BEGINNER',
      weight FLOAT DEFAULT 1.0
    );
  `;

  try {
    const client = await pool.connect();
    try {
      await client.query(schemaSQL);
      console.log('✅ [Database]: Core schemas initialized (users, student_profiles, institutions, companies).');
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn(`⚠️ [Database]: PostgreSQL not available (${err.message}). Using in-memory fallback store for offline development.`);
    return false;
  }
}
