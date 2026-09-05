import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Route as RouteIcon,
  Briefcase,
  Building2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Cloud,
  Code,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { FadeIn } from '../components/animations/FadeIn';

interface CourseTrack {
  id: string;
  roleId: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  technologies: string[];
  prerequisites: string;
  duration: string;
}

const FEATURED_COURSES: CourseTrack[] = [
  {
    id: 'course-backend',
    roleId: 'role-backend',
    title: 'Modern Backend & Distributed Systems',
    category: 'Software Engineering',
    icon: <Database className="w-5 h-5 text-saffron-600" />,
    description: 'Design and deploy scalable microservices, relational databases, REST APIs, and containerized cloud services.',
    technologies: ['Python', 'SQL & PostgreSQL', 'Docker', 'REST API', 'FastAPI'],
    prerequisites: 'Programming Fundamentals, Basic OOP',
    duration: '12 Weeks · 8 Milestones',
  },
  {
    id: 'course-ml',
    roleId: 'role-ml',
    title: 'Machine Learning & Applied AI',
    category: 'Artificial Intelligence',
    icon: <Cpu className="w-5 h-5 text-indiaGreen" />,
    description: 'Build, evaluate, and deploy predictive models, computer vision systems, and automated data pipelines.',
    technologies: ['Python', 'NumPy & Pandas', 'Linear Algebra', 'Scikit-Learn', 'PyTorch'],
    prerequisites: 'Calculus, Linear Algebra, Python',
    duration: '14 Weeks · 9 Milestones',
  },
  {
    id: 'course-cloud',
    roleId: 'role-cloud',
    title: 'Cloud Native & DevOps Engineering',
    category: 'Cloud Infrastructure',
    icon: <Cloud className="w-5 h-5 text-[#000080]" />,
    description: 'Architect resilient serverless and containerized systems, configure CI/CD pipelines, and manage cloud clusters.',
    technologies: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS/GCP', 'Linux Shell'],
    prerequisites: 'Operating Systems, Networking, Git',
    duration: '10 Weeks · 7 Milestones',
  },
  {
    id: 'course-fullstack',
    roleId: 'role-fullstack',
    title: 'Full-Stack Web Systems',
    category: 'Web Development',
    icon: <Code className="w-5 h-5 text-saffron-600" />,
    description: 'Build interactive frontends and connect them to secure authentication backends and persistent databases.',
    technologies: ['TypeScript', 'React.js', 'Node.js', 'Tailwind CSS', 'SQL'],
    prerequisites: 'HTML/CSS, JavaScript Foundations',
    duration: '12 Weeks · 8 Milestones',
  },
  {
    id: 'course-data',
    roleId: 'role-data',
    title: 'Data Engineering & Big Data Analytics',
    category: 'Data Systems',
    icon: <Layers className="w-5 h-5 text-indiaGreen" />,
    description: 'Construct resilient data pipelines, optimize ETL workflows, and prepare large-scale datasets for analytical modeling.',
    technologies: ['Advanced SQL', 'Python', 'Data Warehousing', 'ETL Architecture', 'Kafka'],
    prerequisites: 'Database Fundamentals, Python',
    duration: '11 Weeks · 7 Milestones',
  },
  {
    id: 'course-security',
    roleId: 'role-security',
    title: 'Cybersecurity & Secure Systems',
    category: 'Security & Defense',
    icon: <ShieldCheck className="w-5 h-5 text-[#000080]" />,
    description: 'Identify software vulnerabilities, implement cryptographic key exchange, and harden enterprise web applications.',
    technologies: ['Network Security', 'JWT & OAuth', 'OWASP Top 10', 'Linux Hardening', 'Cryptography'],
    prerequisites: 'Computer Networks, Operating Systems',
    duration: '10 Weeks · 6 Milestones',
  },
];

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelectCourse = (course: CourseTrack) => {
    navigate('/assessment/self', {
      state: { selectedDomainId: course.roleId, domainName: course.title },
    });
  };

  return (
    <div className="w-full bg-[#FAFAF9] text-gray-900 selection:bg-saffron/30 selection:text-gray-950">
      {/* =========================================================================
          HERO SECTION (Tricolor Ambient Glow, Interactive Live Card)
      ========================================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-gray-200/60">
        {/* Soft Tricolor Ambient Backdrops */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 translate-x-1/2 w-96 h-96 bg-indiaGreen/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-blue-50/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

          {/* Main Hero Headline */}
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight text-gray-950 max-w-5xl leading-[1.12]">
              {t('landing.hero.titlePrefix')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-[#000080] to-indiaGreen">
                {t('landing.hero.titleHighlight')}
              </span>
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={180}>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mt-6 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
          </FadeIn>

          {/* Action CTAs */}
          <FadeIn delay={260}>
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
              <Link
                to="/assessment/self"
                className="btn-saffron text-sm px-6 py-3.5 rounded-full font-bold shadow-sm hover:shadow-md transition flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{t('landing.hero.startDiagnostic')}</span>
              </Link>

              <a
                href="#courses-section"
                className="text-sm px-6 py-3.5 rounded-full border border-gray-300 bg-white hover:border-gray-400 text-gray-800 font-semibold shadow-2xs hover:bg-gray-50 transition flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-saffron" />
                <span>{t('landing.hero.exploreCourses')}</span>
              </a>

              <Link
                to="/dashboard"
                className="text-sm px-5 py-3.5 rounded-full text-gray-700 hover:text-gray-950 font-semibold hover:bg-black/[0.03] transition flex items-center gap-1.5"
              >
                <span>{t('landing.hero.studentDashboard')}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </FadeIn>

          {/* Hero Live Stat Snapshot Strip */}
          <FadeIn delay={340}>
            <div className="w-full max-w-4xl mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-saffron-600 text-xs font-bold mb-1">
                  <Database className="w-4 h-4" />
                  <span>{t('landing.stats.curatedDags')}</span>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{t('landing.stats.curatedDagsVal')}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{t('landing.stats.curatedDagsDesc')}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-indiaGreen text-xs font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('landing.stats.diagnostic')}</span>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{t('landing.stats.diagnosticVal')}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{t('landing.stats.diagnosticDesc')}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-[#000080] text-xs font-bold mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{t('landing.stats.nep')}</span>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{t('landing.stats.nepVal')}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{t('landing.stats.nepDesc')}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{t('landing.stats.opp')}</span>
                </div>
                <p className="text-xl font-extrabold text-gray-900">{t('landing.stats.oppVal')}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{t('landing.stats.oppDesc')}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: WHY VIDYUT? (The Core Mission & 3-Way Ecosystem)
      ========================================================================== */}
      <section className="py-16 md:py-24 bg-white border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Minimal Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-950 tracking-tight">
              {t('landing.mission.title')}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed">
              {t('landing.mission.subtitle')}
            </p>
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Students */}
            <FadeIn delay={100} className="h-full">
              <div className="bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-7 hover:border-saffron/60 transition-all duration-300 h-full flex flex-col justify-between hover:shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-saffron/10 text-saffron-600 flex items-center justify-center text-xl mb-5">
                    <RouteIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-700">
                    {t('landing.mission.studentsTitle')}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">
                    {t('landing.mission.studentsHeading')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t('landing.mission.studentsDesc')}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-xs font-bold text-saffron-700">
                  <Link to="/roadmap" className="hover:underline flex items-center gap-1">
                    <span>{t('landing.mission.viewRoadmap')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Pillar 2: Industry */}
            <FadeIn delay={200} className="h-full">
              <div className="bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-7 hover:border-indiaGreen/60 transition-all duration-300 h-full flex flex-col justify-between hover:shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indiaGreen/10 text-indiaGreen flex items-center justify-center text-xl mb-5">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indiaGreen">
                    {t('landing.mission.industryTitle')}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">
                    {t('landing.mission.industryHeading')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t('landing.mission.industryDesc')}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-xs font-bold text-indiaGreen">
                  <Link to="/industry/onboard" className="hover:underline flex items-center gap-1">
                    <span>{t('landing.mission.viewIndustry')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Pillar 3: Institutions */}
            <FadeIn delay={300} className="h-full">
              <div className="bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-7 hover:border-[#000080]/60 transition-all duration-300 h-full flex flex-col justify-between hover:shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#000080] flex items-center justify-center text-xl mb-5">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#000080]">
                    {t('landing.mission.institutionTitle')}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">
                    {t('landing.mission.institutionHeading')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t('landing.mission.institutionDesc')}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-xs font-bold text-[#000080]">
                  <Link to="/institution/dashboard" className="hover:underline flex items-center gap-1">
                    <span>{t('landing.mission.viewInstitution')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COURSES & SKILL DOMAINS SECTION (Redesigned Minimal Headers & High-Value Cards)
      ========================================================================== */}
      <section id="courses-section" className="py-16 md:py-24 bg-[#FAFAF9] border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Minimal Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-950 tracking-tight">
                {t('landing.courses.heading')}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                {t('landing.courses.subtitle')}
              </p>
            </div>

            <Link
              to="/explore"
              className="text-xs font-bold text-saffron-700 hover:text-saffron-800 hover:underline flex items-center gap-1 shrink-0 self-start md:self-auto"
            >
              <span>{t('landing.courses.viewTaxonomy')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Minimal, Sleek Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_COURSES.map((course, idx) => (
              <FadeIn key={course.id} delay={100 + idx * 80} className="h-full">
                <div className="relative bg-white border border-gray-200/85 rounded-2xl p-6 hover:border-saffron-500/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between group overflow-hidden">
                  {/* Tricolor Accent Line on Hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-[#000080] to-indiaGreen opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Minimal Card Header */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                          {course.icon}
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {course.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wide shrink-0">
                        Verified DAG
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#000080] transition-colors leading-snug">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    {/* Prerequisite Footnote */}
                    <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-700">{t('landing.courses.prerequisites')}:</span> {course.prerequisites}
                    </div>

                    {/* Technology Chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {course.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">{course.duration}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectCourse(course)}
                      className="text-xs font-bold text-saffron-700 group-hover:text-saffron-800 flex items-center gap-1 cursor-pointer transition-transform group-hover:translate-x-1"
                    >
                      <span>{t('landing.courses.startPath')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE VIDYUT 4-STEP ADAPTIVE ENGINE (How It Works)
      ========================================================================== */}
      <section className="py-16 md:py-24 bg-white border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Minimal Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-950 tracking-tight">
              {t('landing.engine.heading')}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed">
              {t('landing.engine.subtitle')}
            </p>
          </div>

          {/* 4 Pipeline Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <FadeIn delay={100}>
              <div className="relative bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-saffron/10 text-saffron-600 font-black flex items-center justify-center text-sm mb-4">
                    01
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">
                    {t('landing.engine.step1Title')}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {t('landing.engine.step1Desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-semibold text-saffron-700">
                  {t('landing.engine.step1Tag')}
                </div>
              </div>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn delay={200}>
              <div className="relative bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 font-black flex items-center justify-center text-sm mb-4">
                    02
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">
                    {t('landing.engine.step2Title')}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {t('landing.engine.step2Desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-semibold text-amber-700">
                  {t('landing.engine.step2Tag')}
                </div>
              </div>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn delay={300}>
              <div className="relative bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#000080] font-black flex items-center justify-center text-sm mb-4">
                    03
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">
                    {t('landing.engine.step3Title')}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {t('landing.engine.step3Desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-semibold text-[#000080]">
                  {t('landing.engine.step3Tag')}
                </div>
              </div>
            </FadeIn>

            {/* Step 4 */}
            <FadeIn delay={400}>
              <div className="relative bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indiaGreen/10 text-indiaGreen font-black flex items-center justify-center text-sm mb-4">
                    04
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">
                    {t('landing.engine.step4Title')}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {t('landing.engine.step4Desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-semibold text-indiaGreen">
                  {t('landing.engine.step4Tag')}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM ECOSYSTEM CALL-TO-ACTION BANNER
      ========================================================================== */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-saffron/15 via-[#FFFBF0] to-indiaGreen/15 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-950 tracking-tight">
            {t('landing.ctaBanner.heading')}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            {t('landing.ctaBanner.subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <Link
              to="/assessment/self"
              className="btn-saffron text-sm px-6 py-3.5 rounded-full font-bold shadow-xs hover:shadow-md transition"
            >
              {t('landing.ctaBanner.takeAssessment')}
            </Link>
            <Link
              to="/industry/onboard"
              className="text-sm px-6 py-3.5 rounded-full border border-gray-300 bg-white hover:border-gray-400 text-gray-800 font-semibold shadow-2xs hover:bg-gray-50 transition"
            >
              {t('landing.ctaBanner.employerReg')}
            </Link>
            <Link
              to="/institution/dashboard"
              className="text-sm px-6 py-3.5 rounded-full border border-[#000080]/30 text-[#000080] bg-blue-50/50 hover:bg-blue-50 font-semibold transition"
            >
              {t('landing.ctaBanner.collegePortal')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
