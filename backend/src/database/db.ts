import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let isPostgresAvailable = false;

export function getPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('ℹ️ [DB] No DATABASE_URL found in environment. Running in dual-persistence in-memory mode.');
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 4000,
    });

    pool.on('error', (err) => {
      console.warn('⚠️ [DB] Unexpected PostgreSQL pool error:', err.message);
      isPostgresAvailable = false;
    });

    return pool;
  } catch (err) {
    console.warn('⚠️ [DB] Failed to initialize PostgreSQL pool:', (err as Error).message);
    return null;
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  const p = getPool();
  if (!p) {
    isPostgresAvailable = false;
    return false;
  }

  try {
    const client = await p.connect();
    await client.query('SELECT 1');
    client.release();
    isPostgresAvailable = true;
    console.log('✅ [DB] PostgreSQL connection verified.');
    return true;
  } catch (error) {
    console.warn('⚠️ [DB] PostgreSQL unavailable. Operating with high-fidelity in-memory store.');
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
): Promise<QueryResult<T> | null> {
  const p = getPool();
  if (!p || !isPostgresAvailable) {
    return null;
  }

  try {
    return await p.query<T>(text, params);
  } catch (err) {
    console.error('❌ [DB Query Error]:', (err as Error).message);
    return null;
  }
}
