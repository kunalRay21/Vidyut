import { query } from '../../../database/db';

interface RoleRecord {
  id: string;
  name: string;
  domain_id: string;
}

let cachedRoles: RoleRecord[] | null = null;

export async function matchRole(title: string, description: string): Promise<{ roleId?: string; domainId?: string }> {
  const text = `${title} ${description}`.toLowerCase();

  if (!cachedRoles) {
    try {
      const res = await query<RoleRecord>(`SELECT id, name, domain_id FROM roles`);
      if (res.rows && res.rows.length > 0) {
        cachedRoles = res.rows;
      }
    } catch {
      cachedRoles = [];
    }
  }

  if (cachedRoles && cachedRoles.length > 0) {
    for (const r of cachedRoles) {
      const rName = r.name.toLowerCase();
      if (text.includes(rName)) {
        return { roleId: r.id, domainId: r.domain_id };
      }
      if (rName.includes('backend') && (text.includes('backend') || text.includes('node') || text.includes('fastapi') || text.includes('spring'))) {
        return { roleId: r.id, domainId: r.domain_id };
      }
      if (rName.includes('machine learning') && (text.includes('ml') || text.includes('ai') || text.includes('data science') || text.includes('model'))) {
        return { roleId: r.id, domainId: r.domain_id };
      }
      if (rName.includes('frontend') && (text.includes('frontend') || text.includes('react') || text.includes('ui'))) {
        return { roleId: r.id, domainId: r.domain_id };
      }
    }
  }

  return {};
}
