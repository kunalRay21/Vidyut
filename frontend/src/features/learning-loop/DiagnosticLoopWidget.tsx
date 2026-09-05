import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Trophy,
  ShieldCheck,
  Zap,
  HelpCircle,
  Clock
} from 'lucide-react';
import { DiagnosticRemediationPackage } from './types';

export const DiagnosticLoopWidget: React.FC = () => {
  const [pkg, setPkg] = useState<DiagnosticRemediationPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<'DIAGNOSTIC' | 'DRILL' | 'REASSESSMENT' | 'MASTERED'>('DIAGNOSTIC');

  // Drill checkpoint state
  const [selectedCheckpointIndex, setSelectedCheckpointIndex] = useState<number | null>(null);
  const [checkpointSubmitted, setCheckpointSubmitted] = useState<boolean>(false);
  const [completingDrill, setCompletingDrill] = useState<boolean>(false);

  // Reassessment state
  const [reassessmentAnswers, setReassessmentAnswers] = useState<Record<string, number>>({});
  const [submittingReassessment, setSubmittingReassessment] = useState<boolean>(false);
  const [reassessmentResult, setReassessmentResult] = useState<any>(null);

  // Reset or switch demo gap state
  const [triggering, setTriggering] = useState<boolean>(false);

  const fetchActiveLoop = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/learning-loop/active');
      const json = await res.json();
      if (json.success && json.data) {
        setPkg(json.data);
        if (json.data.status === 'MASTERED') {
          setCurrentStep('MASTERED');
        } else if (json.data.status === 'READY_FOR_REASSESSMENT') {
          setCurrentStep('REASSESSMENT');
        } else {
          setCurrentStep('DIAGNOSTIC');
        }
      }
    } catch (err) {
      console.warn('Failed to load active loop:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoop();
  }, []);

  const handleCheckpointSelect = (index: number) => {
    if (checkpointSubmitted) return;
    setSelectedCheckpointIndex(index);
  };

  const handleCompleteDrill = async () => {
    if (!pkg) return;
    setCompletingDrill(true);
    try {
      const res = await fetch('/api/v1/learning-loop/complete-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loopId: pkg.loopId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPkg(json.data);
        setCurrentStep('REASSESSMENT');
      }
    } catch (err) {
      console.warn('Failed to complete drill:', err);
    } finally {
      setCompletingDrill(false);
    }
  };

  const handleSelectReassessmentAnswer = (questionId: string, optionIndex: number) => {
    setReassessmentAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitReassessment = async () => {
    if (!pkg) return;
    setSubmittingReassessment(true);
    try {
      const answersPayload = Object.entries(reassessmentAnswers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));

      const res = await fetch('/api/v1/learning-loop/reassess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loopId: pkg.loopId, answers: answersPayload }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPkg(json.data.package);
        setReassessmentResult(json.data.evaluation);
        if (json.data.evaluation.masteryAchieved) {
          setCurrentStep('MASTERED');
        }
      }
    } catch (err) {
      console.warn('Failed to submit reassessment:', err);
    } finally {
      setSubmittingReassessment(false);
    }
  };

  const handleTriggerCustomGap = async (skillId: string, initialScore: number) => {
    setTriggering(true);
    try {
      const res = await fetch('/api/v1/learning-loop/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, initialScore }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPkg(json.data);
        setCurrentStep('DIAGNOSTIC');
        setSelectedCheckpointIndex(null);
        setCheckpointSubmitted(false);
        setReassessmentAnswers({});
        setReassessmentResult(null);
      }
    } catch (err) {
      console.warn('Failed to trigger custom gap:', err);
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Analyzing assessment diagnostic telemetry...</p>
      </div>
    );
  }

  if (!pkg) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Step Indicator Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          {[
            { step: 'DIAGNOSTIC', label: '1. Gap Diagnosis', icon: AlertTriangle },
            { step: 'DRILL', label: '2. Micro-Learning', icon: BookOpen },
            { step: 'REASSESSMENT', label: '3. Reassessment', icon: RotateCcw },
            { step: 'MASTERED', label: '4. Verified Mastery', icon: Trophy },
          ].map((item, index) => {
            const isCurrent = currentStep === item.step;
            const isCompleted =
              (item.step === 'DIAGNOSTIC' && currentStep !== 'DIAGNOSTIC') ||
              (item.step === 'DRILL' && (currentStep === 'REASSESSMENT' || currentStep === 'MASTERED')) ||
              (item.step === 'REASSESSMENT' && currentStep === 'MASTERED');

            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`py-2 px-1 sm:px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold'
                    : isCompleted
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span className="text-xs truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switch Gap Scenarios for Demonstration */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <span className="text-xs text-slate-400 font-medium">
          Simulate Alternative Diagnostic Deficits:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTriggerCustomGap('skill-sql', 52)}
            disabled={triggering}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          >
            SQL Index Deficit (52%)
          </button>
          <button
            onClick={() => handleTriggerCustomGap('skill-auth-jwt', 48)}
            disabled={triggering}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          >
            JWT Security Flaw (48%)
          </button>
          <button
            onClick={() => handleTriggerCustomGap('skill-async-eventloop', 58)}
            disabled={triggering}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          >
            Node Event Loop Starvation (58%)
          </button>
        </div>
      </div>

      {/* STEP 1: Gap Diagnosis View */}
      {currentStep === 'DIAGNOSTIC' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/20 via-slate-900/90 to-slate-900 border border-rose-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Telemetry Diagnostic Detected
                </div>
                <h3 className="text-xl font-bold text-white">
                  {pkg.sourceExamTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Initial Assessment Score: <span className="font-bold text-rose-400">{pkg.initialScore}%</span> (Deficit in {pkg.skillName})
                </p>
              </div>

              <button
                onClick={() => setCurrentStep('DRILL')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Launch 5-Min Remedial Drill</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Identified Conceptual Weaknesses
              </h4>

              {pkg.conceptGaps.map((gap, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">{gap.conceptTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {gap.severity} DEFICIT
                    </span>
                  </div>
                  <p className="text-xs text-rose-300/90 leading-relaxed font-mono">
                    ⚠️ Error Pattern: {gap.errorPattern}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    💡 Root Cause: {gap.misunderstoodPrinciple}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Micro-Learning Drill View */}
      {currentStep === 'DRILL' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Targeted Micro-Curriculum
                </div>
                <h3 className="text-xl font-bold text-white">
                  {pkg.microDrill.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{pkg.microDrill.readingMinutes} min read</span>
              </div>
            </div>

            {/* Core Golden Rule Box */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                  Core Engineering Rule
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pkg.microDrill.coreRule}
                </p>
              </div>
            </div>

            {/* Flawed vs Correct Code Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/30 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    Common Anti-Pattern (What went wrong)
                  </span>
                  <span className="text-[10px] uppercase text-slate-500 font-mono">
                    {pkg.microDrill.codeSnippet.language}
                  </span>
                </div>
                <pre className="text-xs text-rose-300/80 font-mono p-2 overflow-x-auto whitespace-pre leading-relaxed">
                  {pkg.microDrill.codeSnippet.flawedCode}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Production-Grade Fix
                  </span>
                  <span className="text-[10px] uppercase text-slate-500 font-mono">
                    {pkg.microDrill.codeSnippet.language}
                  </span>
                </div>
                <pre className="text-xs text-emerald-300 font-mono p-2 overflow-x-auto whitespace-pre leading-relaxed">
                  {pkg.microDrill.codeSnippet.correctedCode}
                </pre>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              Insight: {pkg.microDrill.codeSnippet.explanation}
            </p>

            {/* Checkpoint Question */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive Checkpoint Drill
                </h5>
              </div>

              <p className="text-sm font-medium text-slate-200">
                {pkg.microDrill.checkpointQuestion.question}
              </p>

              <div className="space-y-2">
                {pkg.microDrill.checkpointQuestion.options.map((opt, i) => {
                  const isSelected = selectedCheckpointIndex === i;
                  const isCorrect = i === pkg.microDrill.checkpointQuestion.correctIndex;

                  let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/40';
                  if (checkpointSubmitted) {
                    if (isCorrect) borderClass = 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200';
                    else if (isSelected && !isCorrect) borderClass = 'border-rose-500/80 bg-rose-950/30 text-rose-200';
                  } else if (isSelected) {
                    borderClass = 'border-cyan-500 bg-cyan-950/20 text-white';
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCheckpointSelect(i)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${borderClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {!checkpointSubmitted ? (
                <button
                  onClick={() => setCheckpointSubmitted(true)}
                  disabled={selectedCheckpointIndex === null}
                  className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold text-xs transition"
                >
                  Verify Answer
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-300">
                    {selectedCheckpointIndex === pkg.microDrill.checkpointQuestion.correctIndex ? (
                      <span className="text-emerald-400 font-bold">✓ Correct! </span>
                    ) : (
                      <span className="text-rose-400 font-bold">✗ Review: </span>
                    )}
                    {pkg.microDrill.checkpointQuestion.explanation}
                  </p>

                  <button
                    onClick={handleCompleteDrill}
                    disabled={completingDrill}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <span>Proceed to Verification Reassessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Verification Reassessment View */}
      {currentStep === 'REASSESSMENT' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Deficit Verification Challenge
                </div>
                <h3 className="text-xl font-bold text-white">
                  Targeted Reassessment: {pkg.skillName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Score &ge; 75% repairs your skill deficit and automatically upgrades your Skill Passport authenticity.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500">Target Benchmark</span>
                <div className="text-sm font-bold text-emerald-400">&ge; 75% Mastery</div>
              </div>
            </div>

            {/* Reassessment Questions */}
            <div className="space-y-6">
              {pkg.reassessmentQuestions.map((q, qIndex) => (
                <div key={q.id} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Question {qIndex + 1}
                    </span>
                    <span className="text-[11px] text-slate-500">Weight: 1.0</span>
                  </div>

                  <p className="text-sm font-medium text-slate-200">
                    {q.prompt}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = reassessmentAnswers[q.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectReassessmentAnswer(q.id, optIndex)}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep('DRILL')}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                &larr; Review Micro-Drill Again
              </button>

              <button
                onClick={handleSubmitReassessment}
                disabled={submittingReassessment || Object.keys(reassessmentAnswers).length < pkg.reassessmentQuestions.length}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                {submittingReassessment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Evaluating Mastery...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Reassessment & Repair Skill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Mastery Achieved View */}
      {currentStep === 'MASTERED' && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Loop Closed • Deficit Repaired
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Mastery Verified & Verified Evidence Granted
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {reassessmentResult?.feedback || 'Outstanding! You demonstrated 100% conceptual mastery on the targeted reassessment.'}
            </p>
          </div>

          {/* Score comparison pill */}
          <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Initial Score</div>
              <div className="text-xl font-extrabold text-rose-400">{pkg.initialScore}%</div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Reassessment Score</div>
              <div className="text-xl font-extrabold text-emerald-400">
                {pkg.reassessmentScore || 100}%
              </div>
            </div>
            <div className="pl-4 border-l border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Net Boost</div>
              <div className="text-xl font-extrabold text-cyan-300">
                +{Math.max(0, (pkg.reassessmentScore || 100) - pkg.initialScore)}%
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/passport"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              View Upgraded Skill Passport
            </a>

            <button
              onClick={() => handleTriggerCustomGap('skill-auth-jwt', 48)}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
            >
              Repair Another Skill Deficit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
