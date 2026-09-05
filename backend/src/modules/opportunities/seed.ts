import fs from 'fs';
import path from 'path';
import { query } from '../../database/db';
import { seedResources } from '../recommendation/seedResources';

export async function seedOpportunities() {
  const seedPath = path.resolve(__dirname, '../../../data/seed_opportunities.json');
  if (!fs.existsSync(seedPath)) {
    console.warn('⚠️ seed_opportunities.json not found');
    return;
  }
  const raw = fs.readFileSync(seedPath, 'utf8');
  const items = JSON.parse(raw);

  // 1. Fetch domain and role IDs
  const backendRoleRes = await query<{ id: string; domain_id: string }>(
    `SELECT id, domain_id FROM roles WHERE name = 'Backend Developer' LIMIT 1`
  );
  const mlRoleRes = await query<{ id: string; domain_id: string }>(
    `SELECT id, domain_id FROM roles WHERE name = 'Machine Learning Engineer' LIMIT 1`
  );

  const backendRoleId = backendRoleRes.rows[0]?.id;
  const backendDomainId = backendRoleRes.rows[0]?.domain_id;
  const mlRoleId = mlRoleRes.rows[0]?.id;
  const mlDomainId = mlRoleRes.rows[0]?.domain_id;

  // 2. Ensure any missing skills from opportunities exist in `skills`
  const backendMissingSkills: Array<[string, string, string]> = [
    ['Redis', 'In-memory caching, pub/sub, and data structures.', 'DATABASE'],
    ['PostgreSQL', 'Relational database administration, queries, and optimization.', 'DATABASE'],
    ['MySQL', 'Relational database management and indexing.', 'DATABASE'],
    ['Go', 'Go programming language for high concurrency backend services.', 'PROGRAMMING'],
    ['Java', 'Core Java programming and enterprise architecture.', 'PROGRAMMING'],
    ['Spring Boot', 'Enterprise Java framework for production microservices.', 'FRAMEWORK'],
    ['Node.js', 'Event-driven server-side JavaScript runtime.', 'FRAMEWORK'],
    ['TypeScript', 'Typed superset of JavaScript for scalable applications.', 'PROGRAMMING'],
    ['Linux', 'Linux shell, permissions, system calls, and administration.', 'DEVOPS'],
    ['Kubernetes', 'Container orchestration, deployments, and cluster management.', 'DEVOPS'],
    ['Kafka', 'Distributed event streaming platform for high-throughput messaging.', 'ARCHITECTURE'],
    ['gRPC', 'High-performance RPC framework using Protocol Buffers.', 'WEB'],
    ['System Design', 'Scalability, availability, caching, and distributed architecture.', 'ARCHITECTURE'],
  ];

  const mlMissingSkills: Array<[string, string, string]> = [
    ['NLP', 'Natural Language Processing and text transformers.', 'MACHINE_LEARNING'],
    ['Computer Vision', 'Image processing, segmentation, and feature extraction.', 'MACHINE_LEARNING'],
    ['OpenCV', 'Open Source Computer Vision Library for image and video processing.', 'MACHINE_LEARNING'],
    ['Scikit-Learn', 'Classical machine learning algorithms and data pipelining.', 'MACHINE_LEARNING'],
    ['Vector DB', 'Vector embeddings, nearest-neighbor search, and RAG architectures.', 'DATABASE'],
  ];

  if (backendRoleId) {
    for (const [name, desc, cat] of backendMissingSkills) {
      await query(
        `
        INSERT INTO skills (role_id, name, description, category)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (role_id, name) DO NOTHING
        `,
        [backendRoleId, name, desc, cat]
      );
    }
  }

  if (mlRoleId) {
    for (const [name, desc, cat] of mlMissingSkills) {
      await query(
        `
        INSERT INTO skills (role_id, name, description, category)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (role_id, name) DO NOTHING
        `,
        [mlRoleId, name, desc, cat]
      );
    }
  }

  // 3. Build a lookup map of all skills (case-insensitive name -> UUID)
  const skillsRes = await query<{ id: string; name: string }>(`SELECT id, name FROM skills`);
  const skillNameToId = new Map<string, string>();
  for (const s of skillsRes.rows) {
    skillNameToId.set(s.name.toLowerCase(), s.id);
  }

  // Skill aliases
  const skillAliases: Record<string, string> = {
    'rest apis': 'rest api',
    'git': 'git & github',
    'postgresql': 'postgresql',
  };

  console.log(`🌱 Seeding ${items.length} opportunities into PostgreSQL...`);

  let inserted = 0;
  for (const item of items) {
    const fingerprint = item.external_id || `${item.title}_${item.organization}`.toLowerCase().replace(/\s+/g, '-');

    // Determine domain
    const isML =
      /machine learning|ml |deep learning|ai|nlp|vision|data science|pytorch|tensorflow/i.test(item.title) ||
      /machine learning|ml |deep learning|ai|nlp|vision|data science|pytorch|tensorflow/i.test(item.description_raw || '');
    const domainId = isML ? mlDomainId : backendDomainId;

    const oppRes = await query<{ id: string }>(
      `
      INSERT INTO opportunities 
        (external_id, source, original_url, title, organization, type, mode, location, deadline, stipend, description_raw, eligibility_raw, domain_id, fingerprint, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (fingerprint) DO UPDATE SET
        title = EXCLUDED.title,
        original_url = EXCLUDED.original_url,
        is_active = EXCLUDED.is_active,
        domain_id = EXCLUDED.domain_id,
        last_seen_at = NOW()
      RETURNING id
      `,
      [
        item.external_id || null,
        item.source || 'DIRECT',
        item.original_url || '',
        item.title,
        item.organization,
        item.type || 'INTERNSHIP',
        item.mode || 'REMOTE',
        item.location || 'India',
        item.deadline || '2026-10-30',
        item.stipend || 'Competitive',
        item.description_raw || item.description || '',
        item.eligibility_raw || '',
        domainId || null,
        fingerprint,
        item.is_active !== undefined ? item.is_active : true,
      ]
    );

    const oppId = oppRes.rows[0]?.id;
    if (oppId && Array.isArray(item.required_skills)) {
      // Clear old tags for this opportunity to avoid duplicates
      await query(`DELETE FROM opportunity_skill_tags WHERE opportunity_id = $1`, [oppId]);

      for (const skill of item.required_skills) {
        const rawName = (skill.raw_mention || skill.skill_id || '').toLowerCase().replace(/^skill-/, '');
        const mappedName = skillAliases[rawName] || rawName;
        const resolvedSkillId = skillNameToId.get(mappedName) || skillNameToId.get(rawName);

        if (resolvedSkillId) {
          await query(
            `
            INSERT INTO opportunity_skill_tags
              (opportunity_id, skill_id, min_proficiency, weight)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            `,
            [
              oppId,
              resolvedSkillId,
              skill.min_proficiency || 'BEGINNER',
              skill.weight || 1.0,
            ]
          );
        }
      }
    }
    inserted++;
  }
  console.log(`✅ ${inserted} opportunities seeded with valid skill tag UUIDs!`);

  // 4. Seed Learning Resources
  await seedResources();

  // 5. Ensure existing student profiles have skill states seeded for live compatibility scoring
  const students = await query<{ id: string }>(
    `SELECT sp.id FROM student_profiles sp LIMIT 10`
  );

  for (const studentRow of students.rows) {
    const studentId = studentRow.id;
    const initialSkills = [
      { name: 'Python', level: 'PROFICIENT' },
      { name: 'FastAPI', level: 'INTERMEDIATE' },
      { name: 'SQL', level: 'INTERMEDIATE' },
      { name: 'Docker', level: 'BEGINNER' },
      { name: 'Git & GitHub', level: 'PROFICIENT' },
      { name: 'HTTP', level: 'PROFICIENT' },
      { name: 'REST API', level: 'PROFICIENT' },
      { name: 'Programming Fundamentals', level: 'EXPERT' },
    ];

    for (const item of initialSkills) {
      const skillId = skillNameToId.get(item.name.toLowerCase());
      if (skillId) {
        await query(
          `
          INSERT INTO student_skill_states (student_id, skill_id, assessed_level, accuracy, target_level)
          VALUES ($1, $2, $3, 0.85, 'PROFICIENT')
          ON CONFLICT (student_id, skill_id) DO UPDATE SET
            assessed_level = EXCLUDED.assessed_level,
            accuracy = EXCLUDED.accuracy,
            updated_at = NOW()
          `,
          [studentId, skillId, item.level]
        );
      }
    }
    console.log(`✅ Initial skill proficiencies seeded for student (${studentId})!`);
  }
}

if (require.main === module) {
  seedOpportunities()
    .then(() => {
      console.log('Opportunities & Resources seeding complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Opportunities seed failed:', err);
      process.exit(1);
    });
}
