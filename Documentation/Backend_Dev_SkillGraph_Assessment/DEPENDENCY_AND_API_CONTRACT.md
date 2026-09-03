# Member 4: Dependencies & API Contract Cheat-Sheet
**Your Role:** Skill Graph (DAG), Assessment Engine & Adaptive Roadmap Specialist  
**Your Primary Counterparts:** Team Leader (DB & Auth), Frontend 1 (Assessment Intake), Frontend 2 (Roadmap UI), Data Engineer & AI Specialist

---

## 1. Tables You Own & Maintain
You own the schemas, seeds, and queries for:
- [`domains`, `roles`, `skills`, `skill_prerequisites`, `technology_branches`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#3-career--skill-graph-dag-owned-by-member-4)
- [`questions`, `assessment_sessions`, `student_skill_states`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#4-student-skill-state--assessments-owned-by-member-4)
- [`roadmap_states`, `milestones`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#5-adaptive-roadmap-owned-by-member-4)

---

## 2. Dependencies You NEED (Consume)

### From Team Leader:
- `get_db` session dependency from `src.database.session`.
- `get_current_user` auth dependency from `src.auth.dependencies` to get the logged-in student's `student_id`.

---

## 3. Endpoints You Must PROVIDE

### For Frontend Developer 1 (Student Intake & Test Flow):
1. `GET /api/v1/careers/domains`
   - Returns list of domains with descriptions and demand levels.
2. `GET /api/v1/careers/roles/{id}`
   - Returns role details and the list of required skills.
3. `POST /api/v1/assessments/self`
   - Body: `{ "role_id": "...", "ratings": [{ "skill_id": "...", "rating": "AVERAGE" }] }`
   - Stores student self-perception into `student_skill_states.self_rating`.
4. `POST /api/v1/assessments/start`
   - Generates and returns a 20-question MCQ session.
5. `POST /api/v1/assessments/{session_id}/submit`
   - Receives student answers, runs grading algorithm, updates `student_skill_states.assessed_level`, and generates initial discrepancy feedback.

### For Frontend Developer 2 (Progression & Roadmap):
6. `GET /api/v1/profile/me/skills`
   - Returns the student's evaluated skills, target levels, and overall readiness percentage.
7. `GET /api/v1/roadmap`
   - Returns topologically sorted phases and milestones.
8. `POST /api/v1/roadmap/branch`
   - Body: `{ "branch_id": "branch-pytorch" }`
   - Recalculates Phase 5 for the chosen framework and returns the updated roadmap.
9. `POST /api/v1/portfolio/evidence`
   - Body: `{ "skill_id": "...", "type": "GITHUB", "url": "..." }`
   - Boosts student readiness score.

---

## 4. Internal Data You PROVIDE to Other Backend Members

### To Data Engineer (Member 5):
- Provide the list of canonical skill IDs and names (e.g. `skill-python` $\rightarrow$ "Python", `skill-docker` $\rightarrow$ "Docker") so that scraped opportunities can be tagged with valid `skill_id` foreign keys in `opportunity_skill_tags`.

### To AI/ML Specialist (Member 6):
- Expose an internal Python function `get_student_evaluated_skills(student_id: UUID) -> List[SkillState]`.  
  Member 6 calls this directly in memory to compute the compatibility matching score without making unnecessary HTTP requests.
