import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Flame,
  Check
} from 'lucide-react';
import { CareerSimulationResult, SimulatableRole } from './types';

export const CareerSimulatorWidget: React.FC = () => {
  const [roles, setRoles] = useState<SimulatableRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-data');
  const [simulation, setSimulation] = useState<CareerSimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [adopting, setAdopting] = useState<boolean>(false);
  const [adoptSuccess, setAdoptSuccess] = useState<string | null>(null);

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/v1/simulator/roles');
        const json = await res.json();
        if (json.success && json.data) {
          setRoles(json.data);
          // Default to first target that is not backend if possible
          const defaultTarget = json.data.find((r: SimulatableRole) => r.id !== 'role-backend') || json.data[0];
          if (defaultTarget) {
            setSelectedRoleId(defaultTarget.id);
          }
        }
      } catch (err) {
        console.warn('Failed to load simulator roles:', err);
      }
    };

    fetchRoles();
  }, []);

  // Run simulation whenever selectedRoleId changes
  useEffect(() => {
    if (!selectedRoleId) return;

    const runSimulation = async () => {
      setSimulating(true);
      setAdoptSuccess(null);
      try {
        const res = await fetch('/api/v1/simulator/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetRoleId: selectedRoleId }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setSimulation(json.data);
        }
      } catch (err) {
        console.warn('Simulation failed:', err);
      } finally {
        setSimulating(false);
      }
    };

    runSimulation();
  }, [selectedRoleId]);

  const handleAdoptRole = async () => {
    if (!selectedRoleId) return;
    setAdopting(true);
    try {
      const res = await fetch('/api/v1/simulator/adopt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRoleId: selectedRoleId }),
      });
      const json = await res.json();
      if (json.success) {
        setAdoptSuccess(simulation?.targetRoleName || 'Target role');
        setTimeout(() => setAdoptSuccess(null), 4000);
      }
    } catch (err) {
      console.warn('Failed to adopt target role:', err);
    } finally {
      setAdopting(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'ADVANCED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Advanced</span>;
      case 'INTERMEDIATE':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Intermediate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Beginner</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Role Picker Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Explore Target Career Trajectories
          </label>
          <span className="text-xs text-slate-500">Live DAG Counterfactual Analysis</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full pointer-events-none" />
                )}
                <div className="text-xs font-bold truncate text-slate-200 group-hover:text-white transition-colors">
                  {role.name.split('&')[0].trim()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>{role.skillCount} core skills</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {simulating ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div className="w-12 h-12 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-300 font-medium text-sm">Simulating Cross-Domain Competency Graph...</p>
          <p className="text-slate-500 text-xs mt-1">Traversing semantic transfer rules & prerequisite chains</p>
        </div>
      ) : simulation ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-800/80 border border-slate-700/60 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Trajectory: {simulation.sourceRoleName} &rarr; {simulation.targetRoleName}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {simulation.targetRoleName}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {simulation.executiveSummary}
                </p>
              </div>

              {/* Action and Metric Pills */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
                <button
                  onClick={handleAdoptRole}
                  disabled={adopting}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    adoptSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                  }`}
                >
                  {adopting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Re-routing DAG...
                    </>
                  ) : adoptSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Target Role Adopted!
                    </>
                  ) : (
                    <>
                      Adopt This Target Role
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Average Market Stipend</div>
                  <div className="text-base font-bold text-cyan-300 mt-0.5">
                    {simulation.unlockedOpportunitiesEstimate.averageStipend}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Transferability Index */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transferability Index</span>
                <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{simulation.transferabilityIndex}%</span>
                <span className="text-xs text-slate-400">of syllabus satisfied</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${simulation.transferabilityIndex}%` }}
                />
              </div>
            </div>

            {/* 2. Readiness Leap */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Readiness Leap</span>
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-300">{simulation.currentReadinessPct}%</span>
                <ArrowRight className="w-4 h-4 text-slate-500 inline" />
                <span className="text-3xl font-extrabold text-emerald-400">{simulation.projectedReadinessPct}%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                +{simulation.projectedReadinessPct - simulation.currentReadinessPct}% boost upon finishing {simulation.totalAdditionalSkills} gap skills
              </p>
            </div>

            {/* 3. Learning Time Needed */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bridging Effort</span>
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-300">{simulation.totalEstimatedHours}h</span>
                <span className="text-xs text-slate-400">~{simulation.estimatedWeeksAt10HoursPerWeek} wks (at 10h/wk)</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {simulation.totalAdditionalSkills} critical topics to master
              </p>
            </div>
          </div>

          {/* Transferable Skills vs Gap Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transferable Skills Column */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Transferable Skills Recognized</h4>
                    <p className="text-xs text-slate-400">Existing competencies that give you immediate credit</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {simulation.transferableSkills.length} matches
                </span>
              </div>

              {simulation.transferableSkills.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No direct semantic overlaps detected.
                </div>
              ) : (
                <div className="space-y-3">
                  {simulation.transferableSkills.map((transfer, idx) => {
                    const ratioPct = Math.round(transfer.transferRatio * 100);
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-300">
                              {transfer.sourceSkillName}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-xs font-bold text-cyan-300">
                              {transfer.targetSkillName}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">
                            {ratioPct}% Transfer
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {transfer.rationale}
                        </p>
                        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${ratioPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Gap Skills Roadmap Column */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Target Skill Gaps to Bridge</h4>
                    <p className="text-xs text-slate-400">Prerequisite milestones required for role readiness</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {simulation.gapSkills.length} remaining
                </span>
              </div>

              {simulation.gapSkills.length === 0 ? (
                <div className="p-8 text-center text-emerald-400 text-sm font-medium">
                  Zero skill gaps! You are already fully qualified for this trajectory.
                </div>
              ) : (
                <div className="space-y-3">
                  {simulation.gapSkills.map((gap) => (
                    <div
                      key={gap.skillId}
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {gap.skillName}
                        </span>
                        <div className="flex items-center gap-2">
                          {getDifficultyBadge(gap.difficulty)}
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {gap.estimatedHours}h
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        {gap.description}
                      </p>
                      {gap.prerequisites.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-slate-500">Prereqs:</span>
                          {gap.prerequisites.map((p, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unlocked Market Opportunities Preview */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">
                  {simulation.unlockedOpportunitiesEstimate.count} Hiring Partners Actively Seeking This Profile
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sample openings: {simulation.unlockedOpportunitiesEstimate.sampleRoles.join(' • ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {simulation.unlockedOpportunitiesEstimate.averageStipend}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
