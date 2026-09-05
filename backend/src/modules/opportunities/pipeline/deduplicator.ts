import crypto from 'crypto';
import { query } from '../../../database/db';

export function generateFingerprint(
  source: string,
  externalId: string,
  organization: string,
  title: string,
  location?: string
): string {
  const raw = `${source}|${externalId}|${organization}|${title}|${location || ''}`.toLowerCase().trim();
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}

export async function isOpportunityDuplicate(fingerprint: string): Promise<boolean> {
  try {
    const res = await query(`SELECT id FROM opportunities WHERE fingerprint = $1 LIMIT 1`, [fingerprint]);
    if (res.rows && res.rows.length > 0) {
      return true;
    }
  } catch {
    // In-memory check performed by caller if Postgres offline
  }
  return false;
}
