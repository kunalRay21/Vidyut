import { query } from '../../database/db';
import { memoryStore } from '../../database/store';

export interface AcademicBranchData {
  id: string;
  code: string;
  name: string;
  degree?: string;
  description?: string;
}

export interface BranchDomainRelevance {
  branchCode: string;
  domainName: string;
  relevance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const CANONICAL_ACADEMIC_BRANCHES: Omit<AcademicBranchData, 'id'>[] = [
  {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    degree: 'B.Tech / B.E.',
    description: 'Algorithms, software engineering, systems architecture, and computing principles.',
  },
  {
    code: 'IT',
    name: 'Information Technology',
    degree: 'B.Tech / B.E.',
    description: 'Information systems, network administration, database management, and web applications.',
  },
  {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    degree: 'B.Tech / B.E.',
    description: 'Embedded systems, signal processing, communication networks, and hardware-software integration.',
  },
  {
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    degree: 'B.Tech / B.E.',
    description: 'Power electronics, control systems, microcontrollers, and electrical grid infrastructure.',
  },
  {
    code: 'MECH',
    name: 'Mechanical Engineering',
    degree: 'B.Tech / B.E.',
    description: 'Thermodynamics, robotics, CAD/CAM design, and industrial automation.',
  },
  {
    code: 'CIVIL',
    name: 'Civil Engineering',
    degree: 'B.Tech / B.E.',
    description: 'Structural engineering, spatial data systems, BIM modeling, and smart infrastructure.',
  },
  {
    code: 'BIOTECH',
    name: 'Biotechnology & Bioengineering',
    degree: 'B.Tech / B.Sc.',
    description: 'Bioinformatics, computational biology, genomic data processing, and lab automation.',
  },
  {
    code: 'BCA',
    name: 'Bachelor of Computer Applications',
    degree: 'BCA',
    description: 'Software development, web technology, database administration, and application design.',
  },
  {
    code: 'MCA',
    name: 'Master of Computer Applications',
    degree: 'MCA',
    description: 'Advanced computing, enterprise architecture, cloud deployment, and system security.',
  },
  {
    code: 'BBA',
    name: 'Bachelor of Business Administration',
    degree: 'BBA',
    description: 'Business analytics, management principles, financial modeling, and marketing technology.',
  },
  {
    code: 'MBA',
    name: 'Master of Business Administration',
    degree: 'MBA',
    description: 'Strategic leadership, tech-product management, business intelligence, and digital operations.',
  },
  {
    code: 'OTHER',
    name: 'General / Other Academic Discipline',
    degree: 'Other',
    description: 'Cross-disciplinary programs or humanities, basic sciences, and open degree paths.',
  },
];

export const BRANCH_DOMAIN_RELEVANCE_MAP: BranchDomainRelevance[] = [
  // CSE / IT / BCA / MCA -> High across technical computing domains
  { branchCode: 'CSE', domainName: 'Backend & Distributed Systems', relevance: 'HIGH' },
  { branchCode: 'CSE', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'HIGH' },
  { branchCode: 'CSE', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'CSE', domainName: 'Cloud Native & DevOps Engineering', relevance: 'HIGH' },
  { branchCode: 'CSE', domainName: 'Full-Stack Web Architecture', relevance: 'HIGH' },
  { branchCode: 'CSE', domainName: 'Cybersecurity & Defensive Systems', relevance: 'HIGH' },

  { branchCode: 'IT', domainName: 'Backend & Distributed Systems', relevance: 'HIGH' },
  { branchCode: 'IT', domainName: 'Full-Stack Web Architecture', relevance: 'HIGH' },
  { branchCode: 'IT', domainName: 'Cloud Native & DevOps Engineering', relevance: 'HIGH' },
  { branchCode: 'IT', domainName: 'Cybersecurity & Defensive Systems', relevance: 'HIGH' },
  { branchCode: 'IT', domainName: 'Data Science & Big Data Engineering', relevance: 'MEDIUM' },
  { branchCode: 'IT', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'MEDIUM' },

  { branchCode: 'BCA', domainName: 'Full-Stack Web Architecture', relevance: 'HIGH' },
  { branchCode: 'BCA', domainName: 'Backend & Distributed Systems', relevance: 'HIGH' },
  { branchCode: 'BCA', domainName: 'Data Science & Big Data Engineering', relevance: 'MEDIUM' },
  { branchCode: 'BCA', domainName: 'Cloud Native & DevOps Engineering', relevance: 'MEDIUM' },
  { branchCode: 'BCA', domainName: 'Cybersecurity & Defensive Systems', relevance: 'MEDIUM' },
  { branchCode: 'BCA', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'MEDIUM' },

  { branchCode: 'MCA', domainName: 'Backend & Distributed Systems', relevance: 'HIGH' },
  { branchCode: 'MCA', domainName: 'Full-Stack Web Architecture', relevance: 'HIGH' },
  { branchCode: 'MCA', domainName: 'Cloud Native & DevOps Engineering', relevance: 'HIGH' },
  { branchCode: 'MCA', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'HIGH' },
  { branchCode: 'MCA', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'MCA', domainName: 'Cybersecurity & Defensive Systems', relevance: 'HIGH' },

  // ECE / EEE -> High AI/ML, Data, Cloud & Security; Medium Backend & Fullstack
  { branchCode: 'ECE', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'HIGH' },
  { branchCode: 'ECE', domainName: 'Cloud Native & DevOps Engineering', relevance: 'HIGH' },
  { branchCode: 'ECE', domainName: 'Cybersecurity & Defensive Systems', relevance: 'HIGH' },
  { branchCode: 'ECE', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'ECE', domainName: 'Backend & Distributed Systems', relevance: 'MEDIUM' },
  { branchCode: 'ECE', domainName: 'Full-Stack Web Architecture', relevance: 'MEDIUM' },

  { branchCode: 'EEE', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'HIGH' },
  { branchCode: 'EEE', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'EEE', domainName: 'Cloud Native & DevOps Engineering', relevance: 'MEDIUM' },
  { branchCode: 'EEE', domainName: 'Cybersecurity & Defensive Systems', relevance: 'MEDIUM' },
  { branchCode: 'EEE', domainName: 'Backend & Distributed Systems', relevance: 'MEDIUM' },
  { branchCode: 'EEE', domainName: 'Full-Stack Web Architecture', relevance: 'LOW' },

  // BIOTECH -> High Data & AI/ML
  { branchCode: 'BIOTECH', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'BIOTECH', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'HIGH' },
  { branchCode: 'BIOTECH', domainName: 'Cloud Native & DevOps Engineering', relevance: 'MEDIUM' },
  { branchCode: 'BIOTECH', domainName: 'Full-Stack Web Architecture', relevance: 'LOW' },
  { branchCode: 'BIOTECH', domainName: 'Backend & Distributed Systems', relevance: 'LOW' },
  { branchCode: 'BIOTECH', domainName: 'Cybersecurity & Defensive Systems', relevance: 'LOW' },

  // MECH / CIVIL -> High Data, Medium AI & Cloud
  { branchCode: 'MECH', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'MECH', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'MEDIUM' },
  { branchCode: 'MECH', domainName: 'Cloud Native & DevOps Engineering', relevance: 'MEDIUM' },
  { branchCode: 'MECH', domainName: 'Full-Stack Web Architecture', relevance: 'MEDIUM' },
  { branchCode: 'MECH', domainName: 'Backend & Distributed Systems', relevance: 'LOW' },
  { branchCode: 'MECH', domainName: 'Cybersecurity & Defensive Systems', relevance: 'LOW' },

  { branchCode: 'CIVIL', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'CIVIL', domainName: 'Cloud Native & DevOps Engineering', relevance: 'MEDIUM' },
  { branchCode: 'CIVIL', domainName: 'Full-Stack Web Architecture', relevance: 'MEDIUM' },
  { branchCode: 'CIVIL', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'LOW' },
  { branchCode: 'CIVIL', domainName: 'Backend & Distributed Systems', relevance: 'LOW' },
  { branchCode: 'CIVIL', domainName: 'Cybersecurity & Defensive Systems', relevance: 'LOW' },

  // BBA / MBA -> High Data & Business Analytics
  { branchCode: 'BBA', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'BBA', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'MEDIUM' },
  { branchCode: 'BBA', domainName: 'Full-Stack Web Architecture', relevance: 'LOW' },
  { branchCode: 'BBA', domainName: 'Cloud Native & DevOps Engineering', relevance: 'LOW' },
  { branchCode: 'BBA', domainName: 'Backend & Distributed Systems', relevance: 'LOW' },
  { branchCode: 'BBA', domainName: 'Cybersecurity & Defensive Systems', relevance: 'LOW' },

  { branchCode: 'MBA', domainName: 'Data Science & Big Data Engineering', relevance: 'HIGH' },
  { branchCode: 'MBA', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'HIGH' },
  { branchCode: 'MBA', domainName: 'Cloud Native & DevOps Engineering', relevance: 'MEDIUM' },
  { branchCode: 'MBA', domainName: 'Cybersecurity & Defensive Systems', relevance: 'MEDIUM' },
  { branchCode: 'MBA', domainName: 'Full-Stack Web Architecture', relevance: 'LOW' },
  { branchCode: 'MBA', domainName: 'Backend & Distributed Systems', relevance: 'LOW' },

  // OTHER -> Medium across all
  { branchCode: 'OTHER', domainName: 'Backend & Distributed Systems', relevance: 'MEDIUM' },
  { branchCode: 'OTHER', domainName: 'Artificial Intelligence & Machine Learning', relevance: 'MEDIUM' },
  { branchCode: 'OTHER', domainName: 'Data Science & Big Data Engineering', relevance: 'MEDIUM' },
  { branchCode: 'OTHER', domainName: 'Cloud Native & DevOps Engineering', relevance: 'MEDIUM' },
  { branchCode: 'OTHER', domainName: 'Full-Stack Web Architecture', relevance: 'MEDIUM' },
  { branchCode: 'OTHER', domainName: 'Cybersecurity & Defensive Systems', relevance: 'MEDIUM' },
];

export async function seedAcademicBranches(): Promise<{ branchesCount: number; linksCount: number }> {
  let branchesCount = 0;
  let linksCount = 0;

  // 1. In-memory store seeding
  for (const item of CANONICAL_ACADEMIC_BRANCHES) {
    const existing = Array.from(memoryStore.academic_branches.values()).find(b => b.code === item.code);
    const branchId = existing?.id || `branch-${item.code.toLowerCase()}`;
    memoryStore.academic_branches.set(branchId, {
      id: branchId,
      code: item.code,
      name: item.name,
      degree: item.degree,
      description: item.description,
      created_at: new Date().toISOString(),
    });
    branchesCount++;
  }

  // 2. PostgreSQL DB Seeding
  try {
    for (const item of CANONICAL_ACADEMIC_BRANCHES) {
      const res = await query<{ id: string }>(
        `INSERT INTO academic_branches (code, name, degree, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           degree = EXCLUDED.degree,
           description = EXCLUDED.description
         RETURNING id`,
        [item.code, item.name, item.degree, item.description]
      );
      if (res.rows.length > 0) {
        const branchId = res.rows[0].id;
        memoryStore.academic_branches.set(branchId, {
          id: branchId,
          code: item.code,
          name: item.name,
          degree: item.degree,
          description: item.description,
        });
      }
    }

    // Link Branch -> Domain Relevances in DB
    for (const rel of BRANCH_DOMAIN_RELEVANCE_MAP) {
      const branchRes = await query<{ id: string }>(`SELECT id FROM academic_branches WHERE code = $1`, [rel.branchCode]);
      const domainRes = await query<{ id: string }>(
        `SELECT id FROM domains WHERE LOWER(name) LIKE $1 OR LOWER(name) = $2 LIMIT 1`,
        [`%${rel.domainName.toLowerCase().slice(0, 15)}%`, rel.domainName.toLowerCase()]
      );

      if (branchRes.rows.length > 0 && domainRes.rows.length > 0) {
        await query(
          `INSERT INTO academic_branch_domains (academic_branch_id, domain_id, relevance)
           VALUES ($1, $2, $3)
           ON CONFLICT (academic_branch_id, domain_id)
           DO UPDATE SET relevance = EXCLUDED.relevance`,
          [branchRes.rows[0].id, domainRes.rows[0].id, rel.relevance]
        );
        linksCount++;
      }
    }
  } catch (err: any) {
    console.warn('PostgreSQL academic branch seed fallback (using in-memory):', err.message);
  }

  return { branchesCount, linksCount };
}

export async function getAllAcademicBranches(): Promise<AcademicBranchData[]> {
  try {
    const res = await query<AcademicBranchData>(
      `SELECT id, code, name, degree, description FROM academic_branches ORDER BY code ASC`
    );
    if (res.rows.length > 0) {
      return res.rows;
    }
  } catch {
    // Fallback
  }

  return Array.from(memoryStore.academic_branches.values());
}

export async function resolveBranchFromDegreeText(degreeText: string): Promise<AcademicBranchData | null> {
  if (!degreeText) return null;

  const text = degreeText.toUpperCase();
  const branches = await getAllAcademicBranches();

  // Explicit mappings
  if (text.includes('CSE') || text.includes('COMPUTER SCIENCE')) {
    return branches.find(b => b.code === 'CSE') || null;
  }
  if (text.includes('INFORMATION TECH') || text.includes(' IT') || text === 'IT') {
    return branches.find(b => b.code === 'IT') || null;
  }
  if (text.includes('ECE') || text.includes('ELECTRONICS & COMM') || text.includes('ELECTRONICS AND COMM')) {
    return branches.find(b => b.code === 'ECE') || null;
  }
  if (text.includes('EEE') || text.includes('ELECTRICAL & ELECT') || text.includes('ELECTRICAL AND ELECT')) {
    return branches.find(b => b.code === 'EEE') || null;
  }
  if (text.includes('MECH') || text.includes('MECHANICAL')) {
    return branches.find(b => b.code === 'MECH') || null;
  }
  if (text.includes('CIVIL')) {
    return branches.find(b => b.code === 'CIVIL') || null;
  }
  if (text.includes('BIOTECH') || text.includes('BIO-TECH')) {
    return branches.find(b => b.code === 'BIOTECH') || null;
  }
  if (text.includes('MCA')) {
    return branches.find(b => b.code === 'MCA') || null;
  }
  if (text.includes('BCA')) {
    return branches.find(b => b.code === 'BCA') || null;
  }
  if (text.includes('MBA')) {
    return branches.find(b => b.code === 'MBA') || null;
  }
  if (text.includes('BBA')) {
    return branches.find(b => b.code === 'BBA') || null;
  }

  return null;
}

export async function migrateExistingStudentProfiles(): Promise<number> {
  let migratedCount = 0;

  try {
    const unlinked = await query<{ id: string; degree: string }>(
      `SELECT id, degree FROM student_profiles WHERE academic_branch_id IS NULL AND degree IS NOT NULL`
    );

    for (const student of unlinked.rows) {
      const matched = await resolveBranchFromDegreeText(student.degree);
      if (matched) {
        await query(
          `UPDATE student_profiles SET academic_branch_id = $1 WHERE id = $2`,
          [matched.id, student.id]
        );
        migratedCount++;
      }
    }
  } catch (err: any) {
    console.warn('Student profile branch migration fallback:', err.message);
  }

  return migratedCount;
}

export async function getPersonalizedDomainsForStudent(studentIdOrUserId: string): Promise<any[]> {
  try {
    // 1. Get student profile & academic branch
    const profileRes = await query<{ id: string; academic_branch_id: string }>(
      `SELECT id, academic_branch_id FROM student_profiles WHERE id::text = $1 OR user_id::text = $1 LIMIT 1`,
      [studentIdOrUserId]
    );

    let branchId = profileRes.rows[0]?.academic_branch_id;

    // 2. Fetch all domains with branch relevance
    let domainsQuery = `
      SELECT
        d.id,
        d.name,
        d.description,
        d.demand_level,
        COALESCE(abd.relevance, 'MEDIUM') as academic_relevance
      FROM domains d
      LEFT JOIN academic_branch_domains abd
        ON abd.domain_id = d.id AND abd.academic_branch_id = $1
      ORDER BY
        CASE COALESCE(abd.relevance, 'MEDIUM')
          WHEN 'HIGH' THEN 1
          WHEN 'MEDIUM' THEN 2
          WHEN 'LOW' THEN 3
          ELSE 4
        END,
        d.name ASC
    `;

    const res = await query<any>(domainsQuery, [branchId || null]);
    if (res.rows.length > 0) {
      return res.rows;
    }
  } catch {
    // Fallback
  }

  // In-memory fallback domains
  return [
    { id: 'domain-backend', name: 'Backend & Distributed Systems', description: 'Designing, developing and deploying server-side applications and APIs.', demand_level: 'HIGH', academic_relevance: 'HIGH' },
    { id: 'domain-ml', name: 'Artificial Intelligence & Machine Learning', description: 'Building, training and deploying machine learning systems.', demand_level: 'HIGH', academic_relevance: 'HIGH' },
    { id: 'domain-cloud', name: 'Cloud Native & DevOps Engineering', description: 'Deploying containerized workloads, CI/CD pipelines, and managing cloud infrastructure.', demand_level: 'CRITICAL', academic_relevance: 'HIGH' },
    { id: 'domain-data', name: 'Data Science & Big Data Engineering', description: 'Extracting business intelligence, automated ETL pipelines, and data analytics.', demand_level: 'HIGH', academic_relevance: 'HIGH' },
    { id: 'domain-fullstack', name: 'Full-Stack Web Architecture', description: 'Building rich frontend interfaces and connecting them to distributed backend APIs.', demand_level: 'HIGH', academic_relevance: 'HIGH' },
    { id: 'domain-security', name: 'Cybersecurity & Defensive Systems', description: 'Analyzing vulnerabilities, zero-trust authentication, and hardening enterprise systems.', demand_level: 'CRITICAL', academic_relevance: 'MEDIUM' },
  ];
}
