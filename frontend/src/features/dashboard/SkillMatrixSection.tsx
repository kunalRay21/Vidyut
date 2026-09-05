import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  PlayCircle,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  TrendingUp,
  FileText,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  progress: number; // 0 - 100
  currentLevel: 1 | 2 | 3 | 4; // 1: Foundation, 2: Developing, 3: Proficient, 4: Expert
  source: 'ASSESSMENT' | 'RESUME' | 'GAP' | 'BASELINE';
  evidence: string;
  lastEvaluated?: string;
}

interface SkillMatrixSectionProps {
  skills: SkillItem[];
  selectedRoleTitle?: string;
  onStartAssessment?: () => void;
}

// Level metadata definitions
export const LEVEL_CONFIG = {
  1: {
    label: 'Foundation',
    shortLabel: 'L1 Foundation',
    color: '#64748B', // Slate
    bgClass: 'bg-slate-100 text-slate-800 border-slate-300',
    barClass: 'bg-slate-500',
    badgeClass: 'bg-slate-50 text-slate-700 border border-slate-200',
    range: '0 - 44%',
    desc: 'Target gaps & fundamental concepts needing diagnostic evaluation.',
  },
  2: {
    label: 'Developing',
    shortLabel: 'L2 Developing',
    color: '#D97706', // Amber / Saffron
    bgClass: 'bg-amber-100 text-amber-900 border-amber-300',
    barClass: 'bg-saffron',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
    range: '45 - 69%',
    desc: 'Active working knowledge demonstrated in coursework & supporting tools.',
  },
  3: {
    label: 'Proficient',
    shortLabel: 'L3 Proficient',
    color: '#000080', // Ashoka Navy
    bgClass: 'bg-blue-100 text-blue-900 border-blue-300',
    barClass: 'bg-[#000080]',
    badgeClass: 'bg-blue-50 text-blue-800 border border-blue-200',
    range: '70 - 84%',
    desc: 'Production-ready capability verified through code tests or projects.',
  },
  4: {
    label: 'Expert',
    shortLabel: 'L4 Expert',
    color: '#059669', // Emerald
    bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    barClass: 'bg-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    range: '85 - 100%',
    desc: 'Demonstrated mastery across advanced problem execution and system architecture.',
  },
};

export const SkillMatrixSection: React.FC<SkillMatrixSectionProps> = ({
  skills,
  selectedRoleTitle = 'Backend & Distributed Systems',
  onStartAssessment,
}) => {
  const navigate = useNavigate();

  // View state: 'GRID' (Compact Cards), 'TABLE' (Registry Table)
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    skills.forEach((s) => set.add(s.category));
    return Array.from(set).sort();
  }, [skills]);

  // Counts by tier
  const tierCounts = useMemo(() => {
    return {
      expert: skills.filter((s) => s.currentLevel === 4).length,
      proficient: skills.filter((s) => s.currentLevel === 3).length,
      developing: skills.filter((s) => s.currentLevel === 2).length,
      foundation: skills.filter((s) => s.currentLevel === 1).length,
      gaps: skills.filter((s) => s.source === 'GAP').length,
    };
  }, [skills]);

  // Filter skills based on search, category, and tier
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // Category filter
      if (selectedCategory !== 'ALL' && skill.category !== selectedCategory) {
        return false;
      }
      // Tier filter
      if (selectedTier !== 'ALL' && skill.currentLevel !== selectedTier) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = skill.name.toLowerCase().includes(query);
        const matchesCategory = skill.category.toLowerCase().includes(query);
        const matchesEvidence = skill.evidence.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesEvidence) {
          return false;
        }
      }
      return true;
    });
  }, [skills, selectedCategory, selectedTier, searchQuery]);

  // Source Badge renderer
  const renderSourceBadge = (source: SkillItem['source'], compact = false) => {
    switch (source) {
      case 'ASSESSMENT':
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            }`}
            title="Empirically verified via diagnostic coding quiz"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Test Verified</span>
          </span>
        );
      case 'RESUME':
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-blue-50 text-[#000080] border border-blue-200/80 ${
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            }`}
            title="Corroborated by verified resume ingestion"
          >
            <FileText className="w-3 h-3 text-[#000080]" />
            <span>Resume Evidence</span>
          </span>
        );
      case 'GAP':
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-amber-50 text-amber-900 border border-amber-300/80 ${
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            }`}
            title="Priority target skill gap identified for role"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Target Role Gap</span>
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            }`}
          >
            <span>Academic Baseline</span>
          </span>
        );
    }
  };

  const handleTestSkill = () => {
    if (onStartAssessment) {
      onStartAssessment();
    } else {
      navigate('/assessment/quiz');
    }
  };

  return (
    <section className="space-y-5 bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-7 shadow-xs">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#000080]/10 text-[#000080] text-[11px] font-extrabold uppercase tracking-wider border border-[#000080]/20 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Competency Matrix
            </span>
            <span className="text-xs font-semibold text-gray-500">
              Target Role: <strong className="text-gray-800">{selectedRoleTitle}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-heading">
            Skill Calibration & Maturity Matrix ({skills.length} Evaluated)
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 max-w-3xl">
            Real-time multi-tier competency distribution combining diagnostic executions, resume evidence, and targeted curriculum gaps.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleTestSkill}
            className="btn-saffron py-2 px-3.5 text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Calibrate Skills</span>
          </button>
        </div>
      </div>

      {/* 2. Maturity Distribution Bar */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#000080]" />
            Maturity Tier Distribution:
          </span>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[11px] font-semibold">
            <button
              onClick={() => setSelectedTier(selectedTier === 4 ? 'ALL' : 4)}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                selectedTier === 4 ? 'text-emerald-800 font-extrabold' : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Expert ({tierCounts.expert})</span>
            </button>
            <button
              onClick={() => setSelectedTier(selectedTier === 3 ? 'ALL' : 3)}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                selectedTier === 3 ? 'text-[#000080] font-extrabold' : 'text-gray-600 hover:text-[#000080]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#000080] shrink-0" />
              <span>Proficient ({tierCounts.proficient})</span>
            </button>
            <button
              onClick={() => setSelectedTier(selectedTier === 2 ? 'ALL' : 2)}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                selectedTier === 2 ? 'text-amber-800 font-extrabold' : 'text-gray-600 hover:text-amber-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-saffron shrink-0" />
              <span>Developing ({tierCounts.developing})</span>
            </button>
            <button
              onClick={() => setSelectedTier(selectedTier === 1 ? 'ALL' : 1)}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                selectedTier === 1 ? 'text-slate-900 font-extrabold' : 'text-gray-600 hover:text-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span>Foundation / Gaps ({tierCounts.foundation})</span>
            </button>
          </div>
        </div>

        {/* Visual segmented bar */}
        {skills.length > 0 && (
          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
            {tierCounts.expert > 0 && (
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${(tierCounts.expert / skills.length) * 100}%` }}
                title={`Expert: ${tierCounts.expert} skills`}
              />
            )}
            {tierCounts.proficient > 0 && (
              <div
                className="h-full bg-[#000080] transition-all duration-500"
                style={{ width: `${(tierCounts.proficient / skills.length) * 100}%` }}
                title={`Proficient: ${tierCounts.proficient} skills`}
              />
            )}
            {tierCounts.developing > 0 && (
              <div
                className="h-full bg-saffron transition-all duration-500"
                style={{ width: `${(tierCounts.developing / skills.length) * 100}%` }}
                title={`Developing: ${tierCounts.developing} skills`}
              />
            )}
            {tierCounts.foundation > 0 && (
              <div
                className="h-full bg-slate-400 transition-all duration-500"
                style={{ width: `${(tierCounts.foundation / skills.length) * 100}%` }}
                title={`Foundation / Gaps: ${tierCounts.foundation} skills`}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. Controls Strip: Categories, Search & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-gray-900 text-white shadow-2xs'
                : 'bg-slate-100 text-gray-600 hover:bg-slate-200 hover:text-gray-900'
            }`}
          >
            All Domains ({skills.length})
          </button>
          {categories.map((cat) => {
            const count = skills.filter((s) => s.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#000080] text-white shadow-2xs'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200 hover:text-gray-900'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter skill..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-saffron focus:border-saffron"
            />
          </div>

          {/* View Switcher buttons: Compact Cards Grid & Detailed Table */}
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 flex items-center shrink-0">
            <button
              onClick={() => setViewMode('GRID')}
              title="Compact Cards Grid"
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards Grid</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              title="Detailed Registry Table"
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px]">Table Registry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Active Filters Reset Banner */}
      {(selectedTier !== 'ALL' || selectedCategory !== 'ALL' || searchQuery.trim()) && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">Filtered by:</span>
            {selectedCategory !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-800 font-bold text-[11px]">
                Domain: {selectedCategory}
              </span>
            )}
            {selectedTier !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-800 font-bold text-[11px]">
                Tier: {LEVEL_CONFIG[selectedTier as keyof typeof LEVEL_CONFIG]?.label}
              </span>
            )}
            {searchQuery.trim() && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-800 font-bold text-[11px]">
                Keyword: "{searchQuery}"
              </span>
            )}
            <span className="text-gray-500">({filteredSkills.length} matches)</span>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedTier('ALL');
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-[#000080] hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 5. Matrix Views */}
      {filteredSkills.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-3">
          <Award className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Skills Found Matching Current Criteria</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try clearing your search keyword or domain filters, or launch a diagnostic quiz to calibrate additional competencies.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedTier('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-2xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* ================= VIEW 1: COMPACT CARDS GRID ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSkills.map((skill) => {
            const config = LEVEL_CONFIG[skill.currentLevel];
            return (
              <div
                key={skill.id || skill.name}
                className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Top: Category & Source */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      {skill.category}
                    </span>
                    {renderSourceBadge(skill.source, true)}
                  </div>

                  {/* Skill Name & Level */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-gray-900 leading-snug">
                      {skill.name}
                    </h4>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-extrabold font-mono"
                      style={{
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                        border: `1px solid ${config.color}40`,
                      }}
                    >
                      {skill.progress}%
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-1">
                    {config.label} Stage • {skill.evidence}
                  </p>
                </div>

                {/* 4-Segment Milestone Bar */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => {
                      const isComplete = skill.currentLevel >= step;
                      const isCurrent = skill.currentLevel === step;
                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isComplete ? '' : 'bg-slate-200'
                            }`}
                            style={{
                              backgroundColor: isComplete ? config.color : undefined,
                              opacity: isComplete ? (isCurrent ? 1 : 0.8) : 1,
                            }}
                          />
                          <span
                            className={`block text-[9px] text-center font-bold truncate ${
                              isComplete ? 'text-gray-700' : 'text-gray-300'
                            }`}
                          >
                            {step === 1 ? 'Found.' : step === 2 ? 'Devel.' : step === 3 ? 'Profic.' : 'Expert'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VIEW 3: DETAILED REGISTRY TABLE ================= */
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Skill & Domain</th>
                <th className="py-3 px-4">Verification Source</th>
                <th className="py-3 px-4">Proficiency Stage</th>
                <th className="py-3 px-4 w-44">Calibrated Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredSkills.map((skill) => {
                const config = LEVEL_CONFIG[skill.currentLevel];
                return (
                  <tr key={skill.id || skill.name} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Domain */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 text-sm">
                        {skill.name}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {skill.category}
                      </div>
                    </td>

                    {/* Source & Evidence */}
                    <td className="py-3.5 px-4">
                      <div>
                        {renderSourceBadge(skill.source)}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 max-w-xs truncate">
                        {skill.evidence}
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold"
                        style={{
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                          border: `1px solid ${config.color}35`,
                        }}
                      >
                        {config.label} ({config.shortLabel.split(' ')[0]})
                      </span>
                    </td>

                    {/* Score Bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                        <span style={{ color: config.color }}>{skill.progress}%</span>
                        <span className="text-[10px] text-gray-400">{config.range}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${skill.progress}%`, backgroundColor: config.color }}
                        />
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={handleTestSkill}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 shadow-2xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Calibrate</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
