import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  Activity,
  Clock,
  TrendingUp,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Zap,
  Target
} from 'lucide-react';
import {
  DigitalTwinProfile,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
  Opportunity12HourPlan,
} from './types';
import { OpportunityPrepPlanModal } from './OpportunityPrepPlanModal';

export const DigitalTwinDashboard: React.FC = () => {
  const [twin, setTwin] = useState<DigitalTwinProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // What-If Simulator state
  const [whatIfInput, setWhatIfInput] = useState<WhatIfScenarioInput>({
    refreshDecayedSkills: true,
    completeSandboxSimulation: false,
    masterTwoGapSkills: false,
    verifyGithubEvidence: false,
  });
  const [whatIfResult, setWhatIfResult] = useState<WhatIfScenarioResult | null>(null);

  // Prep Plan Modal state
  const [activePrepPlan, setActivePrepPlan] = useState<Opportunity12HourPlan | null>(null);
  const [loadingPrepPlan, setLoadingPrepPlan] = useState<boolean>(false);

  const fetchTwin = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/digital-twin/twin');
      const json = await res.json();
      if (json.success && json.data) {
        setTwin(json.data);
      }
    } catch (err) {
      console.warn('Failed to load digital twin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwin();
  }, []);

  // Re-run what-if simulation when toggles change
  useEffect(() => {
    if (!twin) return;

    const runWhatIf = async () => {
      try {
        const res = await fetch('/api/v1/digital-twin/what-if', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(whatIfInput),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setWhatIfResult(json.data);
        }
      } catch (err) {
        console.warn('What-if projection failed:', err);
      }
    };

    runWhatIf();
  }, [whatIfInput, twin]);

  const toggleWhatIf = (key: keyof WhatIfScenarioInput) => {
    setWhatIfInput(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenPrepPlan = async () => {
    setLoadingPrepPlan(true);
    try {
      const res = await fetch('/api/v1/digital-twin/prep-plan/opp-razorpay-backend');
      const json = await res.json();
      if (json.success && json.data) {
        setActivePrepPlan(json.data);
      }
    } catch (err) {
      console.warn('Failed to load prep plan:', err);
    } finally {
      setLoadingPrepPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Synthesizing Career Readiness Digital Twin...</p>
      </div>
    );
  }

  if (!twin) return null;

  return (
    <div className="space-y-8">
      {/* Top Twin Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 border border-slate-800/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
              <Brain className="w-3.5 h-3.5 text-teal-400" />
              Live Career Readiness Digital Twin
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {twin.targetRole}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Your Digital Twin is a continuous, mathematically explainable model of your engineering readiness.
              Unlike static resumes, it weighs raw syllabus mastery, cryptographic proof authenticity,
              hands-on incident simulation velocity, and cognitive decay recency.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {twin.readinessBand.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Unlocking {twin.unlockedOpportunityCount} verified partner job openings
              </span>
            </div>
          </div>

          {/* Holistic Score Radial Card */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[220px] text-center shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Explainable Holistic Score
            </span>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 my-2">
              {twin.overallReadinessScore}%
            </div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Top 12% Candidate Cohort
            </span>

            <button
              onClick={handleOpenPrepPlan}
              disabled={loadingPrepPlan}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loadingPrepPlan ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Generate 12-Hour Prep Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Foundational Syllabus</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Target className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white">{twin.pillars.foundationalSyllabus}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${twin.pillars.foundationalSyllabus}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 block">Core DAG competency mastery</span>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Evidence Authenticity</span>
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-teal-300">{twin.pillars.evidenceAuthenticity}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full" style={{ width: `${twin.pillars.evidenceAuthenticity}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 block">Cryptographic proof saturation</span>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operational Sandbox</span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400"><Activity className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white">{twin.pillars.operationalSandbox}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${twin.pillars.operationalSandbox}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 block">Live incident triage & patch velocity</span>
        </div>

        {/* Pillar 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recency & Health</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white">{twin.pillars.recencyVelocity}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${twin.pillars.recencyVelocity}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 block">Decay protection & fresh activity</span>
        </div>
      </div>

      {/* Explainable Attribution & What-If Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Explainable Attribution Factors (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400" />
              <h4 className="text-sm font-bold text-white">Mathematical Attribution Decomposition</h4>
            </div>
            <span className="text-xs text-slate-500">100% Transparent</span>
          </div>

          <div className="space-y-3">
            {twin.attributionFactors.map((factor, i) => {
              const isPositive = factor.impactPercent > 0;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{factor.title}</span>
                    <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isPositive ? `+${factor.impactPercent}%` : `${factor.impactPercent}%`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {factor.explanation}
                  </p>
                  <p className="text-[11px] text-teal-400 font-medium">
                    &rarr; Recommended Next Step: {factor.actionableStep}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: What-If Counterfactual Simulator (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Interactive What-If Projection</h4>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Counterfactual</span>
          </div>

          <p className="text-xs text-slate-400">
            Toggle planned learning activities to forecast your readiness leap and unlocked opportunities:
          </p>

          <div className="space-y-2.5">
            {[
              { key: 'refreshDecayedSkills' as const, label: 'Take 15-Min SQL Refresher', bonus: '+7%', hours: '1h' },
              { key: 'completeSandboxSimulation' as const, label: 'Pass P0 Incident Sandbox', bonus: '+11%', hours: '2h' },
              { key: 'masterTwoGapSkills' as const, label: 'Master Redis & Kafka Gaps', bonus: '+9%', hours: '6h' },
              { key: 'verifyGithubEvidence' as const, label: 'Link Production GitHub Repo', bonus: '+5%', hours: '1h' },
            ].map((item) => {
              const isChecked = whatIfInput[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleWhatIf(item.key)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-teal-950/30 border-teal-500/60 text-teal-200'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-700'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-teal-400">{item.bonus}</span>
                    <span className="text-slate-500">({item.hours})</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Projection Display */}
          {whatIfResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Projected Readiness</span>
                <span className="text-xs font-bold text-teal-400">+{whatIfResult.scoreDelta}% Boost</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-400">{whatIfResult.currentScore}%</span>
                <ArrowRight className="w-4 h-4 text-teal-400" />
                <span className="text-3xl font-extrabold text-teal-300">{whatIfResult.projectedScore}%</span>
              </div>

              <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p>Investment: <strong className="text-white">{whatIfResult.timeInvestmentHours} hours</strong></p>
                <p>Unlocked Jobs: <strong className="text-teal-300">{whatIfResult.newUnlockedOpportunities} companies</strong></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 12-Hour Prep Plan Modal */}
      <OpportunityPrepPlanModal
        plan={activePrepPlan}
        onClose={() => setActivePrepPlan(null)}
      />
    </div>
  );
};
