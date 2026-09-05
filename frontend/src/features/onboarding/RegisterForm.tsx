import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  Target,
  FileCode,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { setStoredResume } from '../../services/api';
import { parseResumeFile, parseResumeText, ParsedResume } from '../../utils/resumeParser';
import { CustomDropdown } from '../../components/common/CustomDropdown';
import { CareerQuizModal, CareerSuggestion } from './CareerQuizModal';
import { careersApi } from '../../services/api';

export default function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    institution: '',
    degree: '',
    major: '',
    academic_branch_id: '',
    year_of_study: '',
    interests: '',
  });

  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [rawPastedText, setRawPastedText] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCareerQuizOpen, setIsCareerQuizOpen] = useState(false);
  const [careerSuggestion, setCareerSuggestion] = useState<CareerSuggestion | null>(null);

  React.useEffect(() => {
    async function loadBranches() {
      try {
        const res = await careersApi.getAcademicBranches();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setBranches(res.data);
          const cseBranch = res.data.find((b: any) => b.code === 'CSE');
          if (cseBranch) {
            setForm((prev) => ({ ...prev, academic_branch_id: cseBranch.id }));
          }
        }
      } catch (err) {
        console.warn('Academic branch fetch error:', err);
      }
    }
    loadBranches();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processResumeFile(file);
  };

  const processResumeFile = async (file: File) => {
    setResumeError('');
    setParsingResume(true);
    try {
      const parsed = await parseResumeFile(file);
      setParsedResume(parsed);
    } catch (err: any) {
      setResumeError(err.message || 'Failed to parse resume file.');
    } finally {
      setParsingResume(false);
    }
  };

  const handlePasteParse = () => {
    if (!rawPastedText.trim()) return;
    setResumeError('');
    setParsingResume(true);
    try {
      const parsed = parseResumeText(rawPastedText, 'Pasted_Resume.txt', rawPastedText.length);
      setParsedResume(parsed);
      setShowTextInput(false);
    } catch (err: any) {
      setResumeError(err.message || 'Failed to parse text resume.');
    } finally {
      setParsingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setParsedResume(null);
    setRawPastedText('');
    setResumeError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyCareer = (suggestion: CareerSuggestion) => {
    setCareerSuggestion(suggestion);
    setForm((prev) => ({
      ...prev,
      interests: suggestion.interestValue,
    }));
    setIsCareerQuizOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.institution.trim() ||
      !form.degree.trim() ||
      !form.major.trim() ||
      !form.year_of_study
    ) {
      setError('Please fill all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    const parsedInterests = form.interests
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const resumePayload = parsedResume
        ? {
            filename: parsedResume.fileName,
            raw_text: parsedResume.rawText,
            parsed_skills: parsedResume.extractedSkills,
            matched_role: parsedResume.primaryMatch.id,
            match_score: parsedResume.primaryMatch.matchPercentage,
            parsed_data: parsedResume,
          }
        : undefined;

      if (parsedResume) {
        setStoredResume(parsedResume);
      }

      const res = await registerStudent({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        institution: form.institution.trim(),
        degree: `${form.degree.trim()} ${form.major.trim()}`.trim(),
        academic_branch_id: form.academic_branch_id || undefined,
        year_of_study: Number(form.year_of_study),
        interests: parsedInterests,
        resume: resumePayload,
      });

      if (res.success) {
        navigate('/explore');
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-saffron/10 text-saffron flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold font-heading text-gray-900">
            {t('auth.registerTitle')}
          </h1>

          <p className="text-gray-600 text-sm mt-1">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.fullNameLabel')} *
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Priya Sharma"
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.emailLabel')} *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.passwordLabel')} *
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder')}
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters required</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.institutionLabel')} *
            </label>
            <input
              type="text"
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder={t('auth.institutionPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree *
              </label>
              <CustomDropdown
                name="degree"
                value={form.degree}
                onChange={(val) => setForm({ ...form, degree: val })}
                options={['B.Tech', 'BCA', 'MBA', 'MCA', 'B.Sc', 'M.Tech', 'Other']}
                placeholder="Select Degree"
                className="w-full px-2.5 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major / Branch *
              </label>
              {branches.length > 0 ? (
                <select
                  name="academic_branch_id"
                  value={form.academic_branch_id}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = branches.find((b: any) => b.id === selId);
                    setForm((prev) => ({
                      ...prev,
                      academic_branch_id: selId,
                      major: found ? found.code : prev.major,
                    }));
                  }}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
                >
                  <option value="">Select Branch...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              ) : (
                <CustomDropdown
                  name="major"
                  value={form.major}
                  onChange={(val) => setForm({ ...form, major: val })}
                  options={['CSE', 'ECE', 'MECHANICAL', 'CIVIL', 'IT', 'EEE', 'Other']}
                  placeholder="Select Major"
                  className="w-full px-2.5 py-1.5 text-sm"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.yearLabel')} *
              </label>
              <input
                type="number"
                name="year_of_study"
                value={form.year_of_study}
                onChange={handleChange}
                placeholder="2"
                min="1"
                max="6"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('auth.interestsLabel', 'Interests')} *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCareerQuizOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-saffron-700 hover:text-saffron-800 bg-saffron-50 hover:bg-saffron-100/80 px-2.5 py-0.5 rounded-full border border-saffron-200/80 transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-saffron" />
                  <span>Unsure? 1-Min Career Quiz</span>
                </button>
              </div>
              <CustomDropdown
                name="interests"
                value={form.interests}
                onChange={(val) => setForm({ ...form, interests: val })}
                options={['AI/ML', 'Backend', 'Frontend', 'Cloud', 'Data Science', 'Cyber Security', 'Other']}
                placeholder="Select Interest"
                className="w-full px-2.5 py-1.5 text-sm"
              />

              {careerSuggestion && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-900">{careerSuggestion.title}</span>
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                        {careerSuggestion.matchScore}% Match
                      </span>
                      <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug line-clamp-2">
                        {careerSuggestion.rationale}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCareerQuizOpen(true)}
                    className="text-[10px] font-bold text-emerald-700 hover:underline shrink-0 cursor-pointer pt-0.5"
                  >
                    Retake
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Optional Resume Upload Section */}
          <div className="border border-[#E0D8A8] bg-[#FDFBF2] rounded-xl p-4 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-saffron" />
                <span>Upload Resume</span>
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-matches Courses
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Upload your CV or resume to pre-calibrate your skills and filter the Explore catalog directly to courses matching your engineering role.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />

            {!parsedResume && !showTextInput && (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D2C896] hover:border-saffron rounded-lg p-4 text-center cursor-pointer bg-white/70 hover:bg-white transition group"
                >
                  <UploadCloud className="w-7 h-7 mx-auto text-gray-400 group-hover:text-saffron transition-colors mb-1.5" />
                  <p className="text-xs font-medium text-gray-700">
                    <span className="text-saffron font-bold">Click to browse</span> or drag & drop your resume
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Supports PDF, DOCX, TXT (up to 5MB)</p>
                </div>

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setShowTextInput(true)}
                    className="text-xs text-saffron hover:underline font-medium"
                  >
                    Or paste resume text instead
                  </button>
                </div>
              </div>
            )}

            {!parsedResume && showTextInput && (
              <div className="space-y-2">
                <textarea
                  value={rawPastedText}
                  onChange={(e) => setRawPastedText(e.target.value)}
                  placeholder="Paste your resume summary, skills list, and experience here..."
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron resize-none"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowTextInput(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteParse}
                    disabled={!rawPastedText.trim() || parsingResume}
                    className="btn-saffron text-xs py-1.5 px-3 rounded-md font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Analyze Resume Text
                  </button>
                </div>
              </div>
            )}

            {parsingResume && (
              <div className="flex items-center justify-center gap-2 py-4 bg-white/80 rounded-lg border border-amber-200 text-xs font-medium text-amber-900">
                <Loader2 className="w-4 h-4 animate-spin text-saffron" />
                <span>Extracting skills and matching engineering tracks...</span>
              </div>
            )}

            {resumeError && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {resumeError}
              </div>
            )}

            {parsedResume && (
              <div className="bg-white rounded-lg border border-emerald-200 p-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {parsedResume.fileName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {Math.round(parsedResume.fileSize / 1024)} KB · Parsed & Validated
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
                    title="Remove resume"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Match Banner */}
                <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-saffron" />
                      Matched Track:
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      {parsedResume.primaryMatch.matchPercentage}% Match
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#000080]">
                    {parsedResume.primaryMatch.title}
                  </p>

                  {/* Skills tags */}
                  {parsedResume.extractedSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {parsedResume.extractedSkills.slice(0, 6).map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded border border-gray-200"
                        >
                          {sk}
                        </span>
                      ))}
                      {parsedResume.extractedSkills.length > 6 && (
                        <span className="text-[10px] text-gray-500 px-1 py-0.5">
                          +{parsedResume.extractedSkills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Courses in Explore will automatically prioritize this specialization.</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-saffron py-3 rounded-lg font-semibold disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? t('auth.creatingAccount', 'Creating Account...') : t('auth.signUpBtn')}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          {t('auth.alreadyAccount')}{' '}
          <Link
            to="/login"
            className="text-saffron hover:underline font-semibold"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      </div>

      <CareerQuizModal
        isOpen={isCareerQuizOpen}
        onClose={() => setIsCareerQuizOpen(false)}
        onApplyCareer={handleApplyCareer}
      />
    </div>
  );
}
