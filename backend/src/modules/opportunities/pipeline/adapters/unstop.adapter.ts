import { BaseAdapter } from './base.adapter';
import { RawOpportunityItem, OpportunitySource } from '../types';
import fs from 'fs';
import path from 'path';

export class UnstopAdapter extends BaseAdapter {
  readonly source: OpportunitySource = 'UNSTOP';

  async fetchRawData(): Promise<RawOpportunityItem[]> {
    try {
      const seedPath = path.resolve(__dirname, '../../../../../data/seed_opportunities.json');
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed
          .filter((item: any) => (item.source || '').toUpperCase() === 'UNSTOP')
          .map((item: any) => ({
            source: 'UNSTOP',
            externalId: item.external_id || `unstop-${Math.random().toString(36).slice(2, 8)}`,
            originalUrl: item.original_url || 'https://unstop.com',
            title: item.title || 'National Hackathon',
            organization: item.organization || 'Unstop Partner',
            typeRaw: item.type || 'HACKATHON',
            modeRaw: item.mode || 'REMOTE',
            locationRaw: item.location || 'Online',
            deadlineRaw: item.deadline || '2026-11-15',
            stipendRaw: item.stipend || 'Prizes worth ₹1,00,000',
            descriptionRaw: item.description_raw || item.description || '',
            eligibilityRaw: item.eligibility_raw || 'Open for all college students',
            rawSkills: Array.isArray(item.required_skills)
              ? item.required_skills.map((s: any) => s.raw_mention || s.skill_id || s)
              : [],
          }));
      }
    } catch (err: any) {
      console.warn('⚠️ [UnstopAdapter] Fallback to deterministic fixture due to read error:', err.message);
    }

    // Default deterministic fallback fixture
    return [
      {
        source: 'UNSTOP',
        externalId: 'unstop-hack-001',
        originalUrl: 'https://unstop.com/hackathons/full-stack-ai-challenge',
        title: 'Full-Stack AI Innovation Hackathon',
        organization: 'Google Developer Student Clubs',
        typeRaw: 'Hackathon',
        modeRaw: 'Remote',
        locationRaw: 'Online',
        deadlineRaw: '2026-11-20',
        stipendRaw: '₹2,50,000 Cash Prize Pool',
        descriptionRaw: 'Build next-gen generative AI and full-stack web applications to solve real-world sustainability and career challenges.',
        eligibilityRaw: 'Students enrolled in engineering, diploma, or degree courses',
        rawSkills: ['React.js', 'Node.js', 'Python', 'Vector DB', 'TypeScript'],
      },
    ];
  }
}
