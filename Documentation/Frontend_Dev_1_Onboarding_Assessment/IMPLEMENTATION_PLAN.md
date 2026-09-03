# Frontend Developer 1: Implementation Plan & Technical Spec
**Domain:** Student Entry/Assessment + Academic Institution Portal  
**Target Codebase Location:** `src/features/onboarding/`, `src/features/institution/`  
**Isolation Guarantee:** You have **zero dependency** on Developer 2's code. You own the student intake flow and the college partner portal.

---

## 1. Scope & Ownership
You are responsible for two distinct, completely isolated portals:

### A. Student Entry & Assessment Flow
1. **Landing Page (`/`)**: Product showcase, multi-portal sign-in CTA (Student / College / Recruiter).
2. **Student Registration & Onboarding (`/register`, `/login`)**: Student account creation with degree/year metadata + JWT storage.
3. **Career Discovery & Role Selection (`/explore`)**: Browse 6 tech domains, explore tech stacks, and select target role (*Backend Developer* or *Machine Learning Engineer*).
4. **Self-Assessment (`/assessment/self`)**: Rate self-proficiency (1–5 scale) for role-specific skills.
5. **Targeted Assessment Quiz (`/assessment/quiz/:sessionId`)**: Timed MCQ quiz engine with immediate result handoff (`navigate('/dashboard')`).

### B. Academic Institution Portal (Colleges / Placement Cells)
6. **Institution Onboarding (`/institution/onboard`, `/institution/login`)**:
   - Register college (Institution name, AISHE code, accreditation, placement officer email, active departments).
7. **Institution Analytics Dashboard (`/institution/dashboard`)**:
   - **Cohort Readiness Overview:** Average student readiness score across departments (CSE, IT, ECE).
   - **Curriculum Gap Heatmap:** Identifies skills where student cohort tests below industry target (e.g. *Docker: 22% ready*, *SQL: 45% ready*).
   - **Batch Readiness Distribution:** % of students in "Ready Now", "Almost Ready", and "Needs Foundation".

---

## 2. Directory & Route Boundaries

```text
src/
├── features/
│   ├── onboarding/                  <-- Student intake & quiz
│   │   ├── components/
│   │   │   ├── LandingHero.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── DomainCard.tsx
│   │   │   ├── SkillRatingSlider.tsx
│   │   │   └── QuizEngine.tsx
│   │   └── mocks/onboardingMockData.ts
│   └── institution/                 <-- College / Placement Cell Portal
│       ├── components/
│       │   ├── InstitutionRegisterForm.tsx
│       │   ├── CohortReadinessChart.tsx
│       │   ├── SkillGapHeatmap.tsx
│       │   └── DepartmentFilter.tsx
│       └── mocks/institutionMockData.ts
└── pages/
    ├── LandingPage.tsx              (/)
    ├── AuthPage.tsx                 (/login, /register)
    ├── DiscoveryPage.tsx            (/explore)
    ├── SelfAssessmentPage.tsx       (/assessment/self)
    ├── AssessmentQuizPage.tsx       (/assessment/quiz/:id)
    ├── InstitutionOnboardPage.tsx   (/institution/onboard)
    └── InstitutionDashboardPage.tsx (/institution/dashboard)
```

> [!IMPORTANT]
> **Isolation Rule:**  
> Do not touch `/dashboard`, `/roadmap`, `/opportunities`, or `/industry/*`. When a student completes the quiz, call `navigate('/dashboard')`. When a college representative logs in, call `navigate('/institution/dashboard')`.

---

## 3. Institution Portal Specifications & Mock Data

### Institution Onboarding Fields (`/institution/onboard`):
- `college_name` (e.g., "Vellore Institute of Technology")
- `aishe_code` (e.g., "C-36944")
- `officer_name` & `officer_email` (Placement Director / TPO)
- `departments` (Multi-select: CSE, IT, Data Science, ECE)

### Institution Mock Data (`src/features/institution/mocks/institutionMockData.ts`):
```typescript
export const MOCK_INSTITUTION_METRICS = {
  institution_name: "VIT Chennai - School of Computer Science",
  total_students_enrolled: 420,
  average_readiness_pct: 54.2,
  department_stats: [
    { department: "Computer Science", enrolled: 210, avg_readiness: 58.4 },
    { department: "Data Science & AI", enrolled: 120, avg_readiness: 62.1 },
    { department: "Information Tech", enrolled: 90, avg_readiness: 46.5 }
  ],
  cohort_distribution: {
    ready_now_pct: 22,       // Score >= 75%
    almost_ready_pct: 48,    // Score 50-74%
    needs_foundation_pct: 30 // Score < 50%
  },
  top_curriculum_gaps: [
    { skill: "Docker & Containerization", student_avg_score: 24, target_industry_score: 70 },
    { skill: "API Testing & Postman", student_avg_score: 38, target_industry_score: 75 },
    { skill: "Relational SQL Optimization", student_avg_score: 44, target_industry_score: 80 }
  ]
};
```

---

## 4. Antigravity CLI Vibe-Coding Prompts

### Prompt 1: Student Intake & Discovery
```text
I am Frontend Developer 1. Build the student entry flow in src/features/onboarding/:
1. LandingHero.tsx: clean landing page with student and institutional CTAs.
2. RegisterForm.tsx: student registration with academic info (college, year, degree, interests).
3. DomainCard.tsx & RoleSelector.tsx: browse domains and choose 'Machine Learning Engineer' or 'Backend Developer'.
Use Tailwind CSS and self-contained mocks.
```

### Prompt 2: Self-Assessment & Quiz Engine
```text
Build the assessment engine in src/features/onboarding/components/:
1. SkillRatingSlider.tsx: 5-level proficiency selector for chosen role skills.
2. QuizEngine.tsx: interactive quiz with countdown timer, progress bar, 4-option radio cards, and submit modal that calls navigate('/dashboard').
```

### Prompt 3: Academic Institution Portal
```text
Build the Institution / Placement Cell portal in src/features/institution/:
1. InstitutionRegisterForm.tsx: captures college name, AISHE code, and TPO credentials.
2. CohortReadinessChart.tsx: displays cohort readiness distribution (Ready Now: 22%, Almost Ready: 48%, Needs Work: 30%).
3. SkillGapHeatmap.tsx: visually highlights curriculum gaps where student scores lag behind industry standards (Docker, SQL, API Testing).
4. InstitutionDashboardPage.tsx: combines these into a high-level executive analytics dashboard.
```
