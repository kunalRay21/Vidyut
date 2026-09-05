import { query } from '../../../database/db';

interface DomainRecord {
  id: string;
  name: string;
}

let cachedDomains: DomainRecord[] | null = null;

export async function matchDomain(title: string, description: string): Promise<string | undefined> {
  const text = `${title} ${description}`.toLowerCase();

  // Load canonical domains if not cached
  if (!cachedDomains) {
    try {
      const res = await query<DomainRecord>(`SELECT id, name FROM domains`);
      if (res.rows && res.rows.length > 0) {
        cachedDomains = res.rows;
      }
    } catch {
      // Postgres offline fallback - empty cache
      cachedDomains = [];
    }
  }

  if (cachedDomains && cachedDomains.length > 0) {
    for (const d of cachedDomains) {
      const dName = d.name.toLowerCase();
      // Match keywords
      if (text.includes(dName)) return d.id;
      if (dName.includes('software') && (text.includes('backend') || text.includes('frontend') || text.includes('full-stack') || text.includes('software'))) return d.id;
      if (dName.includes('data') && (text.includes('machine learning') || text.includes('data science') || text.includes('ai') || text.includes('nlp'))) return d.id;
      if (dName.includes('cloud') && (text.includes('devops') || text.includes('kubernetes') || text.includes('cloud') || text.includes('aws'))) return d.id;
      if (dName.includes('cyber') && (text.includes('security') || text.includes('soc') || text.includes('penetration'))) return d.id;
    }
    return cachedDomains[0]?.id;
  }

  return undefined;
}
