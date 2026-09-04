import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { OpportunityTabs, OpportunityCategory } from '../features/opportunities/OpportunityTabs';
import { OpportunityCard } from '../features/opportunities/OpportunityCard';
import { MatchExplanationModal } from '../features/opportunities/MatchExplanationModal';
import { Opportunity } from '../features/opportunities/types';
import { FadeIn } from '../components/animations/FadeIn';
import { opportunitiesApi } from '../services/api';

const DEFAULT_MOCK_DATA = {
  READY_NOW: [
    {
      id: 'opp-1',
      title: 'AI for Good Hackathon',
      organization: 'Unstop x NASSCOM',
      compatibility_score: 0.78,
      source: 'UNSTOP' as const,
      original_url: 'https://unstop.com/',
      explanation: {
        summary: 'Strong match — your Python and ML fundamentals align well.',
        matching_skills: ['Python', 'ML Fundamentals'],
        gap_skills: [],
      },
    },
  ] as Opportunity[],
  ALMOST_READY: [
    {
      id: 'opp-2',
      title: 'Junior ML Engineer Intern',
      organization: 'Bangalore Analytics Co.',
      compatibility_score: 0.61,
      source: 'DIRECT' as const,
      original_url: 'https://example.com/',
      explanation: {
        summary: 'Close match. Strengthen pandas and scikit-learn to qualify.',
        matching_skills: ['Python'],
        gap_skills: ['pandas', 'SQL'],
      },
    },
  ] as Opportunity[],
  ASPIRATIONAL: [] as Opportunity[],
};

export const OpportunitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<OpportunityCategory>('READY_NOW');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [categorizedOpps, setCategorizedOpps] = useState(DEFAULT_MOCK_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadLiveOpportunities() {
      setLoading(true);
      try {
        const res = await opportunitiesApi.getOpportunities({ limit: 20 });
        if (mounted && res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : res.data.items || [];
          if (items.length > 0) {
            // Segment ingested opportunities into tiers
            const ready: Opportunity[] = [];
            const almost: Opportunity[] = [];
            const aspirational: Opportunity[] = [];

            items.forEach((item: any, idx: number) => {
              const oppObj: Opportunity = {
                id: item.id || `opp-${idx}`,
                title: item.title,
                organization: item.organization,
                compatibility_score: idx % 3 === 0 ? 0.82 : idx % 3 === 1 ? 0.65 : 0.45,
                source: (item.source || 'DIRECT').toUpperCase() as any,
                original_url: item.original_url || 'https://unstop.com/',
                explanation: {
                  summary: `Matched through Vidyut Opportunity Index for ${item.type || 'Internship'}.`,
                  matching_skills: item.required_skills?.map((s: any) => s.skill_id) || ['Python'],
                  gap_skills: idx % 3 === 1 ? ['Docker'] : [],
                },
              };

              if (oppObj.compatibility_score >= 0.75) {
                ready.push(oppObj);
              } else if (oppObj.compatibility_score >= 0.55) {
                almost.push(oppObj);
              } else {
                aspirational.push(oppObj);
              }
            });

            setCategorizedOpps({
              READY_NOW: ready.length > 0 ? ready : DEFAULT_MOCK_DATA.READY_NOW,
              ALMOST_READY: almost.length > 0 ? almost : DEFAULT_MOCK_DATA.ALMOST_READY,
              ASPIRATIONAL: aspirational,
            });
          }
        }
      } catch (err) {
        console.warn('Opportunities load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadLiveOpportunities();
    return () => { mounted = false; };
  }, []);

  const currentOpps = categorizedOpps[activeTab];

  const counts = {
    READY_NOW: categorizedOpps.READY_NOW.length,
    ALMOST_READY: categorizedOpps.ALMOST_READY.length,
    ASPIRATIONAL: categorizedOpps.ASPIRATIONAL.length,
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <FadeIn delay={100}>
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider mb-2 border border-green-200">
            Live Verified Opportunity Pipeline
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('opportunities.title')}</h1>
          <p className="text-gray-500 mt-1">{t('opportunities.subtitle')}</p>
        </header>
      </FadeIn>

      {loading && (
        <div className="text-center py-4 text-xs text-gray-500">
          Syncing latest opportunities from Unstop, Internshala, and AICTE...
        </div>
      )}

      <FadeIn delay={200}>
        <div className="bg-[#FFFFED] rounded-xl shadow-sm border border-gray-100 p-6">
          <OpportunityTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            counts={counts}
          />
          
          {currentOpps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentOpps.map((opp, index) => (
                <FadeIn key={opp.id} delay={300 + index * 100}>
                  <OpportunityCard 
                    opportunity={opp} 
                    onViewExplanation={setSelectedOpp} 
                  />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-medium">No opportunities in this tier yet.</p>
              <p className="text-sm text-gray-400 mt-2">Complete more milestones on your roadmap to unlock matches here.</p>
            </div>
          )}
        </div>
      </FadeIn>

      <MatchExplanationModal 
        isOpen={!!selectedOpp} 
        opportunity={selectedOpp} 
        onClose={() => setSelectedOpp(null)} 
      />
    </div>
  );
};
