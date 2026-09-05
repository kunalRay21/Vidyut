import { BaseAdapter } from './base.adapter';
import { RawOpportunityItem, OpportunitySource } from '../types';
import fs from 'fs';
import path from 'path';

export class AicteAdapter extends BaseAdapter {
  readonly source: OpportunitySource = 'AICTE';

  async fetchRawData(): Promise<RawOpportunityItem[]> {
    try {
      const seedPath = path.resolve(__dirname, '../../../../../data/seed_opportunities.json');
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed
          .filter((item: any) => (item.source || '').toUpperCase() === 'AICTE')
          .map((item: any) => ({
            source: 'AICTE',
            externalId: item.external_id || `aicte-${Math.random().toString(36).slice(2, 8)}`,
            originalUrl: item.original_url || 'https://internship.aicte-india.org',
            title: item.title || 'AICTE Technical Internship',
            organization: item.organization || 'AICTE Government Partner',
            typeRaw: item.type || 'INTERNSHIP',
            modeRaw: item.mode || 'ON_SITE',
            locationRaw: item.location || 'New Delhi',
            deadlineRaw: item.deadline || '2026-10-31',
            stipendRaw: item.stipend || '₹20,000 / month',
            descriptionRaw: item.description_raw || item.description || '',
            eligibilityRaw: item.eligibility_raw || 'AICTE Approved Engineering Students',
            rawSkills: Array.isArray(item.required_skills)
              ? item.required_skills.map((s: any) => s.raw_mention || s.skill_id || s)
              : [],
          }));
      }
    } catch (err: any) {
      console.warn('⚠️ [AicteAdapter] Fallback to deterministic fixture due to read error:', err.message);
    }

    // Default deterministic fallback fixture
    return [
      {
        source: 'AICTE',
        externalId: 'aicte-gov-001',
        originalUrl: 'https://internship.aicte-india.org/internship-details.php?id=aicte-gov-001',
        title: 'Smart City Cloud Infrastructure Internship',
        organization: 'Ministry of Housing and Urban Affairs (MoHUA)',
        typeRaw: 'Internship',
        modeRaw: 'On-site',
        locationRaw: 'New Delhi',
        deadlineRaw: '2026-11-10',
        stipendRaw: '₹20,000 / month',
        descriptionRaw: 'Deploy scalable cloud infrastructure and Kubernetes nodes for municipal data processing and Smart Cities Mission analytics.',
        eligibilityRaw: 'B.E./B.Tech pre-final and final year students from AICTE accredited institutions',
        rawSkills: ['Linux', 'Kubernetes', 'Docker', 'System Design'],
      },
    ];
  }
}
