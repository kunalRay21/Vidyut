# Backend Dev (Member 4): Implementation Plan & Technical Spec
**Role:** Career & Skill Graph (DAG) + Assessment Engine Specialist  
**Skill Requirement:** Data Structures & Algorithms, Graph Theory (Topological Sort), Relational Modeling (Zero ML required)  
**Target Codebase Location:** `src/modules/skill_graph/`, `src/modules/assessment/`, `src/modules/roadmap/`

---

## 1. Why This Is Your Role
You are responsible for the **intellectual core** of Vidyut.  
You do **not** do machine learning. You build the **graph data structures and deterministic algorithms** that answer:
1. *"What skills exist and in what prerequisite order must they be learned?"*
2. *"How does the system test and score a student's actual proficiency?"*
3. *"How does the roadmap dynamically adapt when a student makes a decision?"*

---

## 2. Your Core Responsibilities

### A. The Career & Skill Graph (Directed Acyclic Graph - DAG)
- Implement relational tables in PostgreSQL:
  - `domains` $\rightarrow$ `roles` $\rightarrow$ `skills`
  - `skill_prerequisites` (Directed edges: Skill A must precede Skill B)
  - `technology_branches` (Decision points: e.g., *FastAPI vs Django*, *PyTorch vs TensorFlow*)
- Implement DAG validation: **cycle detection algorithm** (ensures no infinite prerequisite loops).
- **Curate the 2 Golden Demo Paths**:
  1. **Backend Developer** (Programming $\rightarrow$ Git $\rightarrow$ HTTP $\rightarrow$ REST $\rightarrow$ SQL $\rightarrow$ FastAPI/Django branch $\rightarrow$ Docker).
  2. **Machine Learning Engineer** (Python $\rightarrow$ Git $\rightarrow$ Linear Algebra/Stats $\rightarrow$ pandas/SQL $\rightarrow$ Core ML $\rightarrow$ TensorFlow/PyTorch branch $\rightarrow$ MLOps).

### B. Assessment Engine & Scoring
- Implement `questions` bank table (MCQs with single correct answer, difficulty, and explanation).
- Seed at least **25 verified questions** for the golden path roles.
- Implement **Session Generator**:
  - Takes student's self-ratings (1–5 scale).
  - Selects foundational skills + skills rated $\ge 3$ (to calibrate overestimation).
  - Emits 20–25 questions.
- Implement **Scoring Algorithm**:
  - Calculates per-skill accuracy percentage.
  - Maps score to proficiency: `0-20% AWARENESS`, `21-45% BEGINNER`, `46-65% INTERMEDIATE`, `66-85% PROFICIENT`, `86-100% EXPERT`.
  - Discrepancy detector: Flags gentle upgrade/downgrade messages.

### C. Adaptive Roadmap Engine
- Implement **Topological Sorting Algorithm**:
  - Filters out skills already at target proficiency.
  - Orders remaining skills strictly by prerequisite dependencies.
  - Inserts interactive `decision_points` at branch nodes.
- Implement **Branch Recalculation**:
  - Endpoint `POST /api/v1/roadmap/branch` $\rightarrow$ When student picks *PyTorch*, instantly swap out Phase 5 milestones and return updated roadmap.

---

## 3. Endpoints You Deliver
- `GET /api/v1/careers/domains` & `GET /api/v1/careers/roles/:id`
- `GET /api/v1/skills/graph?role_id=...` (returns nodes + edges)
- `POST /api/v1/assessments/self` (stores student self-perception)
- `POST /api/v1/assessments/start` (creates test session with calibrated questions)
- `POST /api/v1/assessments/:session_id/submit` (scores test and updates student skill states)
- `GET /api/v1/roadmap` & `POST /api/v1/roadmap/branch`

---

## 4. Antigravity CLI Vibe-Coding Prompts

### Prompt 1: Skill Graph Schema, Seed Data & DAG Validator
```text
I am Backend Developer (Skill Graph & Assessment).
In src/modules/skill_graph/:
1. Create SQLAlchemy models for Domain, Role, Skill, SkillPrerequisite, and TechnologyBranch.
2. Write a networkx or custom DFS cycle-detection script to verify the graph is a valid DAG.
3. Create a seed script that populates the complete 18-skill graph for 'Machine Learning Engineer' and 15-skill graph for 'Backend Developer' with prerequisites and branches (TensorFlow vs PyTorch).
```

### Prompt 2: Assessment Engine & Calibrated Scoring
```text
In src/modules/assessment/:
1. Create models for Question, AssessmentSession, and QuestionResponse.
2. Seed 25 realistic multiple-choice questions covering Python, Git, Linear Algebra, SQL, and ML Fundamentals.
3. Write service generate_session(student_id, role_id, self_ratings) that selects questions to verify prerequisites and detect overestimation.
4. Write score_session(session_id, answers) that calculates per-skill proficiency enum and outputs discrepancy messages.
```

### Prompt 3: Adaptive Roadmap Generator with Topological Sort
```text
In src/modules/roadmap/:
1. Implement generate_personalized_roadmap(student_id, role_id):
   - Fetch student's assessed skill levels.
   - Filter out mastered skills.
   - Topologically sort remaining skills using prerequisite graph.
   - Insert decision points for branches.
2. Implement record_branch_choice(student_id, branch_id) that recalculates subsequent milestones.
```
