import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  GitBranch, 
  Award, 
  FileCheck, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PassportSkillEntry, EvidenceItem, AuthenticityLevel } from './types';

interface SkillPassportCardProps {
  skill: PassportSkillEntry;
  onAddEvidence: (skillId: string) => void;
  onTakeRefresher?: (skillId: string) => void;
  isRefresherLoading?: boolean;
}

const LEVEL_COLORS: Record<AuthenticityLevel, { bg: string; text: string; border: string }> = {
  INDUSTRY_ENDORSED: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/30' },
  SIMULATION_VALIDATED: { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-500/30' },
  ASSESSMENT_VERIFIED: { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/30' },
  PROJECT_PROVEN: { bg: 'bg-indigo-500/10', text: 'text-indigo-700', border: 'border-indigo-500/30' },
  CREDENTIAL_BACKED: { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/30' },
  SELF_ATTESTED: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/30' },
  UNVERIFIED_CLAIM: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/30' },
};

export const SkillPassportCard: React.FC<SkillPassportCardProps> = ({
  skill,
  onAddEvidence,
  onTakeRefresher,
  isRefresherLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const badgeStyle = LEVEL_COLORS[skill.authenticityLevel] || LEVEL_COLORS.SELF_ATTESTED;

  const renderEvidenceIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'GITHUB_REPOSITORY':
        return <GitBranch className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />;
      case 'DIAGNOSTIC_ASSESSMENT':
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />;
      case 'PRACTICAL_SIMULATION':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />;
      case 'CERTIFICATE':
        return <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />;
      case 'EMPLOYER_VERIFICATION':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />;
      default:
        return <FileCheck className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {skill.skillName}
              </h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} flex items-center gap-1`}>
                <CheckCircle2 className="w-3 h-3" />
                {skill.authenticityLevel.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <span className="font-medium text-slate-700">{skill.category}</span> • Proficiency: <span className="font-semibold text-blue-600">{skill.level}</span>
            </p>
          </div>

          {/* Confidence Score Pill */}
          <div className="text-right flex-shrink-0">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 font-mono">
                {skill.decay.currentConfidence}%
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Confidence</span>
            </div>
            {skill.decay.isDecayed && (
              <p className="text-[10px] text-amber-600 font-medium">
                Decayed from {skill.decay.originalConfidence}%
              </p>
            )}
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className={`h-full transition-all duration-500 ${
                skill.decay.currentConfidence >= 80 
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-500' 
                  : skill.decay.currentConfidence >= 60 
                  ? 'bg-gradient-to-r from-amber-500 to-blue-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${skill.decay.currentConfidence}%` }}
            />
          </div>

          {/* Sub-breakdown Indicators */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Tests: {skill.evidenceBreakdown.assessmentPct}%</span>
            <span>Projects: {skill.evidenceBreakdown.practicalProjectsPct}%</span>
            <span>Credentials: {skill.evidenceBreakdown.credentialsPct}%</span>
            {skill.evidenceBreakdown.industryEndorsementPct > 0 && (
              <span className="text-emerald-600 font-semibold">Industry: +{skill.evidenceBreakdown.industryEndorsementPct}%</span>
            )}
          </div>
        </div>

        {/* Skill Decay Alert & Micro-Refresher CTA */}
        {skill.decay.isDecayed && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-900">
                  Skill Decay Detected ({skill.decay.monthsSinceLastVerification} months inactive)
                </p>
                <p className="text-[11px] text-amber-700">
                  Confidence decreased by {skill.decay.decayPercentage}%. Complete a {skill.decay.recommendedRefresherTimeMinutes}-min refresher to restore full standing.
                </p>
              </div>
            </div>

            {onTakeRefresher && (
              <button
                onClick={() => onTakeRefresher(skill.skillId)}
                disabled={isRefresherLoading}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs flex-shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefresherLoading ? 'animate-spin' : ''}`} />
                <span>Quick Refresher</span>
              </button>
            )}
          </div>
        )}

        {/* Action Controls & Evidence Expander */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>{skill.evidenceItems.length} Evidence Artifacts</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onAddEvidence(skill.skillId)}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Verification Proof</span>
          </button>
        </div>
      </div>

      {/* Expandable Evidence Drawer */}
      {isExpanded && (
        <div className="bg-slate-50/80 px-4 sm:px-5 py-3 border-t border-slate-100 space-y-2 text-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cryptographically Anchored Proofs
          </p>
          <div className="space-y-2">
            {skill.evidenceItems.map((item) => (
              <div 
                key={item.id} 
                className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-md bg-slate-100">
                    {renderEvidenceIcon(item.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Verified by <span className="font-medium text-slate-600">{item.verifiedBy}</span> • {new Date(item.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.score !== undefined && (
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {item.score}%
                    </span>
                  )}
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="View external proof"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
