import React, { useState } from 'react';
import { X, Upload, GitBranch, Award, Briefcase, CheckCircle2, ShieldAlert } from 'lucide-react';
import { EvidenceItem } from './types';

interface EvidenceSubmitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string | null;
  skillName?: string;
  onSubmitEvidence: (payload: {
    skillId: string;
    type: EvidenceItem['type'];
    title: string;
    sourceUrl?: string;
    score?: number;
  }) => Promise<void>;
}

export const EvidenceSubmitDrawer: React.FC<EvidenceSubmitDrawerProps> = ({
  isOpen,
  onClose,
  skillId,
  skillName,
  onSubmitEvidence,
}) => {
  const [type, setType] = useState<EvidenceItem['type']>('GITHUB_REPOSITORY');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [score, setScore] = useState<string>('85');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !skillId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title or project description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitEvidence({
        skillId,
        type,
        title: title.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        score: score ? parseInt(score, 10) : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
              <Upload className="w-3 h-3" />
              Evidence Authenticity Upgrade
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-900">
              Anchor Proof for {skillName || skillId}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attach GitHub repositories, certificates, or verified tasks to increase your Confidence Score.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Evidence Type Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Evidence Type (Weight Multiplier)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('GITHUB_REPOSITORY')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'GITHUB_REPOSITORY'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <GitBranch className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">GitHub Project</p>
                  <p className="text-[10px] text-slate-500">55% weight bonus</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('CERTIFICATE')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'CERTIFICATE'
                    ? 'border-amber-600 bg-amber-50/50 text-amber-900 ring-1 ring-amber-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Accredited Certificate</p>
                  <p className="text-[10px] text-slate-500">35% weight bonus</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('PRACTICAL_SIMULATION')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'PRACTICAL_SIMULATION'
                    ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-1 ring-purple-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Troubleshooting Lab</p>
                  <p className="text-[10px] text-slate-500">95% weight bonus</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('EMPLOYER_VERIFICATION')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'EMPLOYER_VERIFICATION'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Employer Endorsement</p>
                  <p className="text-[10px] text-slate-500">100% full weight</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Proof Title / Repository Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Task Queue with Redis Streams and Docker"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Artifact Link (GitHub URL, Live Deployment, Credential ID)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://github.com/your-username/project-repo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Optional Evaluation Score */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Estimated Demonstration Score (%)
            </label>
            <input
              type="number"
              min="40"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-saffron py-2 px-5 text-xs font-semibold flex items-center gap-2"
            >
              {isSubmitting ? 'Verifying Proof...' : 'Anchor Proof & Recalculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
