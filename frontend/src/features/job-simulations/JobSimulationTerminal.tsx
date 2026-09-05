import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  FileCode,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Server,
  Clock
} from 'lucide-react';
import {
  JobSimulationScenario,
  SimulationEvaluation,
} from './types';

export const JobSimulationTerminal: React.FC = () => {
  const [scenarios, setScenarios] = useState<JobSimulationScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('incident-checkout-pool');
  const [activeTab, setActiveTab] = useState<'LOGS' | 'METRICS' | 'CODE'>('LOGS');
  const [loading, setLoading] = useState<boolean>(true);

  // Investigation candidate state
  const [selectedRootCauseId, setSelectedRootCauseId] = useState<string>('');
  const [selectedActionId, setSelectedActionId] = useState<string>('');
  const [investigationNotes, setInvestigationNotes] = useState<string>('');
  const [patchCode, setPatchCode] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<SimulationEvaluation | null>(null);

  // Fetch scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/job-simulations/scenarios');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setScenarios(json.data);
          setSelectedScenarioId(json.data[0].id);
        }
      } catch (err) {
        console.warn('Failed to load simulation scenarios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const currentScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  // Reset form when scenario changes
  useEffect(() => {
    if (currentScenario) {
      setSelectedRootCauseId('');
      setSelectedActionId('');
      setInvestigationNotes('');
      setPatchCode(
        currentScenario.id === 'incident-checkout-pool'
          ? `// Implement connection fix here\nconst client = await readPool.connect();\ntry {\n  return await client.query('SELECT * FROM coupons WHERE code = $1', [code]);\n} finally {\n  client.release();\n}`
          : `// Implement IDOR authorization fix here\nconst invoice = await db.invoice.findFirst({\n  where: { id: invoiceId, organizationId: req.user.organizationId }\n});\nif (!invoice) return res.status(403).json({ error: 'Access denied' });`
      );
      setEvaluation(null);
    }
  }, [selectedScenarioId, currentScenario]);

  const handleSubmitEvaluation = async () => {
    if (!currentScenario) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/v1/job-simulations/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: currentScenario.id,
          selectedRootCauseId,
          selectedActionId,
          investigationNotes,
          patchCode,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEvaluation(json.data);
      }
    } catch (err) {
      console.warn('Failed to evaluate submission:', err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Provisioning Cloud Telemetry Sandbox...</p>
      </div>
    );
  }

  if (!currentScenario) return null;

  return (
    <div className="space-y-8">
      {/* Scenario Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Live Production Sandbox Scenarios
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {scenarios.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-sm ring-1 ring-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {sc.title.split(':')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {currentScenario.difficulty}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {currentScenario.timeLimitMinutes} min target resolution
              </span>
              <span className="text-xs text-slate-500">• Target: {currentScenario.targetRole}</span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              {currentScenario.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentScenario.incidentBrief}
            </p>

            <p className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              Impact: {currentScenario.impactStatement}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[200px]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Live Status</div>
            <div className="text-base font-bold text-rose-400 mt-1 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              INCIDENT ACTIVE
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting Candidate Triage</div>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Telemetry & Observability Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            {/* Terminal Tab Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-slate-400 font-mono text-[11px] ml-2">vidyut-observability-shell</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('LOGS')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'LOGS'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Live Logs ({currentScenario.telemetryLogs.length})
                </button>
                <button
                  onClick={() => setActiveTab('METRICS')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'METRICS'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Metrics
                </button>
                <button
                  onClick={() => setActiveTab('CODE')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'CODE'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  Code & Config
                </button>
              </div>
            </div>

            {/* Tab 1: Terminal Logs */}
            {activeTab === 'LOGS' && (
              <div className="p-4 font-mono text-xs space-y-2 h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                {currentScenario.telemetryLogs.map((log, i) => {
                  let badge = 'text-cyan-400 bg-cyan-950/40 border-cyan-800';
                  if (log.level === 'FATAL') badge = 'text-rose-300 bg-rose-950/70 border-rose-700 font-bold';
                  else if (log.level === 'ERROR') badge = 'text-rose-400 bg-rose-950/40 border-rose-800';
                  else if (log.level === 'WARN') badge = 'text-amber-400 bg-amber-950/40 border-amber-800';

                  return (
                    <div key={i} className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-900/60 p-1 rounded">
                      <span className="text-slate-500 shrink-0 select-none text-[11px]">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase border shrink-0 ${badge}`}>
                        {log.level}
                      </span>
                      <span className="text-slate-400 shrink-0 font-semibold">[{log.service}]</span>
                      <span className="text-slate-200 break-all">{log.message}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Metrics Timeline */}
            {activeTab === 'METRICS' && (
              <div className="p-5 space-y-4 h-[380px] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Max Latency</span>
                    <div className="text-lg font-bold text-rose-400 mt-1">4,200 ms</div>
                    <span className="text-[10px] text-rose-500">&uarr; 9,200% spike</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">DB Pool Used</span>
                    <div className="text-lg font-bold text-rose-400 mt-1">20 / 20</div>
                    <span className="text-[10px] text-rose-500">100% Saturation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">CPU Utilization</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">19 %</div>
                    <span className="text-[10px] text-emerald-500">Normal</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Error Rate</span>
                    <div className="text-lg font-bold text-rose-400 mt-1">78 %</div>
                    <span className="text-[10px] text-rose-500">504 Timeouts</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Telemetry Timeseries Breakdown
                  </span>
                  <div className="space-y-2 font-mono text-xs">
                    {currentScenario.metricsTimeline.map((pt, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="text-cyan-300 font-bold">{pt.time}</span>
                        <span className="text-slate-400">Latency: {pt.latencyMs}ms</span>
                        <span className="text-slate-400">Active DB Conn: {pt.activeDbConnections}</span>
                        <span className={pt.errorRatePercent > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          Errors: {pt.errorRatePercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Code & Config Explorer */}
            {activeTab === 'CODE' && (
              <div className="p-4 space-y-4 h-[380px] overflow-y-auto">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      {currentScenario.configFile.filename}
                    </span>
                    <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded">
                      {currentScenario.configFile.language}
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
                    {currentScenario.configFile.content}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-rose-400" />
                      {currentScenario.flawedSourceCode.filename}
                    </span>
                    <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded">
                      {currentScenario.flawedSourceCode.language}
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-rose-300/80 border border-rose-900/40 overflow-x-auto">
                    {currentScenario.flawedSourceCode.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Candidate Investigation & Patch Formulation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Incident Remediation Console
            </h4>

            {/* Phase 1: Root Cause Diagnosis */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                1. Identify Root Cause
              </label>
              <div className="space-y-2">
                {currentScenario.rootCauseOptions.map((rc) => (
                  <button
                    key={rc.id}
                    type="button"
                    onClick={() => setSelectedRootCauseId(rc.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedRootCauseId === rc.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {rc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase 2: Operational Action */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                2. Operational Action Decision
              </label>
              <div className="space-y-2">
                {currentScenario.operationalActions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedActionId(act.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedActionId === act.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase 3: Investigation Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                3. Triage & Diagnostic Notes
              </label>
              <textarea
                value={investigationNotes}
                onChange={(e) => setInvestigationNotes(e.target.value)}
                placeholder="Explain the telemetry clues that led you to this diagnosis..."
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Phase 4: Code Patch */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                4. Code Patch
              </label>
              <textarea
                value={patchCode}
                onChange={(e) => setPatchCode(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSubmitEvaluation}
              disabled={evaluating || !selectedRootCauseId || !selectedActionId}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              {evaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Automated Regression Sandbox...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Deploy Patch & Verify Outage Resolution
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Results Card */}
      {evaluation && (
        <div className={`p-8 rounded-3xl border shadow-2xl transition-all ${
          evaluation.passed
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-emerald-500/10'
            : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-rose-500/10'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                {evaluation.passed ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SIMULATION PASSED • {evaluation.readinessTier}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    FAILED • {evaluation.readinessTier}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-extrabold text-white">
                Multi-Vector Operational Evaluation Score: {evaluation.overallScore} / 100
              </h3>

              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <p><strong>Root Cause:</strong> {evaluation.feedback.rootCauseFeedback}</p>
                <p><strong>Operational Action:</strong> {evaluation.feedback.operationalFeedback}</p>
                <p><strong>Patch Defense:</strong> {evaluation.feedback.patchFeedback}</p>
              </div>
            </div>

            {/* Score Pill Breakdown */}
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Root Cause</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.rootCauseScore} / 35</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Log Analysis</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.logAnalysisScore} / 35</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Code Patch</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.patchScore} / 20</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Ops Judgment</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.operationalJudgmentScore} / 10</div>
              </div>
            </div>
          </div>

          {evaluation.passportEvidenceAwarded && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-300">
                    Cryptographic Simulation Proof Appended to Skill Passport
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Evidence type: <span className="font-mono text-emerald-400">PRACTICAL_SIMULATION</span> (Weight: 0.70)
                  </div>
                </div>
              </div>

              <a
                href="/passport"
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
              >
                Inspect Passport Evidence &rarr;
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
