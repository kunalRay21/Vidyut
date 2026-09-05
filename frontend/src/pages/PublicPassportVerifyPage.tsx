import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  FileCheck, 
  GitBranch, 
  Sparkles,
  ArrowLeft,
  Building,
  GraduationCap
} from 'lucide-react';
import { SkillPassport, EvidenceItem } from '../features/passport/types';

export const PublicPassportVerifyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [passport, setPassport] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPassport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/passport/verify/${token}`);
        const json = await res.json();
        if (json.success && json.data) {
          setPassport(json.data);
        } else {
          setError(json.error || 'Credential could not be verified.');
        }
      } catch (err: any) {
        setError('Network error validating credential.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyPassport();
    }
  }, [token]);

  const renderEvidenceIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'GITHUB_REPOSITORY':
        return <GitBranch className="w-3.5 h-3.5 text-indigo-600" />;
      case 'DIAGNOSTIC_ASSESSMENT':
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'PRACTICAL_SIMULATION':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      case 'CERTIFICATE':
        return <Award className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <FileCheck className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold font-heading">
          Validating Cryptographic Credential Signature...
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Token: {token}
        </p>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Invalid Credential Record
          </h2>
          <p className="text-xs text-slate-500">
            {error || 'This credential verification link is invalid, revoked, or expired.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Vidyut Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Recruiter Verified Certificate Banner */}
        <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Saffron-Blue-Green Tricolor Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-500" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                Cryptographically Verified by Vidyut Trust Network
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                {passport.studentName}
              </h1>
              <p className="text-sm text-blue-300 font-medium mt-1">
                {passport.targetRole}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> {passport.institutionName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> {passport.degree}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 px-6 py-4 rounded-xl border border-slate-700/80 text-center sm:text-right flex-shrink-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Authenticity Confidence
              </p>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                {passport.overallAuthenticityScore}%
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {passport.totalVerifiedSkills} Verified Competencies
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span>Credential ID: <strong className="text-white">{passport.passportId}</strong></span>
            <span>Digital Signature: <strong className="text-slate-300">{passport.digitalSignature.slice(0, 32)}...</strong></span>
          </div>
        </div>

        {/* Verified Skills Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-white">
              Demonstrated & Verified Competencies ({passport.skills.length})
            </h2>
            <span className="text-xs text-slate-400">
              Evidence-weighted confidence ratings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passport.skills.map((skill) => (
              <div
                key={skill.skillId}
                className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">
                      {skill.skillName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {skill.category} • <strong className="text-blue-400">{skill.level}</strong>
                    </p>
                  </div>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {skill.decay.currentConfidence}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                    style={{ width: `${skill.decay.currentConfidence}%` }}
                  />
                </div>

                {/* Proof artifacts */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Supporting Proofs ({skill.evidenceItems.length}):
                  </p>
                  <div className="space-y-1 text-[11px]">
                    {skill.evidenceItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {renderEvidenceIcon(item.type)}
                          <span className="text-slate-300 truncate">{item.title}</span>
                        </div>
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                            title="Inspect external proof"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Last verified: {new Date(skill.lastVerifiedAt).toLocaleDateString()}</span>
                  <span className="text-slate-400">Authenticity: <strong className="text-slate-300">{skill.authenticityLevel.replace(/_/g, ' ')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-xs text-slate-400 space-y-2">
          <p>
            This cryptographic Skill Passport is an immutable academic and industry competency record anchored on the Vidyut platform.
          </p>
          <p className="text-[11px] text-slate-400">
            Issued under SIH Academia-Industry Skill Collaboration Standards.
          </p>
        </div>
      </div>
    </div>
  );
};
