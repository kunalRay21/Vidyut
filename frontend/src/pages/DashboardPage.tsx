import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReadinessGauge } from '../features/dashboard/ReadinessGauge';
import { SkillProgressCard } from '../features/dashboard/SkillProgressCard';
import { DiscrepancyNotice } from '../features/dashboard/DiscrepancyNotice';
import { FadeIn } from '../components/animations/FadeIn';
import { profileApi, getStoredUser, setStoredUser } from '../services/api';
import {
  User,
  BookOpen,
  Target,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
  Cloud,
  Code,
  Layers,
  ShieldCheck,
  Sparkles,
  PlayCircle,
  BarChart3,
} from 'lucide-react';

export interface CourseTrack {
  id: string;
  roleId: string;
  title: string;
  category: string;
  iconName: 'database' | 'cpu' | 'cloud' | 'code' | 'layers' | 'shield';
  description: string;
  technologies: string[];
  prerequisites: string;
  duration: string;
  milestonesCount: number;
}

const ALL_COURSES: CourseTrack[] = [
  {
    id: 'course-backend',
    roleId: 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208',
    title: 'Modern Backend & Distributed Systems',
    category: 'Software Engineering',
    iconName: 'database',
    description: 'Design and deploy scalable microservices, relational databases, REST APIs, and containerized cloud services.',
    technologies: ['Python', 'SQL & PostgreSQL', 'Docker', 'REST API', 'FastAPI'],
    prerequisites: 'Programming Fundamentals, Basic OOP',
    duration: '12 Weeks',
    milestonesCount: 10,
  },
  {
    id: 'course-ml',
    roleId: 'role-ml',
    title: 'Machine Learning & Applied AI',
    category: 'Artificial Intelligence',
    iconName: 'cpu',
    description: 'Build, evaluate, and deploy predictive models, computer vision systems, and automated data pipelines.',
    technologies: ['Python', 'NumPy & Pandas', 'Linear Algebra', 'Scikit-Learn', 'PyTorch'],
    prerequisites: 'Calculus, Linear Algebra, Python',
    duration: '14 Weeks',
    milestonesCount: 9,
  },
  {
    id: 'course-cloud',
    roleId: 'role-cloud',
    title: 'Cloud Native & DevOps Engineering',
    category: 'Cloud Infrastructure',
    iconName: 'cloud',
    description: 'Architect resilient serverless and containerized systems, configure CI/CD pipelines, and manage cloud clusters.',
    technologies: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS/GCP', 'Linux Shell'],
    prerequisites: 'Operating Systems, Networking, Git',
    duration: '10 Weeks',
    milestonesCount: 7,
  },
  {
    id: 'course-fullstack',
    roleId: 'role-fullstack',
    title: 'Full-Stack Web Systems',
    category: 'Web Development',
    iconName: 'code',
    description: 'Build interactive frontends and connect them to secure authentication backends and persistent databases.',
    technologies: ['TypeScript', 'React.js', 'Node.js', 'Tailwind CSS', 'SQL'],
    prerequisites: 'HTML/CSS, JavaScript Foundations',
    duration: '12 Weeks',
    milestonesCount: 8,
  },
  {
    id: 'course-data',
    roleId: 'role-data',
    title: 'Data Engineering & Big Data Analytics',
    category: 'Data Systems',
    iconName: 'layers',
    description: 'Construct resilient data pipelines, optimize ETL workflows, and prepare large-scale datasets for analytical modeling.',
    technologies: ['Advanced SQL', 'Python', 'Data Warehousing', 'ETL Architecture', 'Kafka'],
    prerequisites: 'Database Fundamentals, Python',
    duration: '11 Weeks',
    milestonesCount: 8,
  },
  {
    id: 'course-security',
    roleId: 'role-security',
    title: 'Cybersecurity & Secure Systems',
    category: 'Security & Defense',
    iconName: 'shield',
    description: 'Identify software vulnerabilities, implement cryptographic key exchange, and harden enterprise web applications.',
    technologies: ['Network Security', 'JWT & OAuth', 'OWASP Top 10', 'Linux Hardening', 'Cryptography'],
    prerequisites: 'Computer Networks, Operating Systems',
    duration: '10 Weeks',
    milestonesCount: 6,
  },
];

const renderCourseIcon = (iconName: string) => {
  switch (iconName) {
    case 'database': return <Database className="w-5 h-5 text-saffron" />;
    case 'cpu': return <Cpu className="w-5 h-5 text-emerald-600" />;
    case 'cloud': return <Cloud className="w-5 h-5 text-[#000080]" />;
    case 'code': return <Code className="w-5 h-5 text-purple-600" />;
    case 'layers': return <Layers className="w-5 h-5 text-teal-600" />;
    case 'shield': return <ShieldCheck className="w-5 h-5 text-blue-600" />;
    default: return <BookOpen className="w-5 h-5 text-gray-600" />;
  }
};

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Profile & dynamic skills state
  const [profile, setProfile] = useState(() => {
    const stored = getStoredUser();
    return {
      full_name: stored?.full_name || 'Student Candidate',
      institution: stored?.institution || 'National Engineering Institution',
      degree: stored?.degree || 'B.Tech / Computer Science & Engineering',
      year_of_study: stored?.year_of_study || 3,
      selected_role: stored?.selected_role || 'Backend Developer',
      selected_role_id: stored?.selected_role_id || 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208',
      readiness_pct: typeof stored?.readiness_pct === 'number' ? stored.readiness_pct : 0,
      skills: [] as Array<{ name: string; progress: number; currentLevel: number; category?: string }>,
    };
  });

  const [discrepancyMsg, setDiscrepancyMsg] = useState<string | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<any | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, any>>({});
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'EVALUATED' | 'AVAILABLE'>('ALL');
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'MASTERED' | 'DEVELOPING'>('ALL');

  // Load and synchronize dynamic live data
  const loadDashboardData = async () => {
    const stored = getStoredUser();
    const studentId = stored?.student_profile_id || stored?.id || stored?.student_id;
    const roleId = stored?.selected_role_id || 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208';

    // 1. Hydrate from cached stored user
    if (stored) {
      setProfile((prev) => ({
        ...prev,
        full_name: stored.full_name || prev.full_name,
        institution: stored.institution || prev.institution,
        degree: stored.degree || prev.degree,
        year_of_study: stored.year_of_study || prev.year_of_study,
        selected_role: stored.selected_role || prev.selected_role,
        selected_role_id: stored.selected_role_id || prev.selected_role_id,
        readiness_pct: stored.readiness_pct !== undefined ? stored.readiness_pct : prev.readiness_pct,
      }));
    }

    // 2. Hydrate from latest assessment result cache
    let cachedScoreData: any = null;
    const assessmentResultRaw = localStorage.getItem('assessment_result');
    if (assessmentResultRaw) {
      try {
        const parsed = JSON.parse(assessmentResultRaw);
        cachedScoreData = parsed;
        setLatestAssessment(parsed);

        if (parsed.overall_readiness_pct !== undefined || parsed.overall_accuracy_pct !== undefined) {
          const score = parsed.overall_readiness_pct !== undefined ? parsed.overall_readiness_pct : parsed.overall_accuracy_pct;
          setProfile((prev) => ({
            ...prev,
            readiness_pct: score,
            selected_role: parsed.test_title || prev.selected_role,
          }));
        }

        if (parsed.discrepancies && parsed.discrepancies.length > 0) {
          setDiscrepancyMsg(parsed.discrepancies[0].message);
        }

        // Map evaluated skill scores into profile skills
        if (Array.isArray(parsed.skill_scores) && parsed.skill_scores.length > 0) {
          const evaluatedSkills = parsed.skill_scores.map((s: any) => ({
            name: s.skill_name || s.name,
            progress: s.accuracy_pct !== undefined ? s.accuracy_pct : (s.accuracy !== undefined ? Number(s.accuracy) : 75),
            currentLevel: s.proficiency === 'EXPERT' ? 4 : s.proficiency === 'PROFICIENT' ? 3 : s.proficiency === 'INTERMEDIATE' ? 2 : 1,
            category: s.category || 'Core Skill',
          }));
          setProfile((prev) => ({
            ...prev,
            skills: evaluatedSkills,
          }));
        }
      } catch (err) {
        console.warn('Failed to parse assessment_result cache:', err);
      }
    }

    // 3. Hydrate multi-course history & progress map
    try {
      const historyRaw = localStorage.getItem('assessment_history');
      if (historyRaw) {
        setAssessmentHistory(JSON.parse(historyRaw));
      }
      const progressMapRaw = localStorage.getItem('course_progress_map');
      if (progressMapRaw) {
        setCourseProgressMap(JSON.parse(progressMapRaw));
      } else if (cachedScoreData) {
        // Synthesize initial entry from latest assessment
        const initMap: Record<string, any> = {};
        const key = cachedScoreData.role_id || roleId || 'bf9c3a6c-f0ec-4301-9e6b-c46d9fd50208';
        initMap[key] = {
          role_id: key,
          test_title: cachedScoreData.test_title || 'Modern Backend & Distributed Systems',
          accuracy: cachedScoreData.overall_accuracy_pct || 85,
          readiness: cachedScoreData.overall_readiness_pct || 86,
          completed_at: cachedScoreData.completed_at || new Date().toISOString(),
          status: 'COMPLETED',
        };
        setCourseProgressMap(initMap);
        localStorage.setItem('course_progress_map', JSON.stringify(initMap));
      }
    } catch (e) {
      console.warn('History/progress map hydration warning:', e);
    }

    // 4. Fetch live data from backend
    try {
      const profileRes = await profileApi.getMe();
      if (profileRes.success && profileRes.data) {
        const p = profileRes.data;
        setProfile((prev) => ({
          ...prev,
          full_name: p.full_name || prev.full_name,
          institution: p.institution || prev.institution,
          degree: p.degree || prev.degree,
          year_of_study: p.year_of_study || prev.year_of_study,
          selected_role: p.selected_role || prev.selected_role,
          selected_role_id: p.selected_role_id || prev.selected_role_id,
          readiness_pct: p.readiness_pct !== undefined ? p.readiness_pct : prev.readiness_pct,
        }));
      }

      // Fetch evaluated skills with studentId and roleId
      const skillsRes = await profileApi.getSkills(studentId, roleId);
      if (skillsRes.success && skillsRes.data?.skills && skillsRes.data.skills.length > 0) {
        const mappedSkills = skillsRes.data.skills.map((s: any) => ({
          name: s.skill_name || s.name,
          progress: s.accuracy !== undefined && Number(s.accuracy) > 0 
            ? Number(s.accuracy) 
            : (s.assessed_level === 'PROFICIENT' ? 85 : s.assessed_level === 'INTERMEDIATE' ? 65 : 40),
          currentLevel: s.assessed_level === 'EXPERT' ? 4 : s.assessed_level === 'PROFICIENT' ? 3 : s.assessed_level === 'INTERMEDIATE' ? 2 : 1,
          category: s.category || 'Curriculum Milestone',
        }));

        setProfile((prev) => ({
          ...prev,
          skills: mappedSkills,
          readiness_pct: skillsRes.data.readiness_pct !== undefined && skillsRes.data.readiness_pct > 0 
            ? skillsRes.data.readiness_pct 
            : prev.readiness_pct,
        }));
      }
    } catch (err) {
      console.warn('Backend live sync warning:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle switching active course track
  const handleSwitchCourse = (course: CourseTrack) => {
    const updated = {
      ...getStoredUser(),
      selected_role_id: course.roleId,
      selected_role: course.title,
    };
    setStoredUser(updated);

    setProfile((prev) => ({
      ...prev,
      selected_role: course.title,
      selected_role_id: course.roleId,
    }));

    // Update backend asynchronously
    profileApi.updateProfile({ selected_role_id: course.roleId }).catch(() => {});
  };

  // Start assessment for a specific course
  const handleStartCourseAssessment = (course: CourseTrack) => {
    handleSwitchCourse(course);
    navigate('/assessment/quiz');
  };

  // Filter courses for multi-course hub
  const filteredCourses = ALL_COURSES.filter((c) => {
    const isEvaluated = !!courseProgressMap[c.roleId] || !!courseProgressMap[c.id] || (c.roleId === profile.selected_role_id && profile.readiness_pct > 0);
    if (courseFilter === 'EVALUATED') return isEvaluated;
    if (courseFilter === 'AVAILABLE') return !isEvaluated;
    return true;
  });

  // Filter skills
  const filteredSkills = profile.skills.filter((s) => {
    if (skillFilter === 'MASTERED') return s.progress >= 70 || s.currentLevel >= 3;
    if (skillFilter === 'DEVELOPING') return s.progress < 70 && s.currentLevel < 3;
    return true;
  });

  const totalMasteredCount = profile.skills.filter((s) => s.progress >= 70 || s.currentLevel >= 3).length;
  const totalCoursesEvaluated = Object.keys(courseProgressMap).length || (profile.readiness_pct > 0 ? 1 : 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:px-12 space-y-8">
      {/* 1. Header with Official GovTech Branding */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <FadeIn delay={100} className="flex-1 min-w-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 text-saffron-700 text-xs font-bold uppercase tracking-wider mb-2 border border-saffron/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              National Skill Calibration & Progression Hub
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('dashboard.welcome', 'Welcome back')}, {profile.full_name}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {profile.institution} • {profile.degree} • Year {profile.year_of_study}
            </p>
          </div>
        </FadeIn>

        {/* Quick Actions Strip */}
        <FadeIn delay={200} className="shrink-0 flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/profile')}
            className="py-2 px-3 text-xs font-bold rounded-xl border border-gray-300 hover:border-saffron bg-white text-gray-800 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile & Resume</span>
          </button>
          <button
            onClick={() => navigate('/roadmap')}
            className="py-2 px-3 text-xs font-bold rounded-xl border border-gray-300 hover:border-saffron bg-white text-gray-800 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#000080]" />
            <span>View Roadmap</span>
          </button>
          <button
            onClick={() => navigate('/assessment/quiz')}
            className="btn-saffron py-2 px-3 text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Take Diagnostic Test</span>
          </button>
        </FadeIn>
      </header>

      {/* 2. Top Metric KPI Strip */}
      <FadeIn delay={150}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>Verified Readiness</span>
              <Award className="w-4 h-4 text-saffron" />
            </div>
            <p className="text-2xl font-black text-gray-900 font-mono">
              {profile.readiness_pct}%
            </p>
            <span className="text-[11px] text-emerald-700 font-medium">
              {profile.readiness_pct >= 70 ? '✓ Ready Now' : profile.readiness_pct >= 45 ? '⚡ Almost Ready' : '• Foundational Stage'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>Courses Evaluated</span>
              <BookOpen className="w-4 h-4 text-[#000080]" />
            </div>
            <p className="text-2xl font-black text-gray-900 font-mono">
              {totalCoursesEvaluated} <span className="text-xs font-normal text-gray-400">/ 6</span>
            </p>
            <span className="text-[11px] text-gray-500 font-medium">Across Engineering Tracks</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>Mastered Skills</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-gray-900 font-mono">
              {totalMasteredCount}
            </p>
            <span className="text-[11px] text-emerald-700 font-medium">Proficient & Expert</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>Active Specialization</span>
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-sm font-bold text-gray-900 truncate mt-1">
              {profile.selected_role}
            </p>
            <span className="text-[11px] text-purple-700 font-medium">Topological DAG Active</span>
          </div>
        </div>
      </FadeIn>

      {/* 3. Primary Enrolled Course & Readiness Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Career Goal Summary & Discrepancies */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={200}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-[#000080] to-emerald-600" />

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 font-heading">
                  Active Career Track Calibration
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Primary Specialization
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-saffron/15 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-saffron" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Target Role</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{profile.selected_role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-[#000080]/15 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#000080]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Academic Institution</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{profile.institution}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Degree & Major</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{profile.degree}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-purple-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Academic Year</p>
                    <p className="text-sm font-bold text-gray-900">Year {profile.year_of_study} Undergraduate</p>
                  </div>
                </div>
              </div>

              {/* Latest Diagnostic Test Performance Snippet */}
              {latestAssessment && (
                <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Diagnostic Assessment Calibrated: {latestAssessment.test_title || profile.selected_role}
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Accuracy: {latestAssessment.overall_accuracy_pct}% • {latestAssessment.correct_answers} of {latestAssessment.total_questions} questions verified
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>View Calibrated DAG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Calibration Discrepancy Notice */}
          {discrepancyMsg && (
            <FadeIn delay={250}>
              <DiscrepancyNotice message={discrepancyMsg} />
            </FadeIn>
          )}
        </div>

        {/* Right Column: Liquid Readiness Gauge Card */}
        <div className="lg:col-span-1 space-y-6">
          <FadeIn delay={200} className="h-full">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col items-center justify-between h-full">
              <ReadinessGauge percentage={profile.readiness_pct} />

              <div className="mt-4 w-full pt-4 border-t border-gray-100 flex flex-col gap-2">
                <button
                  onClick={() => navigate('/roadmap')}
                  className="w-full btn-saffron py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Explore Adaptive Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/assessment/quiz')}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                >
                  Retake Diagnostic Test
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* 4. Multi-Course Curriculum Hub (All Courses Student Can Take / Has Taken) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight font-heading">
              Curriculum Tracks & Enrolled Specializations
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Empirically evaluate and calibrate your readiness across multiple engineering disciplines.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCourseFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                courseFilter === 'ALL'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Courses ({ALL_COURSES.length})
            </button>
            <button
              onClick={() => setCourseFilter('EVALUATED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                courseFilter === 'EVALUATED'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Evaluated
            </button>
            <button
              onClick={() => setCourseFilter('AVAILABLE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                courseFilter === 'AVAILABLE'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Available
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course, idx) => {
            const progressData = courseProgressMap[course.roleId] || courseProgressMap[course.id];
            const isActive = course.roleId === profile.selected_role_id || course.title === profile.selected_role;
            const score = progressData?.readiness || progressData?.accuracy || (isActive ? profile.readiness_pct : 0);
            const isEvaluated = !!progressData || (isActive && profile.readiness_pct > 0);

            return (
              <FadeIn key={course.id} delay={100 + idx * 50}>
                <div
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between h-full p-5 shadow-xs hover:shadow-md ${
                    isActive ? 'border-saffron ring-2 ring-saffron/20' : 'border-gray-200'
                  }`}
                >
                  <div>
                    {/* Header: Icon & Category */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          {renderCourseIcon(course.iconName)}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                            {course.category}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 leading-snug">
                            {course.title}
                          </h3>
                        </div>
                      </div>

                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-saffron text-white shrink-0 shadow-2xs">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Technologies Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {tech}
                        </span>
                      ))}
                      {course.technologies.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400">
                          +{course.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Score / Progress Banner */}
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">Calibration Status</span>
                        {isEvaluated ? (
                          <span className="font-bold text-emerald-800 font-mono">
                            {score}% Ready
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-medium">
                            Not Calibrated
                          </span>
                        )}
                      </div>

                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            score >= 70 ? 'bg-emerald-600' : score > 0 ? 'bg-saffron' : 'bg-gray-300'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5">
                        <span>{course.duration}</span>
                        <span>{course.milestonesCount} Milestones</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    {isEvaluated ? (
                      <>
                        <button
                          onClick={() => {
                            handleSwitchCourse(course);
                            navigate('/roadmap');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#000080] hover:bg-[#1E3A8A] transition-colors inline-flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Roadmap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStartCourseAssessment(course)}
                          className="py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                          title="Retake diagnostic test for this track"
                        >
                          Retake
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStartCourseAssessment(course)}
                        className="w-full btn-saffron py-2 px-3 rounded-xl text-xs font-bold shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Start Diagnostic Test</span>
                      </button>
                    )}

                    {!isActive && (
                      <button
                        onClick={() => handleSwitchCourse(course)}
                        className="p-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-[#000080] hover:bg-blue-50 border border-gray-200 transition-colors cursor-pointer"
                        title="Set as active career track"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* 5. Verified Skill Matrix Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight font-heading">
              Verified Skill Matrix ({profile.skills.length} Evaluated)
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Empirical mastery demonstrated through diagnostic code executions and conceptual evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSkillFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                skillFilter === 'ALL'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Skills ({profile.skills.length})
            </button>
            <button
              onClick={() => setSkillFilter('MASTERED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                skillFilter === 'MASTERED'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Mastered ({totalMasteredCount})
            </button>
            <button
              onClick={() => setSkillFilter('DEVELOPING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                skillFilter === 'DEVELOPING'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Developing ({profile.skills.length - totalMasteredCount})
            </button>
          </div>
        </div>

        {filteredSkills.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center space-y-3 shadow-xs">
            <Award className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">No Evaluated Skills in this Filter</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Complete your diagnostic calibration quiz to automatically populate your empirically verified skill matrix.
            </p>
            <button
              onClick={() => navigate('/assessment/quiz')}
              className="btn-saffron text-xs py-2 px-4 font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Diagnostic Assessment</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => (
              <SkillProgressCard key={skill.name} skill={skill} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Diagnostic Assessment History */}
      {assessmentHistory.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight font-heading">
              Recent Assessment Session Records
            </h2>
            <p className="text-gray-500 text-xs">
              Verified test logs recorded in your empirical learner record.
            </p>
          </div>

          <div className="space-y-3">
            {assessmentHistory.map((item, i) => (
              <div
                key={item.session_id || i}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {item.test_title || 'Diagnostic Calibration Session'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Completed: {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'Recent'} • {item.correct_answers || 12} of {item.total_questions || 15} correct
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-base font-black font-mono text-emerald-800">
                      {item.overall_accuracy_pct}% Accuracy
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Verified Empirical
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/roadmap')}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    View Roadmap
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
