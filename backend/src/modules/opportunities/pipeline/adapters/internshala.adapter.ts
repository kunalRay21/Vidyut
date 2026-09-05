import { BaseAdapter } from './base.adapter';
import { RawOpportunityItem, OpportunitySource } from '../types';
import fs from 'fs';
import path from 'path';

export class InternshalaAdapter extends BaseAdapter {
  readonly source: OpportunitySource = 'INTERNSHALA';

  async fetchRawData(): Promise<RawOpportunityItem[]> {
    try {
      const seedPath = path.resolve(__dirname, '../../../../../data/seed_opportunities.json');
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed
          .filter((item: any) => (item.source || '').toUpperCase() === 'INTERNSHALA')
          .map((item: any) => ({
            source: 'INTERNSHALA',
            externalId: item.external_id || `ish-${Math.random().toString(36).slice(2, 8)}`,
            originalUrl: item.original_url || 'https://internshala.com',
            title: item.title || 'Software Engineering Intern',
            organization: item.organization || 'Tech Company',
            typeRaw: item.type || 'INTERNSHIP',
            modeRaw: item.mode || 'HYBRID',
            locationRaw: item.location || 'Bengaluru, Karnataka',
            deadlineRaw: item.deadline || '2026-10-30',
            stipendRaw: item.stipend || '₹30,000 / month',
            descriptionRaw: item.description_raw || item.description || '',
            eligibilityRaw: item.eligibility_raw || 'B.Tech / BE in CS or allied fields',
            rawSkills: Array.isArray(item.required_skills)
              ? item.required_skills.map((s: any) => s.raw_mention || s.skill_id || s)
              : [],
          }));
      }
    } catch (err: any) {
      console.warn('⚠️ [InternshalaAdapter] Fallback to deterministic fixture due to read error:', err.message);
    }

    // Default deterministic fallback fixture
    return [
      {
        source: 'INTERNSHALA',
        externalId: 'ish-be-001',
        originalUrl: 'https://internshala.com/internship/detail/backend-engineering-internship-at-razorpay',
        title: 'Backend Engineering Intern',
        organization: 'Razorpay',
        typeRaw: 'Internship',
        modeRaw: 'Hybrid',
        locationRaw: 'Bengaluru, Karnataka',
        deadlineRaw: '2026-10-15',
        stipendRaw: '₹35,000 / month',
        descriptionRaw: 'Work directly with the Core Payments team to design high-throughput microservices using FastAPI, Redis caching, and PostgreSQL databases.',
        eligibilityRaw: 'Pursuing B.Tech/B.E. in CS/IT',
        rawSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
      },
    ];
  }
}
