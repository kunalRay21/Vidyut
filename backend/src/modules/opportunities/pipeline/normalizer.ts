import { RawOpportunityItem, OpportunityType, WorkMode } from './types';

export function normalizeOpportunityType(raw?: string): OpportunityType {
  if (!raw) return 'INTERNSHIP';
  const lower = raw.trim().toLowerCase();
  if (lower.includes('hackathon') || lower.includes('contest') || lower.includes('challenge')) return 'HACKATHON';
  if (lower.includes('job') || lower.includes('full-time') || lower.includes('fulltime')) return 'JOB';
  if (lower.includes('project') || lower.includes('freelance')) return 'PROJECT';
  return 'INTERNSHIP';
}

export function normalizeWorkMode(raw?: string): WorkMode {
  if (!raw) return 'REMOTE';
  const lower = raw.trim().toLowerCase();
  if (lower.includes('hybrid')) return 'HYBRID';
  if (lower.includes('site') || lower.includes('office') || lower.includes('in-person')) return 'ON_SITE';
  if (lower.includes('remote') || lower.includes('online') || lower.includes('wfh') || lower.includes('home')) return 'REMOTE';
  return 'REMOTE';
}

export function normalizeStipend(raw?: string): string {
  if (!raw || !raw.trim()) return 'Unspecified';
  const str = raw.trim();
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    return `₹${num.toLocaleString('en-IN')} / month`;
  }
  return str;
}

export function normalizeLocation(raw?: string): string {
  if (!raw || !raw.trim()) return 'India';
  return raw.trim().replace(/\s+/g, ' ');
}

export function normalizeDeadline(raw?: string): string {
  if (!raw || !raw.trim()) return '2026-11-30';
  return raw.trim();
}
