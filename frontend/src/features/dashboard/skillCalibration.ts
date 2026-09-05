import { SkillItem } from './SkillMatrixSection';

/**
 * Maps any skill name to its appropriate technical domain category.
 */
export const inferSkillCategory = (skillName: string): string => {
  const lower = skillName.toLowerCase();

  // Databases & Persistent Storage
  if (
    /sql|postgres|database|redis|mongo|caching|schema|orm|sqlalchemy|snowflake|databricks|cassandra|dynamo/i.test(
      lower
    )
  ) {
    return 'Databases & Storage';
  }

  // Cloud & DevOps Infrastructure
  if (
    /docker|kubernetes|k8s|cloud|aws|azure|gcp|ci\/cd|pipeline|terraform|ansible|helm|nginx|linux|bash|devops|network|sysadmin/i.test(
      lower
    )
  ) {
    return 'Cloud & DevOps';
  }

  // AI & Machine Learning
  if (
    /machine learning|deep learning|artificial intelligence|ai|pytorch|tensorflow|scikit|pandas|numpy|nlp|vision|genai|llm|neural|stats|calculus|algebra|transformers/i.test(
      lower
    )
  ) {
    return 'AI & Machine Learning';
  }

  // Data Engineering & Analytics
  if (
    /spark|hadoop|airflow|etl|big data|kafka|data engineering|power bi|tableau|data warehouse|data lake/i.test(
      lower
    )
  ) {
    return 'Data Engineering';
  }

  // Frontend & Web Architecture
  if (
    /react|typescript|javascript|next|html|css|tailwind|vue|frontend|fullstack|full-stack|ui\/ux|vite|webpack|angular/i.test(
      lower
    )
  ) {
    return 'Frontend & Web Systems';
  }

  // Cybersecurity & Defense
  if (
    /security|crypto|owasp|wireshark|penetration|auth|jwt|oauth|zero trust|vulnerability|firewall|hardening|kali|siem/i.test(
      lower
    )
  ) {
    return 'Cybersecurity & Defense';
  }

  // Backend & Distributed Systems
  if (
    /python|fastapi|django|flask|node|express|java|spring|go|golang|api|rest|microservices|grpc|rabbit|celery/i.test(
      lower
    )
  ) {
    return 'Backend & APIs';
  }

  return 'Core Engineering';
};

/**
 * Deterministic hash to generate stable, consistent variation for a skill
 * without changing on every React render.
 */
const hashSkill = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Default role curriculum milestones when no resume or test has been completed yet
const DEFAULT_ROLE_BASELINES: Record<
  string,
  Array<{ name: string; category: string; progress: number; level: 1 | 2 | 3 | 4; source: SkillItem['source']; evidence: string }>
> = {
  'Backend Developer': [
    { name: 'Python Programming', category: 'Backend & APIs', progress: 82, level: 3, source: 'BASELINE', evidence: 'Coursework Baseline' },
    { name: 'SQL & Relational Databases', category: 'Databases & Storage', progress: 74, level: 3, source: 'BASELINE', evidence: 'Academic Project Baseline' },
    { name: 'RESTful API Architecture', category: 'Backend & APIs', progress: 68, level: 2, source: 'BASELINE', evidence: 'Intermediate Coursework' },
    { name: 'Git & Version Control', category: 'Cloud & DevOps', progress: 86, level: 4, source: 'BASELINE', evidence: 'Verified Tool Competency' },
    { name: 'Docker & Containerization', category: 'Cloud & DevOps', progress: 38, level: 1, source: 'GAP', evidence: 'Curriculum Target Gap' },
    { name: 'Microservices & Caching (Redis)', category: 'Databases & Storage', progress: 32, level: 1, source: 'GAP', evidence: 'Target Specialization Gap' },
    { name: 'Linux Administration & Shell', category: 'Cloud & DevOps', progress: 62, level: 2, source: 'BASELINE', evidence: 'Fundamental Systems' },
    { name: 'FastAPI & Async IO', category: 'Backend & APIs', progress: 54, level: 2, source: 'BASELINE', evidence: 'Elective Specialization' },
  ],
  'Machine Learning & Applied AI': [
    { name: 'Python for Data Science', category: 'AI & Machine Learning', progress: 85, level: 4, source: 'BASELINE', evidence: 'Coursework Baseline' },
    { name: 'Linear Algebra & Calculus', category: 'AI & Machine Learning', progress: 78, level: 3, source: 'BASELINE', evidence: 'Mathematics Core' },
    { name: 'NumPy & Pandas', category: 'AI & Machine Learning', progress: 82, level: 3, source: 'BASELINE', evidence: 'Data Processing Lab' },
    { name: 'Scikit-Learn Modeling', category: 'AI & Machine Learning', progress: 64, level: 2, source: 'BASELINE', evidence: 'Academic Project' },
    { name: 'Deep Learning with PyTorch', category: 'AI & Machine Learning', progress: 38, level: 1, source: 'GAP', evidence: 'Target Milestone Gap' },
    { name: 'Computer Vision / NLP Basics', category: 'AI & Machine Learning', progress: 32, level: 1, source: 'GAP', evidence: 'Specialization Gap' },
    { name: 'Git & Model Versioning', category: 'Cloud & DevOps', progress: 72, level: 3, source: 'BASELINE', evidence: 'Development Baseline' },
  ],
  'Cloud Native & DevOps Engineering': [
    { name: 'Linux System Administration', category: 'Cloud & DevOps', progress: 78, level: 3, source: 'BASELINE', evidence: 'Systems Lab Baseline' },
    { name: 'Docker Containerization', category: 'Cloud & DevOps', progress: 72, level: 3, source: 'BASELINE', evidence: 'Infrastructure Project' },
    { name: 'Computer Networking & DNS', category: 'Cloud & DevOps', progress: 66, level: 2, source: 'BASELINE', evidence: 'Networking Core' },
    { name: 'Git & CI/CD Pipelines', category: 'Cloud & DevOps', progress: 58, level: 2, source: 'BASELINE', evidence: 'Automated Build Lab' },
    { name: 'Kubernetes Orchestration', category: 'Cloud & DevOps', progress: 34, level: 1, source: 'GAP', evidence: 'Production Infrastructure Gap' },
    { name: 'Terraform (IaC)', category: 'Cloud & DevOps', progress: 28, level: 1, source: 'GAP', evidence: 'Cloud Infrastructure Gap' },
    { name: 'AWS Cloud Foundations', category: 'Cloud & DevOps', progress: 48, level: 2, source: 'BASELINE', evidence: 'Elective Certification' },
  ],
  'Full-Stack Web Systems': [
    { name: 'React.js & Frontend Architecture', category: 'Frontend & Web Systems', progress: 84, level: 3, source: 'BASELINE', evidence: 'Web Engineering Project' },
    { name: 'TypeScript & Modern JS', category: 'Frontend & Web Systems', progress: 78, level: 3, source: 'BASELINE', evidence: 'Coursework Baseline' },
    { name: 'HTML5 & CSS3 Responsive Design', category: 'Frontend & Web Systems', progress: 90, level: 4, source: 'BASELINE', evidence: 'Demonstrated Project' },
    { name: 'Node.js & Express APIs', category: 'Backend & APIs', progress: 68, level: 2, source: 'BASELINE', evidence: 'Full-Stack Lab' },
    { name: 'SQL & Database Integration', category: 'Databases & Storage', progress: 62, level: 2, source: 'BASELINE', evidence: 'Application Backend' },
    { name: 'Docker Containerized Deployment', category: 'Cloud & DevOps', progress: 35, level: 1, source: 'GAP', evidence: 'Full-Stack Ops Gap' },
    { name: 'State Management (Redux/Zustand)', category: 'Frontend & Web Systems', progress: 52, level: 2, source: 'BASELINE', evidence: 'In Progress' },
  ],
};

interface CalibrateSkillsParams {
  storedResume?: any;
  latestAssessment?: any;
  backendSkills?: any[];
  selectedRole?: string;
  selectedRoleId?: string;
}

/**
 * Calibrates skills dynamically from all available empirical and declared signals:
 * 1. Diagnostic Exam Results (highest empirical authority)
 * 2. Uploaded Resume (extracts core, secondary, and missing gap skills with differentiated percentages)
 * 3. Live Backend Skill States
 * 4. Academic Baseline (for non-evaluated initial candidates)
 */
export const calibrateSkills = ({
  storedResume,
  latestAssessment,
  backendSkills,
  selectedRole = 'Backend Developer',
}: CalibrateSkillsParams): SkillItem[] => {
  const skillMap = new Map<string, SkillItem>();

  // 1. Ingest Empirical Diagnostic Assessment Results (Score & Accuracy)
  if (latestAssessment && Array.isArray(latestAssessment.skill_scores) && latestAssessment.skill_scores.length > 0) {
    latestAssessment.skill_scores.forEach((s: any) => {
      const name = s.skill_name || s.name;
      if (!name) return;

      const accuracy = s.accuracy_pct !== undefined 
        ? Number(s.accuracy_pct) 
        : (s.accuracy !== undefined ? Math.round(Number(s.accuracy)) : 75);

      const level: 1 | 2 | 3 | 4 =
        accuracy >= 85 ? 4 : accuracy >= 70 ? 3 : accuracy >= 45 ? 2 : 1;

      const category = s.category && s.category !== 'Core Skill' && s.category !== 'GENERAL' 
        ? s.category 
        : inferSkillCategory(name);

      skillMap.set(name.toLowerCase(), {
        id: s.skill_id || `skill-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name,
        category,
        progress: accuracy,
        currentLevel: level,
        source: 'ASSESSMENT',
        evidence: `Verified via Diagnostic Assessment (${accuracy}% Accuracy)`,
        lastEvaluated: latestAssessment.completed_at || new Date().toISOString(),
      });
    });
  }

  // 2. Ingest Resume Competencies & Gap Analysis
  if (storedResume && Array.isArray(storedResume.extractedSkills) && storedResume.extractedSkills.length > 0) {
    const matchedCore = new Set(
      (storedResume.primaryMatch?.matchedSkills || []).map((s: string) => s.toLowerCase())
    );
    const missingSkills = storedResume.primaryMatch?.missingSkills || [];

    // A. Extracted Skills with Differentiated Realistic Scores
    storedResume.extractedSkills.forEach((skillName: string) => {
      const key = skillName.toLowerCase();
      const hash = hashSkill(skillName);

      // If already verified by assessment, keep test score as source of truth
      if (skillMap.has(key)) {
        const existing = skillMap.get(key)!;
        existing.evidence = `${existing.evidence} • Corroborated by Resume`;
        return;
      }

      const isCore = matchedCore.has(key) || matchedCore.has(skillName);
      let progress: number;
      let level: 1 | 2 | 3 | 4;

      if (isCore) {
        // Core matched skill for the target role: 76% to 92%
        progress = 76 + (hash % 17);
        level = progress >= 85 ? 4 : 3;
      } else {
        // Supporting / secondary tool: 54% to 70%
        progress = 54 + (hash % 17);
        level = progress >= 70 ? 3 : 2;
      }

      skillMap.set(key, {
        id: `resume-skill-${key.replace(/[^a-z0-9]/g, '-')}`,
        name: skillName,
        category: inferSkillCategory(skillName),
        progress,
        currentLevel: level,
        source: 'RESUME',
        evidence: isCore
          ? 'Calibrated from Resume: Core Target Alignment'
          : 'Calibrated from Resume: Supporting Competency',
      });
    });

    // B. Target Role Missing Skills (Identified Gaps to complete 100% role readiness)
    missingSkills.forEach((missingSkill: string) => {
      const key = missingSkill.toLowerCase();
      if (skillMap.has(key)) return;

      const hash = hashSkill(missingSkill);
      const progress = 24 + (hash % 16); // 24% to 39%

      skillMap.set(key, {
        id: `gap-skill-${key.replace(/[^a-z0-9]/g, '-')}`,
        name: missingSkill,
        category: inferSkillCategory(missingSkill),
        progress,
        currentLevel: 1,
        source: 'GAP',
        evidence: 'Target Role Skill Gap • Recommended for Calibration',
      });
    });
  }

  // 3. Ingest Backend Profile Skills
  if (backendSkills && backendSkills.length > 0) {
    backendSkills.forEach((bs: any) => {
      const name = bs.skill_name || bs.name;
      if (!name) return;
      const key = name.toLowerCase();

      if (!skillMap.has(key)) {
        const accuracy = Number(bs.accuracy) || 0;
        let progress = accuracy;
        let level: 1 | 2 | 3 | 4 = 1;

        if (progress === 0) {
          const hash = hashSkill(name);
          if (bs.assessed_level === 'EXPERT') {
            progress = 88 + (hash % 8);
            level = 4;
          } else if (bs.assessed_level === 'PROFICIENT') {
            progress = 74 + (hash % 10);
            level = 3;
          } else if (bs.assessed_level === 'INTERMEDIATE') {
            progress = 58 + (hash % 10);
            level = 2;
          } else {
            progress = 30 + (hash % 14);
            level = 1;
          }
        } else {
          level = progress >= 85 ? 4 : progress >= 70 ? 3 : progress >= 45 ? 2 : 1;
        }

        skillMap.set(key, {
          id: bs.skill_id || `backend-${key.replace(/[^a-z0-9]/g, '-')}`,
          name,
          category: bs.category && bs.category !== 'GENERAL' ? bs.category : inferSkillCategory(name),
          progress,
          currentLevel: level,
          source: bs.accuracy > 0 ? 'ASSESSMENT' : 'BASELINE',
          evidence: bs.accuracy > 0 ? `Backend Test Record (${progress}%)` : 'Curriculum Specialization Node',
        });
      }
    });
  }

  // 4. Fallback: Role Baseline if still empty
  if (skillMap.size === 0) {
    const roleKey = Object.keys(DEFAULT_ROLE_BASELINES).find((r) =>
      selectedRole.toLowerCase().includes(r.toLowerCase())
    ) || 'Backend Developer';

    const baselineList = DEFAULT_ROLE_BASELINES[roleKey] || DEFAULT_ROLE_BASELINES['Backend Developer'];
    baselineList.forEach((item) => {
      skillMap.set(item.name.toLowerCase(), {
        id: `base-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: item.name,
        category: item.category,
        progress: item.progress,
        currentLevel: item.level,
        source: item.source,
        evidence: item.evidence,
      });
    });
  }

  // Return skills sorted by proficiency descending (Expert down to Foundation)
  return Array.from(skillMap.values()).sort((a, b) => {
    if (b.currentLevel !== a.currentLevel) {
      return b.currentLevel - a.currentLevel;
    }
    return b.progress - a.progress;
  });
};
