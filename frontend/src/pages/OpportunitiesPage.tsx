import React, { useState } from 'react';
import { OpportunityTabs, OpportunityCategory } from '../features/opportunities/OpportunityTabs';
import { OpportunityCard } from '../features/opportunities/OpportunityCard';
import { MatchExplanationModal } from '../features/opportunities/MatchExplanationModal';
import { Opportunity } from '../features/opportunities/types';

const MOCK_DATA = {
  READY_NOW: [
    {
      id: "opp-1",
      title: "AI for Good Hackathon",
      organization: "Unstop x NASSCOM",
      compatibility_score: 0.78,
      source: "UNSTOP",
      original_url: "https://unstop.com/",
      explanation: {
        summary: "Strong match — your Python and ML fundamentals align well.",
        matching_skills: ["Python", "ML Fundamentals"],
        gap_skills: []
      }
    }
  ] as Opportunity[],
  ALMOST_READY: [
    {
      id: "opp-2",
      title: "Junior ML Engineer Intern",
      organization: "Bangalore Analytics Co.",
      compatibility_score: 0.61,
      explanation: {
        summary: "Close match. Strengthen pandas and scikit-learn to qualify.",
        matching_skills: ["Python"],
        gap_skills: ["pandas", "SQL"]
      }
    }
  ] as Opportunity[],
  ASPIRATIONAL: [] as Opportunity[]
};

export const OpportunitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OpportunityCategory>('READY_NOW');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  
  const currentOpps = MOCK_DATA[activeTab];
  
  const counts = {
    READY_NOW: MOCK_DATA.READY_NOW.length,
    ALMOST_READY: MOCK_DATA.ALMOST_READY.length,
    ASPIRATIONAL: MOCK_DATA.ASPIRATIONAL.length
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Opportunity Hub</h1>
        <p className="text-gray-500 mt-2">Curated roles and events matched dynamically to your verified skill graph.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <OpportunityTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={counts}
        />
        
        {currentOpps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOpps.map(opp => (
              <OpportunityCard 
                key={opp.id} 
                opportunity={opp} 
                onViewExplanation={setSelectedOpp} 
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 font-medium">No opportunities in this tier yet.</p>
            <p className="text-sm text-gray-400 mt-2">Complete more milestones on your roadmap to unlock matches here.</p>
          </div>
        )}
      </div>

      <MatchExplanationModal 
        isOpen={!!selectedOpp} 
        opportunity={selectedOpp} 
        onClose={() => setSelectedOpp(null)} 
      />
    </div>
  );
};
