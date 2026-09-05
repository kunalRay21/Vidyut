# Vidyut — SIH 2026 Judge Demonstration Guide

**Problem Statement 26044**: Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement

This guide provides the complete, deterministic step-by-step presentation script for the Smart India Hackathon (SIH) jury evaluation.

---

## Demonstration Architecture Overview

```
                      STUDENT
                         │
                         ▼
                 Academic Context
                 (e.g., B.Tech CSE)
                         │
                         ▼
                  Career Discovery
             (Contextual Domain Relevance)
                         │
                         ▼
                   Career Role
               (Backend Developer)
                         │
                         ▼
                Technology Branch
                (FastAPI Decision)
                         │
                         ▼
                 Canonical Skills
                         │
                         ▼
                 Diagnostic Test
                         │
                         ▼
               Student Skill State
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      Adaptive Roadmap      Opportunity Pipeline
      (Kahn's DAG Sorting)   (Scraped & Normalized)
             │                       │
             ▼                       ▼
      Next Best Skill       Canonical Skill Matching
             │                       │
             ▼                       ▼
       Skill Progress          Recommendation
       (Mastered/Gaps)      (Role 5 AI Compat Engine)
             │                       │
             └───────────┬───────────┘
                         ▼
                    Reassessment
             (Empirical Skill Upgrade)
                         ▼
               Updated Skill State
                         ▼
               Roadmap Adaptations
               & Dynamic Re-scoring
```

---

## Pre-Demonstration Quick Setup (30 Seconds)

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Reset to Deterministic Demo State**:
   ```bash
   cd backend
   npm run demo:reset
   ```
4. **Open Browser**: `http://localhost:5173`

---

## 11-Step Primary Demonstration Script

### STEP 1: Student Authentication & Academic Context
- **Navigation**: Click **Sign In** at top right (`/login`) or **Register** (`/register`).
- **Credentials**:
  - Email: `ananya.sharma@vidyut.ac.in`
  - Password: `Password@123`
- **What to highlight to Judges**:
  - Point out **Academic Branch: Computer Science & Engineering (CSE)**.
  - Explain: *"Vidyut captures the student's institutional degree context upfront to provide tailored career guidance, without assuming unverified skill competence."*

---

### STEP 2: Contextual Career Discovery
- **Navigation**: Click **Explore Domains** (`/explore`).
- **What the UI displays**:
  - Domain: **Backend Development** badge indicates **HIGH Relevance (Curriculum Aligned)**.
  - Domains outside CSE core (e.g. Civil Infrastructure) show appropriate medium/lower baseline contextual tags.
- **Talking Point**:
  - *"Our academic branch personalization engine automatically cross-references the student's degree curriculum against national industry trends to highlight primary career trajectories."*

---

### STEP 3 & 4: Role Selection & Technology Branch Specialization
- **Navigation**:
  - Under Backend Development, select **Backend Developer**.
  - In Phase 4 framework decision point, select **FastAPI**.
- **Talking Point**:
  - *"Rather than generic monolithic roadmaps, Vidyut supports Technology Branches—allowing students to specialize in high-growth stacks such as FastAPI vs Django, with custom prerequisite chains."*

---

### STEP 5: Diagnostic Skill Assessment
- **Navigation**: Click **Diagnostic Assessment** or navigate to `/assessment/self`.
- **Observed Initial Skill State**:
  - **Programming Fundamentals**: `PROFICIENT` (Score 90%)
  - **Python**: `BEGINNER` (Score 35%)
  - **SQL**: `BEGINNER` (Score 40%)
  - **HTTP, REST API, Docker**: Unassessed
- **Talking Point**:
  - *"Skills are never fabricated based on degree name alone. Every skill level is tied to empirical assessment evidence or verified certifications."*

---

### STEP 6: The Adaptive Learning Roadmap
- **Navigation**: Click **Roadmap** in the navigation bar (`/roadmap`).
- **What to highlight to Judges**:
  1. **Mastered Skills Skipped**: Programming Fundamentals is marked **MASTERED / FAST-TRACKED**. The student does not waste time relearning what they already know.
  2. **Active Focus Gaps**: Python and SQL are marked **ACTIVE FOCUS** because the target requirement is PROFICIENT.
  3. **Locked Prerequisites**: REST API and Docker are clearly marked **LOCKED**.
  4. **Next Best Skill**: The backend dynamically designates the next highest-leverage eligible skill in topological order.
  5. **Explainability**: Click on any locked skill—the UI clearly shows *"Blocked until prerequisites (HTTP) are completed"*.

---

### STEP 7: Normalized Opportunity Pipeline
- **Navigation**: Click **Opportunities** (`/opportunities`).
- **What to highlight to Judges**:
  - Display opportunities scraped and normalized from **Internshala**, **Unstop**, and **AICTE**.
  - Point out standardized fields: Work Mode (`HYBRID`/`REMOTE`), Stipend (`₹35,000 / month`), Location, and **Matched Skills**.
  - Mention: *"Raw employer strings like 'FastAPI Framework' or 'pg-sql' were resolved to canonical skill taxonomy UUIDs through our alias dictionary."*

---

### STEP 8: AI Compatibility Recommendation
- **What to highlight to Judges**:
  - View Razorpay **Backend Engineering Intern** opportunity.
  - Point out the **Compatibility Score** (e.g., ~79%).
  - Highlight the breakdown explanation:
    - Skill Match: 50% weight
    - Career Alignment: 25% weight
    - Eligibility: 15% weight
    - Academic Interest: 10% weight
  - Explain: *"The score is completely deterministic and transparent. No black-box guesses."*

---

### STEP 9: Student Reassessment & Skill Improvement
- **Action**: Simulate student completing coursework and taking reassessment for **Python**.
- **Trigger**: Run in a terminal or click reassess:
  ```bash
  curl -X POST http://localhost:8000/api/v1/demo/advance-skill \
    -H "Content-Type: application/json" \
    -d '{"skillName": "Python", "newLevel": "PROFICIENT", "accuracy": 0.95}'
  ```

---

### STEP 10: Dynamic Roadmap Adaptation
- **Navigation**: Refresh or revisit `/roadmap`.
- **Observed Adaptations**:
  - **Python** is now marked **MASTERED**!
  - **Readiness Score** jumps up (e.g., from 39% to 44%).
  - **Next Best Skill** changes to the next unblocked eligible skill (e.g. `HTTP` or `SQL`).
  - Downstream framework decision points become unlocked.
- **Talking Point**:
  - *"Judges, this proves our closed-loop adaptive learning engine: as the student gains mastery, the DAG dynamically recalculates the optimal learning sequence in real time."*

---

### STEP 11: Dynamic Recommendation Update
- **Navigation**: Return to `/opportunities`.
- **Observed Adaptations**:
  - The Razorpay opportunity requiring Python jumps from **79% to 93% compatibility**!
  - The badge advances to **READY_NOW**.
  - The match explanation reports: *"You match 2 of 2 required skills with full proficiency."*

---

## 3 Demonstrable Evaluation Scenarios

### Scenario A: Beginner Student (High Skill Gaps)
- **Profile**: 1st/2nd-year student with no prior coding assessments.
- **Key Outcome**: Foundational skills unlocked; all advanced frameworks locked. Next best skill points to Programming Fundamentals. Readiness = 0–15%.

### Scenario B: Intermediate Student (Accelerated Fast-Track)
- **Profile**: Student with strong foundational programming and database knowledge.
- **Key Outcome**: Foundational milestones fast-tracked automatically; roadmap is 40% shorter, focusing immediately on distributed systems, containerization, and API design.

### Scenario C: Adaptive Reassessment Loop (Primary Demo)
- **Profile**: Ananya Sharma progressing from BEGINNER to PROFICIENT in Python.
- **Key Outcome**: Dynamic recalculation of roadmap, unlocking of downstream prerequisites, upward jump in readiness, and real-time re-ranking of employer internships.

---

## Failure-Resilience & Live Demonstration Safety

| Failure Condition | Vidyut System Reaction | Jury Explanation |
|:---|:---|:---|
| **PostgreSQL Database Down** | Automatically switches to in-memory dual-persistence store (`store.ts`). | *"The platform features dual-persistence architecture for zero-downtime offline demonstrations."* |
| **External Scraper Blocked / Offline** | Isolates source failure; immediately serves verified fixtures through identical normalization pipeline. | *"Live job boards frequently change DOMs; our isolation layer prevents external network faults from affecting platform availability."* |
| **Unrecognized Skill in Scraped Posting** | Routes unknown skill string to `unmatched_skills` review queue; does NOT pollute canonical taxonomy. | *"Taxonomy integrity is strictly protected; unknown employer terms are held for administrative curation."* |
| **Cyclic Dependency in Skill Graph** | Kahn's algorithm detects cycle, isolates invalid edges, and returns safe fallback ordering. | *"Graph algorithms validate topological order to prevent infinite recursion or impossible learning paths."* |
| **Unauthorized Access Attempt** | Role-based token guard rejects with HTTP 403 / 401. | *"Student privacy and administrative endpoints are guarded by strict role-boundary middleware."* |
