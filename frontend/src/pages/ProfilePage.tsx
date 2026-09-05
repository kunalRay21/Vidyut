import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  ArrowRight,
  RefreshCw,
  Trash2,
  Edit3,
  Save,
  X,
  FileCode,
  Loader2,
  Compass,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi, getStoredResume, setStoredResume, clearStoredResume, setStoredUser } from '../services/api';
import { readResumeFile, parseResumeText, ParsedResume, DOMAIN_TAXONOMY } from '../utils/resumeParser';
import { FadeIn } from '../components/animations/FadeIn';

export function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile editable fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year_of_study || 3);
  const [interests, setInterests] = useState<string[]>(
    Array.isArray(user?.interests) ? user.interests : ['Backend & APIs', 'AI/ML']
  );
  const [newInterestInput, setNewInterestInput] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Resume state
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedResumeText, setPastedResumeText] = useState('');

  // Load profile & resume from API and cache on mount
  useEffect(() => {
    // Check cached resume first
    const cachedResume = getStoredResume();
    if (cachedResume) {
      setParsedResume(cachedResume);
    } else if (user?.resume_parsed_data) {
      setParsedResume(user.resume_parsed_data);
    } else if (user?.resume_filename && user?.resume_matched_role) {
      // Reconstruct minimal parsed resume from user state
      const fallbackMatch = DOMAIN_TAXONOMY[user.resume_matched_role] || DOMAIN_TAXONOMY['role-backend'];
      const minimalResume: ParsedResume = {
        fileName: user.resume_filename,
        fileSize: 153600,
        uploadedAt: new Date().toISOString(),
        rawText: '',
        extractedSkills: user.parsed_skills || [],
        educationSignals: [user.degree || 'Computer Science Engineering'],
        experienceSignals: ['Student Candidate'],
        primaryMatch: {
          id: fallbackMatch.id,
          title: fallbackMatch.title,
          category: fallbackMatch.category,
          matchPercentage: user.resume_match_score || 85,
          matchedSkills: user.parsed_skills || [],
          missingSkills: fallbackMatch.coreSkills.slice(0, 4),
        },
        allMatches: [],
        summary: `Resume parsed and matched to ${fallbackMatch.title}.`,
      };
      setParsedResume(minimalResume);
      setStoredResume(minimalResume);
    }

    // Fetch freshest data from backend
    async function fetchBackendProfile() {
      try {
        const res = await profileApi.getMe();
        if (res.success && res.data) {
          const d = res.data;
          if (d.full_name) setFullName(d.full_name);
          if (d.institution) setInstitution(d.institution);
          if (d.degree) setDegree(d.degree);
          if (d.year_of_study) setYearOfStudy(d.year_of_study);
          if (Array.isArray(d.interests)) setInterests(d.interests);

          if (d.resume_parsed_data) {
            setParsedResume(d.resume_parsed_data);
            setStoredResume(d.resume_parsed_data);
          } else if (d.resume_raw_text) {
            const parsed = parseResumeText(d.resume_raw_text, d.resume_filename || 'Resume.pdf');
            setParsedResume(parsed);
            setStoredResume(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not sync remote profile:', err);
      }
    }
    fetchBackendProfile();
  }, [user]);

  // Profile update handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');

    try {
      const payload = {
        full_name: fullName,
        institution,
        degree,
        year_of_study: Number(yearOfStudy),
        interests,
      };

      const res = await profileApi.updateProfile(payload);
      if (res.success) {
        setProfileSuccessMsg('Profile details saved successfully.');
        setIsEditingProfile(false);
        // Sync local stored user
        const currentStored = user || {};
        const updated = { ...currentStored, ...payload };
        setStoredUser(updated);
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert('Error updating profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddInterest = () => {
    if (!newInterestInput.trim()) return;
    if (!interests.includes(newInterestInput.trim())) {
      setInterests([...interests, newInterestInput.trim()]);
    }
    setNewInterestInput('');
  };

  const handleRemoveInterest = (tag: string) => {
    setInterests(interests.filter((i) => i !== tag));
  };

  // Resume Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUploadResume(file);
  };

  const processAndUploadResume = async (file: File) => {
    setUploadingResume(true);
    setResumeError('');

    try {
      const rawText = await readResumeFile(file);
      const parsed = parseResumeText(rawText, file.name, file.size);

      // Save locally
      setParsedResume(parsed);
      setStoredResume(parsed);

      // Save to backend
      await profileApi.uploadResume({
        filename: parsed.fileName,
        raw_text: parsed.rawText,
        parsed_skills: parsed.extractedSkills,
        matched_role: parsed.primaryMatch.id,
        match_score: parsed.primaryMatch.matchPercentage,
        parsed_data: parsed,
      });

      // Update stored user
      if (user) {
        const updated = {
          ...user,
          selected_role_id: parsed.primaryMatch.id,
          resume_filename: parsed.fileName,
          parsed_skills: parsed.extractedSkills,
          resume_matched_role: parsed.primaryMatch.id,
          resume_match_score: parsed.primaryMatch.matchPercentage,
          resume_parsed_data: parsed,
        };
        setStoredUser(updated);
      }

      setProfileSuccessMsg(`Resume parsed successfully! Best Match: ${parsed.primaryMatch.title}`);
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch (err: any) {
      setResumeError(err.message || 'Failed to process resume.');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasteResume = async () => {
    if (!pastedResumeText.trim()) return;
    setUploadingResume(true);
    setResumeError('');

    try {
      const parsed = parseResumeText(pastedResumeText, 'Pasted_Resume.txt', pastedResumeText.length);
      setParsedResume(parsed);
      setStoredResume(parsed);
      setShowPasteModal(false);

      await profileApi.uploadResume({
        filename: parsed.fileName,
        raw_text: parsed.rawText,
        parsed_skills: parsed.extractedSkills,
        matched_role: parsed.primaryMatch.id,
        match_score: parsed.primaryMatch.matchPercentage,
        parsed_data: parsed,
      });

      if (user) {
        const updated = {
          ...user,
          selected_role_id: parsed.primaryMatch.id,
          resume_filename: parsed.fileName,
          parsed_skills: parsed.extractedSkills,
          resume_matched_role: parsed.primaryMatch.id,
          resume_match_score: parsed.primaryMatch.matchPercentage,
          resume_parsed_data: parsed,
        };
        setStoredUser(updated);
      }

      setProfileSuccessMsg(`Resume parsed successfully! Best Match: ${parsed.primaryMatch.title}`);
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch (err: any) {
      setResumeError(err.message || 'Failed to parse pasted resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume? Your course recommendations will revert to default.')) {
      return;
    }

    try {
      await profileApi.deleteResume();
      clearStoredResume();
      setParsedResume(null);

      if (user) {
        const updated = { ...user };
        delete updated.resume_filename;
        delete updated.parsed_skills;
        delete updated.resume_matched_role;
        delete updated.resume_match_score;
        delete updated.resume_parsed_data;
        setStoredUser(updated);
      }

      setProfileSuccessMsg('Resume removed.');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Failed to delete resume: ' + err.message);
    }
  };

  const displayName = fullName || user?.full_name || 'Scholar Candidate';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <FadeIn>
        <div className="bg-gradient-to-r from-[#FFF4E5] via-[#FFFDF5] to-[#EBF6EC] border border-[#FFE0B2] rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-saffron text-white flex items-center justify-center font-heading font-black text-2xl shadow-md">
                {avatarInitial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-heading text-gray-900">{displayName}</h1>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-saffron/15 text-saffron-800 border border-saffron/30">
                    Student Scholar
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {degree ? `${degree} · ` : ''}{institution || 'Institution Scholar'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/dashboard"
                className="py-2 px-3.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:border-saffron transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>Dashboard</span>
              </Link>

              <Link
                to="/explore"
                className="btn-saffron py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Courses</span>
              </Link>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Main Grid: Left Column (Academic Info) & Right Column (Resume & Track Alignment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Academic & Personal Profile Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-saffron/10 text-saffron flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Academic Background</h2>
                  <p className="text-xs text-gray-500">Your institution & enrolled credentials</p>
                </div>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Full Name</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{displayName}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Email</span>
                  <p className="font-medium text-gray-700 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{user?.email || 'student@university.edu.in'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Institution</span>
                  <p className="font-medium text-gray-700 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>{institution || 'Not configured'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Degree Program</span>
                    <p className="font-medium text-gray-700 mt-0.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{degree || 'B.Tech CSE'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Year of Study</span>
                    <p className="font-medium text-gray-700 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Year {yearOfStudy}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Areas of Interest
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-saffron"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Institution / University</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-saffron"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Degree Program</label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-saffron"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Year of Study</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-saffron"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Interests</label>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      value={newInterestInput}
                      onChange={(e) => setNewInterestInput(e.target.value)}
                      placeholder="e.g. Distributed Systems"
                      className="flex-1 text-xs p-2 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-saffron"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="py-1.5 px-3 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(tag)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="py-2 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-saffron py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Info Callout */}
          <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-2xl p-4 text-xs text-amber-950">
            <h3 className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
              <Sparkles className="w-4 h-4 text-saffron" />
              <span>Standardized Technical Verification</span>
            </h3>
            <p className="text-amber-800 leading-relaxed">
              Your profile is coupled with tamper-evident diagnostic test assessments. Uploading a resume calibrates your benchmark scores and tailors the Explore catalog to your verified background.
            </p>
          </div>
        </div>

        {/* Right Column: Resume & Role Alignment Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Resume & Track Alignment</h2>
                  <p className="text-xs text-gray-500">Automated skill parsing and role match calibration</p>
                </div>
              </div>

              {parsedResume && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Parsed & Calibrated</span>
                </span>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />

            {uploadingResume && (
              <div className="my-6 p-6 text-center bg-amber-50/50 rounded-2xl border border-amber-200">
                <Loader2 className="w-8 h-8 animate-spin text-saffron mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">Analyzing Resume & Extracting Competencies...</p>
                <p className="text-xs text-gray-500 mt-1">
                  Scanning for 100+ technical frameworks, developer tools, and role taxonomies.
                </p>
              </div>
            )}

            {resumeError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resumeError}</span>
              </div>
            )}

            {/* When Resume is Uploaded */}
            {parsedResume && !uploadingResume && (
              <div className="mt-4 space-y-6">
                {/* File Header Bar */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-saffron flex items-center justify-center shrink-0 shadow-2xs">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{parsedResume.fileName}</p>
                      <p className="text-[11px] text-gray-500">
                        {Math.round(parsedResume.fileSize / 1024)} KB · Uploaded {new Date(parsedResume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-1.5 px-2.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:border-saffron transition flex items-center gap-1 cursor-pointer"
                      title="Replace Resume"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                      <span className="hidden sm:inline">Replace</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteResume}
                      className="py-1.5 px-2.5 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 transition flex items-center gap-1 cursor-pointer"
                      title="Remove Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>

                {/* Primary Role Match Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5F9F6] to-[#EFF6F0] border border-emerald-200 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        Top Career Match
                      </span>
                      <h3 className="text-lg font-bold text-[#000080] mt-0.5">
                        {parsedResume.primaryMatch.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-700">
                          {parsedResume.primaryMatch.matchPercentage}%
                        </span>
                        <span className="text-[10px] text-gray-500 block -mt-1 font-semibold">Match Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Detected Skills */}
                    <div>
                      <span className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Matched In Resume ({parsedResume.primaryMatch.matchedSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {parsedResume.primaryMatch.matchedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[11px] bg-white text-emerald-900 font-medium px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs"
                          >
                            {sk}
                          </span>
                        ))}
                        {parsedResume.primaryMatch.matchedSkills.length === 0 && (
                          <span className="text-xs text-gray-500 italic">No direct domain keywords detected</span>
                        )}
                      </div>
                    </div>

                    {/* Gap / Recommendations */}
                    <div>
                      <span className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-saffron" />
                        Recommended Next Steps
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {parsedResume.primaryMatch.missingSkills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[11px] bg-amber-50 text-amber-900 font-medium px-2 py-0.5 rounded-md border border-amber-200"
                          >
                            + {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this role */}
                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center gap-2">
                    <Link
                      to="/explore"
                      className="btn-saffron py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>Explore Tailored Courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to="/assessment/self"
                      state={{ selectedDomainId: parsedResume.primaryMatch.id, domainName: parsedResume.primaryMatch.title }}
                      className="py-2 px-3 rounded-lg bg-white border border-gray-200 hover:border-saffron text-xs font-semibold text-gray-800 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Award className="w-3.5 h-3.5 text-saffron" />
                      <span>Take Diagnostic Benchmark</span>
                    </Link>
                  </div>
                </div>

                {/* All Track Matches Breakdown */}
                {parsedResume.allMatches && parsedResume.allMatches.length > 1 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Cross-Track Compatibility Breakdown
                    </h3>
                    <div className="space-y-2">
                      {parsedResume.allMatches.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/70 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{m.title}</p>
                            <p className="text-[11px] text-gray-500">
                              {m.matchedSkills.length} skills matched · {m.category}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-saffron h-full rounded-full transition-all"
                                style={{ width: `${m.matchPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-800 w-8 text-right">
                              {m.matchPercentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* When NO Resume is Uploaded Yet */}
            {!parsedResume && !uploadingResume && (
              <div className="mt-4 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-saffron rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50 hover:bg-white transition group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-saffron/10 text-saffron flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Upload Your CV or Resume (PDF, DOCX, TXT)
                  </h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    Drag and drop your file here, or click to browse. Max size 5MB.
                  </p>
                  <button
                    type="button"
                    className="btn-saffron mt-4 py-2 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>Choose Resume File</span>
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-400">or</span>
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => setShowPasteModal(true)}
                      className="text-xs text-saffron hover:underline font-semibold"
                    >
                      Paste resume plain text directly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                    <span className="text-xs font-bold text-gray-900 block">⚡ Instant Match</span>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Detects your core languages, databases, and tooling instantly.
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                    <span className="text-xs font-bold text-gray-900 block">🎯 Filtered Explore</span>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Displays courses personalized to your matched role.
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                    <span className="text-xs font-bold text-gray-900 block">📊 Gap Analysis</span>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Highlights missing competencies to boost your employability.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paste Text Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Paste Resume Text</h3>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3">
              <textarea
                rows={8}
                value={pastedResumeText}
                onChange={(e) => setPastedResumeText(e.target.value)}
                placeholder="Paste your technical resume text, projects, and skills here..."
                className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="py-2 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasteResume}
                disabled={!pastedResumeText.trim() || uploadingResume}
                className="btn-saffron py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {uploadingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Analyze & Match Track</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
