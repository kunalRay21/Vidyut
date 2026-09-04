import fs from 'fs';
import path from 'path';
import { query } from '../../database/db';

export async function seedOpportunities() {
  const seedPath = path.resolve(__dirname, '../../../data/seed_opportunities.json');
  if (!fs.existsSync(seedPath)) {
    console.warn('⚠️ seed_opportunities.json not found');
    return;
  }
  const raw = fs.readFileSync(seedPath, 'utf8');
  const items = JSON.parse(raw);
  console.log(`🌱 Seeding ${items.length} opportunities into PostgreSQL...`);

  let inserted = 0;
  for (const item of items) {
    const fingerprint = item.external_id || `${item.title}_${item.organization}`.toLowerCase().replace(/\s+/g, '-');
    const oppRes = await query<{ id: string }>(
      `
      INSERT INTO opportunities 
        (external_id, source, original_url, title, organization, type, mode, location, deadline, stipend, description_raw, eligibility_raw, fingerprint, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (fingerprint) DO UPDATE SET
        title = EXCLUDED.title,
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
        fingerprint,
        item.is_active !== undefined ? item.is_active : true,
      ]
    );

    const oppId = oppRes.rows[0]?.id;
    if (oppId && Array.isArray(item.required_skills)) {
      for (const skill of item.required_skills) {
        await query(
          `
          INSERT INTO opportunity_skill_tags
            (opportunity_id, skill_id, min_proficiency, weight)
          VALUES ($1, $2, $3, $4)
          `,
          [
            oppId,
            skill.skill_id,
            skill.min_proficiency || 'BEGINNER',
            skill.weight || 1.0,
          ]
        );
      }
    }
    inserted++;
  }
  console.log(`✅ ${inserted} opportunities seeded into PostgreSQL!`);
}

if (require.main === module) {
  seedOpportunities()
    .then(() => {
      console.log('Opportunities seeding complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Opportunities seed failed:', err);
      process.exit(1);
    });
}
