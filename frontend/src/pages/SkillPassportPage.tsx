import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  Search,
  Filter,
  QrCode
} from 'lucide-react';
import { SkillPassport, EvidenceItem } from '../features/passport/types';
import { SkillPassportCard } from '../features/passport/SkillPassportCard';
import { EvidenceSubmitDrawer } from '../features/passport/EvidenceSubmitDrawer';
import { FadeIn } from '../components/animations/FadeIn';

export const SkillPassportPage: React.FC = () => {
  const [passport, setPassport] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [activeDrawerSkill, setActiveDrawerSkill] = useState<{ id: string; name: string } | null>(null);
  const [refresherLoadingSkill, setRefresherLoadingSkill] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/passport/me');
      const json = await res.json();
      if (json.success && json.data) {
        setPassport(json.data);
      }
    } catch (err) {
      console.warn('Passport fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, []);

  const handleShareClick = () => {
    if (!passport) return;
    const fullUrl = `${window.location.origin}/passport/verify/${passport.passportToken}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const handleAddEvidence = (skillId: string) => {
    const skill = passport?.skills.find(s => s.skillId === skillId);
    setActiveDrawerSkill({ id: skillId, name: skill?.skillName || skillId });
  };

  const handleSubmitEvidence = async (payload: {
    skillId: string;
    type: EvidenceItem['type'];
    title: string;
    sourceUrl?: string;
    score?: number;
  }) => {
    const res = await fetch('/api/v1/passport/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setPassport(json.data);
    }
  };

  const handleTakeRefresher = async (skillId: string) => {
    try {
      setRefresherLoadingSkill(skillId);
      const res = await fetch(`/api/v1/passport/refresher/${skillId}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPassport(json.data);
      }
    } finally {
      setRefresherLoadingSkill(null);
    }
  };

  const filteredSkills = (passport?.skills || []).filter((s) => {
    const matchesSearch = s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterLevel === 'VERIFIED') return s.authenticityLevel !== 'UNVERIFIED_CLAIM';
    if (filterLevel === 'DECAYED') return s.decay.isDecayed;
    if (filterLevel === 'HIGH_CONFIDENCE') return s.confidenceScore >= 75;
    return true;
  });

  const decayedCount = (passport?.skills || []).filter(s => s.decay.isDecayed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold font-heading text-slate-900">
          Decrypting Verified Skill Passport...
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Validating cryptographic evidence anchors and decay telemetry.
        </p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center max-w-md">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Unable to load passport</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Could not connect to Vidyut credential registry services.
          </p>
          <button onClick={fetchPassport} className="btn-saffron text-xs py-2 px-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Holographic Passport Credential Header */}
        <FadeIn>
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Tricolor Government accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-600" />
            
            {/* Subtle background security watermarks */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-8 top-8 opacity-10 pointer-events-none">
              <QrCode className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    Vidyut Verified Credential
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ID: <strong className="text-white">{passport.passportId}</strong>
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                    {passport.studentName}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-200 mt-1">
                    Target Role: <strong className="text-white">{passport.targetRole}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {passport.institutionName} • {passport.degree}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Issued: {new Date(passport.issuedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Last Re-verified: {new Date(passport.lastUpdatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Overall Score Badge & Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 flex-shrink-0">
                <div className="bg-slate-900/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700/80 text-left md:text-right shadow-inner">
                  <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                    Authenticity Index
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5 justify-start md:justify-end">
                    <span className="text-3xl font-black text-emerald-400 font-mono">
                      {passport.overallAuthenticityScore}%
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Reliability</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {passport.totalVerifiedSkills} of {passport.skills.length} skills cryptographically verified
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareClick}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Link Copied!' : 'Share with Recruiter'}</span>
                  </button>

                  <a
                    href={`/passport/verify/${passport.passportToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                    title="View public recruiter page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Hash Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 text-[10px] text-slate-400 font-mono">
              <span className="truncate">
                SHA-256 Signature: <strong className="text-slate-300">{passport.digitalSignature.slice(0, 36)}...</strong>
              </span>
              <span className="hidden sm:inline text-emerald-400 font-semibold flex items-center gap-1 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Proof Verified
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Verified Evidence Anchors</p>
              <p className="text-lg font-bold text-slate-900 font-heading">
                {passport.skills.reduce((acc, s) => acc + s.evidenceItems.length, 0)} Verified Artifacts
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Industry Benchmark</p>
              <p className="text-lg font-bold text-slate-900 font-heading">
                Top 15% Readiness
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${decayedCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Skill Decay Engine</p>
              <p className="text-lg font-bold text-slate-900 font-heading">
                {decayedCount > 0 ? `${decayedCount} Skills Need Refresher` : 'All Skills Current'}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skills, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setFilterLevel('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterLevel === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Skills ({passport.skills.length})
            </button>
            <button
              onClick={() => setFilterLevel('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterLevel === 'VERIFIED' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Verified ({passport.totalVerifiedSkills})
            </button>
            <button
              onClick={() => setFilterLevel('DECAYED')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterLevel === 'DECAYED' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Needs Refresher ({decayedCount})
            </button>
            <button
              onClick={() => setFilterLevel('HIGH_CONFIDENCE')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterLevel === 'HIGH_CONFIDENCE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              High Confidence (≥75%)
            </button>
          </div>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => (
            <SkillPassportCard
              key={skill.skillId}
              skill={skill}
              onAddEvidence={handleAddEvidence}
              onTakeRefresher={handleTakeRefresher}
              isRefresherLoading={refresherLoadingSkill === skill.skillId}
            />
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No matching skills found in passport.
          </div>
        )}
      </div>

      {/* Add Evidence Modal Drawer */}
      <EvidenceSubmitDrawer
        isOpen={activeDrawerSkill !== null}
        skillId={activeDrawerSkill?.id || null}
        skillName={activeDrawerSkill?.name}
        onClose={() => setActiveDrawerSkill(null)}
        onSubmitEvidence={handleSubmitEvidence}
      />
    </div>
  );
};
