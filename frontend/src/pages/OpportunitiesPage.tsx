import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { OpportunityTabs, OpportunityCategory } from '../features/opportunities/OpportunityTabs';
import { OpportunityCard } from '../features/opportunities/OpportunityCard';
import { MatchExplanationModal } from '../features/opportunities/MatchExplanationModal';
import { Opportunity } from '../features/opportunities/types';
import { FadeIn } from '../components/animations/FadeIn';
import { opportunitiesApi, recommendationsApi } from '../services/api';

function mapScoredOpportunity(item: any): Opportunity {
  const scores = item.scores || {};
  const scoreVal = typeof item.scores?.total === 'number'
    ? item.scores.total
    : (typeof item.compatibilityScore === 'number' ? item.compatibilityScore : 0);

  const rawExpl = item.explanation || {};
  return {
    id: item.id || `opp-${Math.random().toString(36).slice(2, 7)}`,
    title: item.title || 'Career Opportunity',
    organization: item.organization || 'Vidyut Partner',
    compatibility_score: scoreVal,
    source: (item.source || 'DIRECT').toUpperCase(),
    original_url: item.originalUrl || item.original_url || '',
    is_active: item.is_active !== undefined ? item.is_active : (item.isActive !== undefined ? item.isActive : true),
    type: item.type,
    mode: item.mode,
    location: item.location,
    deadline: item.deadline,
    stipend: item.stipend,
    scores: {
      total: scoreVal,
      skillMatch: scores.skillMatch ?? scoreVal,
      careerAlignment: scores.careerAlignment ?? scoreVal,
      eligibility: scores.eligibility ?? scoreVal,
      interest: scores.interest ?? scoreVal,
    },
    explanation: {
      summary: rawExpl.summary || `Calculated match based on verified skill proficiencies and domain alignment.`,
      matching_skills: rawExpl.matchingSkills || rawExpl.matching_skills || [],
      gap_skills: rawExpl.gapSkills || rawExpl.gap_skills || [],
      gap_severity: rawExpl.gapSeverity || rawExpl.gap_severity,
      career_alignment: rawExpl.careerAlignment || rawExpl.career_alignment,
      eligibility_status: rawExpl.eligibilityStatus || rawExpl.eligibility_status,
    },
  };
}

const EMPTY_CATEGORIZED_OPPS = {
  READY_NOW: [] as Opportunity[],
  ALMOST_READY: [] as Opportunity[],
  ASPIRATIONAL: [] as Opportunity[],
};

export const OpportunitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<OpportunityCategory>('READY_NOW');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [categorizedOpps, setCategorizedOpps] = useState(EMPTY_CATEGORIZED_OPPS);
  const [loading, setLoading] = useState(false);
  const [isAiPowered, setIsAiPowered] = useState(false);

  const loadOpportunities = async (refresh = false) => {
    setLoading(true);
    try {
      // 1. Primary: Role 5 Compatibility & AI Recommendation Engine
      const recRes = await recommendationsApi.getOpportunities({ refresh });
      if (recRes.success && recRes.data) {
        const { readyNow = [], almostReady = [], aspirational = [] } = recRes.data;

        const mappedReady = readyNow.map(mapScoredOpportunity);
        const mappedAlmost = almostReady.map(mapScoredOpportunity);
        const mappedAspirational = aspirational.map(mapScoredOpportunity);

        setCategorizedOpps({
          READY_NOW: mappedReady,
          ALMOST_READY: mappedAlmost,
          ASPIRATIONAL: mappedAspirational,
        });
        setIsAiPowered(true);

        // Auto-focus on best available segment
        if (mappedReady.length > 0) {
          setActiveTab('READY_NOW');
        } else if (mappedAlmost.length > 0) {
          setActiveTab('ALMOST_READY');
        } else if (mappedAspirational.length > 0) {
          setActiveTab('ASPIRATIONAL');
        }
        return;
      }

      // 2. Fallback: Direct Opportunities endpoint
      const res = await opportunitiesApi.getOpportunities({ limit: 20 });
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : res.data.items || [];
        if (items.length > 0) {
          const ready: Opportunity[] = [];
          const almost: Opportunity[] = [];
          const aspirational: Opportunity[] = [];

          items.forEach((item: any) => {
            const oppObj = mapScoredOpportunity(item);
            if (oppObj.compatibility_score >= 0.75) {
              ready.push(oppObj);
            } else if (oppObj.compatibility_score >= 0.50) {
              almost.push(oppObj);
            } else {
              aspirational.push(oppObj);
            }
          });

          setCategorizedOpps({
            READY_NOW: ready,
            ALMOST_READY: almost,
            ASPIRATIONAL: aspirational,
          });
          if (ready.length > 0) setActiveTab('READY_NOW');
          else if (almost.length > 0) setActiveTab('ALMOST_READY');
          else if (aspirational.length > 0) setActiveTab('ASPIRATIONAL');
        }
      }
    } catch (err) {
      console.warn('Opportunities load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities(false);
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
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider mb-2 border border-green-200">
              {isAiPowered ? '✨ Role 5 AI Compatibility Engine Active' : 'Live Verified Opportunity Pipeline'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('opportunities.title')}</h1>
            <p className="text-gray-500 mt-1">{t('opportunities.subtitle')}</p>
          </div>

          <button
            onClick={() => loadOpportunities(true)}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span className={loading ? 'animate-spin' : ''}>⚡</span>
            {loading ? 'Re-scoring...' : 'Recalculate Matches'}
          </button>
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
