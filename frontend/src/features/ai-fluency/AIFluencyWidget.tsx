import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BrainCircuit,
  MessageSquareQuote,
  Check
} from 'lucide-react';
import {
  AIFluencyChallenge,
  AIFluencyEvaluation,
} from './types';

export const AIFluencyWidget: React.FC = () => {
  const [challenges, setChallenges] = useState<AIFluencyChallenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('challenge-concurrency-race');
  const [loading, setLoading] = useState<boolean>(true);

  // Audit form state
  const [identifiedTrapIds, setIdentifiedTrapIds] = useState<string[]>([]);
  const [selectedPromptOptionId, setSelectedPromptOptionId] = useState<string>('');
  const [candidateCritique, setCandidateCritique] = useState<string>('');
  const [remediatedCode, setRemediatedCode] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AIFluencyEvaluation | null>(null);

  // Fetch challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/ai-fluency/challenges');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setChallenges(json.data);
          setSelectedChallengeId(json.data[0].id);
        }
      } catch (err) {
        console.warn('Failed to load AI fluency challenges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const currentChallenge = challenges.find(c => c.id === selectedChallengeId) || challenges[0];

  // Reset form when challenge changes
  useEffect(() => {
    if (currentChallenge) {
      setIdentifiedTrapIds([]);
      setSelectedPromptOptionId('');
      setCandidateCritique('');
      setRemediatedCode(
        currentChallenge.id === 'challenge-concurrency-race'
          ? `// Safe transactional balance decrement\nawait db.$transaction(async (tx) => {\n  const res = await tx.$executeRaw\`\n    UPDATE wallets SET balance = balance - \${amount}\n    WHERE user_id = \${userId} AND balance >= \${amount}\n  \`;\n  if (res === 0) throw new Error('Insufficient balance or concurrent update');\n});`
          : `// Bound input length and remove nested quantifiers\nif (username.length > 30) return false;\nreturn /^[a-zA-Z0-9]{3,30}$/.test(username);`
      );
      setEvaluation(null);
    }
  }, [selectedChallengeId, currentChallenge]);

  const toggleTrapSelection = (trapId: string) => {
    setIdentifiedTrapIds(prev =>
      prev.includes(trapId) ? prev.filter(id => id !== trapId) : [...prev, trapId]
    );
  };

  const handleSubmitAudit = async () => {
    if (!currentChallenge) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/v1/ai-fluency/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          identifiedTrapIds,
          selectedPromptOptionId,
          candidateCritique,
          remediatedCode,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEvaluation(json.data);
      }
    } catch (err) {
      console.warn('Failed to evaluate AI fluency audit:', err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Loading AI Copilot Calibration Environment...</p>
      </div>
    );
  }

  if (!currentChallenge) return null;

  return (
    <div className="space-y-8">
      {/* Challenge Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            AI Code Audit Scenarios
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {challenges.map((ch) => {
            const isSelected = ch.id === selectedChallengeId;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChallengeId(ch.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-sm ring-1 ring-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {ch.title.split(':')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenge Scenario Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Developer Task Specification
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {currentChallenge.title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            "{currentChallenge.taskPrompt}"
          </p>
        </div>
      </div>

      {/* Interactive Audit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Generated Output with Hallucination Traps (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">{currentChallenge.aiGeneratedResponse.model}</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Draft Suggestion
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
              <MessageSquareQuote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 italic leading-relaxed">
                {currentChallenge.aiGeneratedResponse.aiExplanation}
              </p>
            </div>

            {/* Syntax Code Box */}
            <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-indigo-200/90 border border-slate-800 overflow-x-auto whitespace-pre leading-relaxed">
              {currentChallenge.aiGeneratedResponse.code}
            </pre>

            {/* Embedded Traps Checklist */}
            <div className="pt-2 space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Identify Latent Traps in AI Response
              </label>

              <div className="space-y-2">
                {currentChallenge.embeddedTraps.map((trap) => {
                  const isChecked = identifiedTrapIds.includes(trap.id);
                  return (
                    <button
                      key={trap.id}
                      type="button"
                      onClick={() => toggleTrapSelection(trap.id)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-rose-950/30 border-rose-500/70 text-rose-200 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                        isChecked ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-700'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{trap.trapType}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({trap.lineRange})</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {trap.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Candidate Audit & Prompt Refinement (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              Augmented Developer Refinement Console
            </h4>

            {/* Prompt Refinement Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                1. Select Optimal Refined Specification Prompt
              </label>
              <div className="space-y-2">
                {currentChallenge.promptImprovementOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPromptOptionId(opt.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedPromptOptionId === opt.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    "{opt.promptText}"
                  </button>
                ))}
              </div>
            </div>

            {/* Critical Critique Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                2. Architectural Critique & Flaw Diagnosis
              </label>
              <textarea
                value={candidateCritique}
                onChange={(e) => setCandidateCritique(e.target.value)}
                placeholder="Explain why the AI's proposal fails in a production concurrent or hostile environment..."
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Remediated Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                3. Verified Production Remediation
              </label>
              <textarea
                value={remediatedCode}
                onChange={(e) => setRemediatedCode(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSubmitAudit}
              disabled={evaluating || identifiedTrapIds.length === 0 || !selectedPromptOptionId}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
            >
              {evaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Auditing AI Fluency Acumen...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Evaluate AI Fluency & Mint Passport Proof
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
            ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/50 shadow-indigo-500/10'
            : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-rose-500/10'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                {evaluation.passed ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI FLUENCY VERIFIED • {evaluation.fluencyTier}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    AUDIT FAILED • {evaluation.fluencyTier}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-extrabold text-white">
                AI Fluency Index: {evaluation.overallFluencyScore} / 100
              </h3>

              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <p><strong>Critique Analysis:</strong> {evaluation.critiqueFeedback}</p>
                <p><strong>Prompt Specification:</strong> {evaluation.promptFeedback}</p>
                <p>
                  <strong>Hallucinations Intercepted:</strong> {evaluation.trapsDetectedCount} of {evaluation.totalTrapsCount} latent vulnerabilities caught.
                </p>
              </div>
            </div>

            {/* Score Grid Breakdown */}
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Hallucination Catch</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.hallucinationCatchScore} / 35</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Prompt Precision</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.promptPrecisionScore} / 25</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Code Verification</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.codeVerificationScore} / 25</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase text-slate-500">Refinement Velocity</div>
                <div className="text-base font-bold text-white mt-0.5">{evaluation.refinementVelocityScore} / 15</div>
              </div>
            </div>
          </div>

          {evaluation.passportEvidenceAwarded && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-300">
                    AI Fluency Verified Credential Minted to Skill Passport
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Credential badge: <span className="font-mono text-indigo-400">AI Augmented Architect</span>
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
