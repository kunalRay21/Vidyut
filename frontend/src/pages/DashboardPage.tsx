import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadinessGauge } from '../features/dashboard/ReadinessGauge';
import { SkillStateList } from '../features/dashboard/SkillStateList';
import { DiscrepancyNotice } from '../features/dashboard/DiscrepancyNotice';
import { User, BookOpen, Target, GraduationCap } from 'lucide-react';
import { FadeIn } from '../components/animations/FadeIn';
import { useNavigate } from 'react-router-dom';
import { profileApi, getStoredUser } from '../services/api';

const DEFAULT_PROFILE = {
  full_name: 'Priya Sharma',
  institution: 'VIT Chennai',
  degree: 'B.Tech CSE',
  year_of_study: 2,
  selected_role: 'Machine Learning Engineer',
  readiness_pct: 14.0,
  skills: [
    { name: 'Programming Fundamentals', progress: 100, currentLevel: 4 },
    { name: 'Python', progress: 70, currentLevel: 3 },
    { name: 'SQL', progress: 20, currentLevel: 1 },
  ],
};

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [discrepancyMsg, setDiscrepancyMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      // 1. Check stored user cache first
      const stored = getStoredUser();
      if (stored) {
        setProfile((prev) => ({
          ...prev,
          full_name: stored.full_name || prev.full_name,
          institution: stored.institution || prev.institution,
          degree: stored.degree || prev.degree,
          year_of_study: stored.year_of_study || prev.year_of_study,
          readiness_pct: stored.readiness_pct !== undefined ? stored.readiness_pct : prev.readiness_pct,
        }));
      }

      // 2. Check assessment results cache for discrepancy messages
      const assessmentResultRaw = localStorage.getItem('assessment_result');
      if (assessmentResultRaw) {
        try {
          const parsed = JSON.parse(assessmentResultRaw);
          if (parsed.overall_accuracy_pct !== undefined) {
            setProfile((prev) => ({ ...prev, readiness_pct: parsed.overall_accuracy_pct }));
          }
          if (parsed.discrepancies && parsed.discrepancies.length > 0) {
            setDiscrepancyMsg(parsed.discrepancies[0].message);
          }
        } catch {
          // ignore
        }
      }

      // 3. Fetch live data from backend
      try {
        const profileRes = await profileApi.getMe();
        if (mounted && profileRes.success && profileRes.data) {
          const p = profileRes.data;
          setProfile((prev) => ({
            ...prev,
            full_name: p.full_name || prev.full_name,
            institution: p.institution || prev.institution,
            degree: p.degree || prev.degree,
            year_of_study: p.year_of_study || prev.year_of_study,
            selected_role: p.selected_role || prev.selected_role,
            readiness_pct: p.readiness_pct !== undefined ? p.readiness_pct : prev.readiness_pct,
          }));
        }

        const skillsRes = await profileApi.getSkills();
        if (mounted && skillsRes.success && skillsRes.data?.skills) {
          const mappedSkills = skillsRes.data.skills.map((s: any) => ({
            name: s.skill_name || s.name,
            progress: s.accuracy !== undefined ? Number(s.accuracy) : s.assessed_level === 'PROFICIENT' ? 85 : 40,
            currentLevel: s.assessed_level === 'EXPERT' ? 5 : s.assessed_level === 'PROFICIENT' ? 4 : s.assessed_level === 'INTERMEDIATE' ? 3 : 2,
          }));

          setProfile((prev) => ({
            ...prev,
            skills: mappedSkills.length > 0 ? mappedSkills : prev.skills,
            readiness_pct: skillsRes.data.readiness_pct !== undefined ? skillsRes.data.readiness_pct : prev.readiness_pct,
          }));
        }
      } catch (err) {
        console.warn('Live profile fetch error:', err);
      }
    }

    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <FadeIn delay={100}>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-2">{t('dashboard.welcome')}, {profile.full_name}</p>
        </header>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          {/* Profile Overview Card */}
          <FadeIn delay={200}>
            <div className="bg-[#FFFEF2] rounded-2xl shadow-sm border border-[#EAE3B3] p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 font-heading">{t('dashboard.careerGoalSummary')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-saffron/10 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-saffron" />
                  </div>
                  <span className="text-sm">{t('dashboard.targetRole')}: <strong className="text-gray-900">{profile.selected_role}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-[#000080]/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#000080]" />
                  </div>
                  <span className="text-sm">{t('dashboard.institution')}: <strong className="text-gray-900">{profile.institution}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-indiaGreen/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-indiaGreen" />
                  </div>
                  <span className="text-sm">{t('dashboard.degree')}: <strong className="text-gray-900">{profile.degree}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">{t('dashboard.year')}: <strong className="text-gray-900">{t('dashboard.year')} {profile.year_of_study}</strong></span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <DiscrepancyNotice message={discrepancyMsg || undefined} />
          </FadeIn>

          <FadeIn delay={400}>
            <div className="mt-6">
              <SkillStateList skills={profile.skills} />
            </div>
          </FadeIn>
        </div>

        <div className="col-span-1">
          <FadeIn delay={200}>
            <ReadinessGauge percentage={profile.readiness_pct} />
          </FadeIn>
          
          <FadeIn delay={300}>
            <div className="mt-6 bg-[#FFFEF2] rounded-2xl p-6 border border-[#EAE3B3] flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-[#000080] to-indiaGreen" />
              <h3 className="font-bold text-[#000080] mb-2 font-heading">{t('dashboard.nextMilestone')}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {t('dashboard.nextMilestoneDesc')}
              </p>
              <button 
                onClick={() => navigate('/roadmap')}
                className="w-full btn-saffron py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                {t('dashboard.goToRoadmap')}
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};
