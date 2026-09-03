# Frontend Developer 2: Implementation Plan & Technical Spec
**Domain:** Student Progression & Opportunities + Industry / Recruiter Portal  
**Target Codebase Location:** `src/features/dashboard/`, `src/features/roadmap/`, `src/features/opportunities/`, `src/features/industry/`  
**Isolation Guarantee:** You have **zero dependency** on Developer 1's code. You own the student progression/opportunity matching and the industry recruiter portal.

---

## 1. Scope & Ownership
You are responsible for two distinct, completely isolated portals:

### A. Student Progression & Opportunities Flow
1. **Student Dashboard (`/dashboard`)**: Career goal summary, dynamic readiness gauge (14% $\rightarrow$ 31%), skill state matrix, discrepancy alert, and next milestone CTA.
2. **Adaptive Roadmap (`/roadmap`)**: Interactive phased milestone tree, decision point selection modal (e.g. *TensorFlow vs PyTorch* branch swap), and milestone evidence submission modal (GitHub/certificate).
3. **Student Opportunity Hub (`/opportunities`)**: 3-tier tabbed matching (**Ready Now**, **Almost Ready**, **Aspirational**), compatibility scoring visualizer, AI explanations, and external application links.

### B. Industry / Recruiter Portal (Hiring Partners)
4. **Industry Onboarding (`/industry/onboard`, `/industry/login`)**:
   - Register company (Company name, industry sector, website, hiring manager credentials).
5. **Opportunity Creator & Poster (`/industry/post-opportunity`)**:
   - Create and post custom internships, hackathons, or project roles.
   - Tag required skills directly using canonical skill nodes from the Vidyut Skill Graph (e.g., *Python: Proficient*, *SQL: Intermediate*).
6. **Talent Pool Explorer (`/industry/talent`)**:
   - View anonymized talent matches filtered by role readiness score (e.g., students $\ge 70\%$ ready for Backend or ML roles).
   - See verified assessment badges without exposing private contact info until approved.

---

## 2. Directory & Route Boundaries

```text
src/
├── features/
│   ├── dashboard/                  <-- Student living state
│   ├── roadmap/                    <-- Adaptive DAG & branch decision
│   ├── opportunities/              <-- Student opportunity matching
│   └── industry/                   <-- Recruiter / Employer Portal
│       ├── components/
│       │   ├── IndustryRegisterForm.tsx
│       │   ├── PostOpportunityForm.tsx
│       │   ├── SkillRequirementPicker.tsx
│       │   └── TalentPoolTable.tsx
│       └── mocks/industryMockData.ts
├── mocks/
│   └── studentSessionMock.ts       <-- Self-contained mock state (Priya's Profile)
└── pages/
    ├── DashboardPage.tsx           (/dashboard)
    ├── RoadmapPage.tsx             (/roadmap)
    ├── OpportunitiesPage.tsx       (/opportunities)
    ├── IndustryOnboardPage.tsx     (/industry/onboard)
    ├── IndustryPostJobPage.tsx     (/industry/post-opportunity)
    └── IndustryTalentPage.tsx      (/industry/talent)
```

> [!IMPORTANT]
> **Isolation Rule:**  
> Do not touch `/`, `/login`, `/register`, `/explore`, `/assessment/*`, or `/institution/*`. You run student flows with your built-in mock session (`MOCK_STUDENT_PROFILE`), and industry flows with `MOCK_INDUSTRY_DATA`.

---

## 3. Industry Portal Specifications & Mock Data

### Opportunity Posting Fields (`/industry/post-opportunity`):
- `title` (e.g., "Junior ML Engineer Intern")
- `type` (Internship / Hackathon / Project)
- `mode` (Remote / On-site / Hybrid)
- `stipend_range` (e.g., "₹25,000 / month")
- `required_skills`: Multi-select skill picker linking directly to skill graph tags with required proficiency level (`Beginner`, `Intermediate`, `Proficient`).

### Industry Mock Data (`src/features/industry/mocks/industryMockData.ts`):
```typescript
export const MOCK_INDUSTRY_DATA = {
  company_name: "Bangalore Analytics Co.",
  sector: "Artificial Intelligence & Analytics",
  posted_opportunities: [
    {
      id: "ind-opp-101",
      title: "Junior ML Engineer Intern",
      type: "INTERNSHIP",
      mode: "HYBRID",
      applicants_ready_count: 14,
      required_skills: [
        { name: "Python", min_proficiency: "PROFICIENT" },
        { name: "ML Fundamentals", min_proficiency: "PROFICIENT" },
        { name: "pandas", min_proficiency: "INTERMEDIATE" }
      ]
    }
  ],
  matched_talent_pool: [
    {
      candidate_alias: "Candidate #4812 (VIT Chennai - 2nd Year)",
      role_target: "Machine Learning Engineer",
      readiness_score: 78,
      verified_skills: ["Python", "ML Fundamentals", "Git"],
      status: "Ready Now"
    },
    {
      candidate_alias: "Candidate #9103 (BITS Pilani - 3rd Year)",
      role_target: "Machine Learning Engineer",
      readiness_score: 84,
      verified_skills: ["Python", "PyTorch", "SQL", "Docker"],
      status: "Ready Now"
    }
  ]
};
```

---

## 4. Antigravity CLI Vibe-Coding Prompts

### Prompt 1: Student Dashboard & Skill Visualizer
```text
I am Frontend Developer 2. Build the Student Dashboard inside src/features/dashboard/:
1. ReadinessGauge.tsx: circular or bar gauge showing readiness % (14% baseline).
2. SkillStateList.tsx: skills categorized into 'Completed', 'In Progress', and 'Not Started'.
3. DiscrepancyNotice.tsx: calibration discrepancy callout.
4. DashboardPage.tsx: high-impact modern UI combining these with mock data from src/mocks/studentSessionMock.ts.
```

### Prompt 2: Adaptive Roadmap & Branch Recalculation
```text
Inside src/features/roadmap/:
1. RoadmapTimeline.tsx & MilestoneCard.tsx: render sequential phases with status badges (Completed, In Progress, Branch Pending).
2. DecisionPointModal.tsx: on Phase 4, prompt the student to pick between 'TensorFlow' or 'PyTorch'.
3. When PyTorch is chosen, dynamically recalculate Phase 5 to show PyTorch milestones.
4. EvidenceSubmitModal.tsx: submit GitHub link or certificate, boosting readiness score by 5%.
```

### Prompt 3: Student Opportunities with AI Explanations
```text
Inside src/features/opportunities/:
1. OpportunityTabs.tsx: 3-tier tab bar ('Ready Now', 'Almost Ready', 'Aspirational').
2. OpportunityCard.tsx: shows title, org, source badge (Unstop/Internshala/AICTE), score %, and 'Apply' redirect button.
3. MatchExplanationModal.tsx: breakdown of matched skills (green) vs gap skills (orange) with AI explanation snippet.
```

### Prompt 4: Industry / Recruiter Portal
```text
Inside src/features/industry/:
1. IndustryRegisterForm.tsx: company profile creation.
2. PostOpportunityForm.tsx: opportunity creation form where recruiters select required skills from a taxonomy picker and set required proficiency.
3. TalentPoolTable.tsx: an anonymized candidate search table displaying candidates matching the criteria by verified readiness score.
4. IndustryPostJobPage.tsx & IndustryTalentPage.tsx: complete page wrappers with modern recruiter view.
```
