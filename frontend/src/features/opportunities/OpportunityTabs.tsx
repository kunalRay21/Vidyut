import React from 'react';

export type OpportunityCategory = 'READY_NOW' | 'ALMOST_READY' | 'ASPIRATIONAL';

interface OpportunityTabsProps {
  activeTab: OpportunityCategory;
  onTabChange: (tab: OpportunityCategory) => void;
  counts: {
    READY_NOW: number;
    ALMOST_READY: number;
    ASPIRATIONAL: number;
  };
}

export const OpportunityTabs: React.FC<OpportunityTabsProps> = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    { id: 'READY_NOW' as const, label: 'Ready Now', count: counts.READY_NOW, color: 'text-green-700 bg-green-100 border-green-200' },
    { id: 'ALMOST_READY' as const, label: 'Almost Ready', count: counts.ALMOST_READY, color: 'text-amber-700 bg-amber-100 border-amber-200' },
    { id: 'ASPIRATIONAL' as const, label: 'Aspirational', count: counts.ASPIRATIONAL, color: 'text-purple-700 bg-purple-100 border-purple-200' },
  ];

  return (
    <div className="flex space-x-2 border-b border-gray-200 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {tab.label}
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${tab.color}`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};
