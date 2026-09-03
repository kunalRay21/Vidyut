# Vidyut — GitHub & Collaboration Rules
**Authoritative Reference:** Section 26 of General Project Documentation  
**Audience:** All 6 Team Members  
**Enforcer:** Team Leader (System Architect & Integration Lead)

---

## 1. Branch Hierarchy

```text
main (Protected)
 └── develop (Protected Integration Branch)
      ├── feature/role1-onboarding-ui
      ├── feature/role1-institution-portal
      ├── feature/role2-dashboard-ui
      ├── feature/role2-roadmap-dag-view
      ├── feature/role2-industry-portal
      ├── feature/role3-core-auth-db
      ├── feature/role4-skill-graph-dag
      ├── feature/role4-assessment-engine
      ├── feature/role5-scrapers-pipeline
      ├── feature/role5-opportunity-seed
      └── feature/role6-gemini-ai-module
```

### The Rules of the Branches:
1. **`main` (Production / Demo-Ready Only):**
   - Contains ONLY stable, integrated, fully tested code ready to be demonstrated to SIH evaluators.
   - **Direct pushes are strictly blocked.**
   - Only merged from `develop` after end-to-end testing by the Team Leader.
2. **`develop` (Active Integration Branch):**
   - The shared staging ground where all feature branches merge.
   - **Direct pushes are strictly blocked.**
   - All code enters `develop` via Pull Request (PR) only.
3. **`feature/role{N}-{short-description}` (Working Branches):**
   - Every team member works on their own feature branch branched off `develop`.
   - Naming convention:
     - `feature/role1-...` (Frontend Dev 1)
     - `feature/role2-...` (Frontend Dev 2)
     - `feature/role3-...` (Team Leader)
     - `feature/role4-...` (Skill Graph & Assessment)
     - `feature/role5-...` (Data & Scraping)
     - `feature/role6-...` (AI & Recommendations)
     - `fix/role{N}-...` (Bug fixes)

---

## 2. Commit Message Conventions (Conventional Commits)

All commits MUST follow this format:
```text
type(scope): imperative summary in present tense (lower case, no period at end)
```

### Allowed Types:
- `feat`: A new user-facing feature or API endpoint (e.g., `feat(auth): implement JWT refresh endpoint`)
- `fix`: A bug fix (e.g., `fix(roadmap): resolve circular dependency in DAG topological sort`)
- `docs`: Documentation changes only (e.g., `docs(contracts): update opportunity response schema`)
- `test`: Adding or correcting tests (e.g., `test(assessment): add unit tests for scoring edge cases`)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Build scripts, dependencies, docker config (e.g., `chore(docker): configure redis service`)

### Allowed Scopes:
`auth`, `profile`, `institution`, `industry`, `skill-graph`, `assessment`, `roadmap`, `opportunities`, `recommendation`, `ai`, `frontend`, `db`

### Examples:
- ✅ `feat(skill-graph): add prerequisite cycle detection algorithm`
- ✅ `feat(frontend): create 3-tier opportunity tabs and card component`
- ✅ `fix(scraper): resolve rate limiting issue on unstop connector`
- ❌ `fixed stuff`
- ❌ `wip`
- ❌ `updated frontend code`

---

## 3. Pull Request (PR) & Merge Policy

1. **One Branch = One Feature:** Keep PRs small and reviewable (under 400 lines of code changes).
2. **Review Requirement:** Every PR targeting `develop` requires **at least 1 approval** from the **Team Leader**.
3. **Database Migration Rule:** If a backend change alters database columns or tables:
   - The Alembic migration file MUST be included in the same commit and PR.
   - Never manually alter the database without a committed migration script.
4. **Contract Verification:** If an API endpoint request or response format changes:
   - The PR author must notify the corresponding frontend/backend consumer before merging.
5. **No Broken Builds:** Before submitting a PR, verify locally that the server boots and tests pass.

---

## 4. Security & Environment Secret Rules

- **NEVER commit `.env` files to GitHub.**
- The `.gitignore` must always include:
  ```text
  .env
  .env.local
  *.pyc
  __pycache__/
  node_modules/
  dist/
  build/
  .venv/
  venv/
  *.log
  ```
- Commit a `.env.example` file with dummy placeholder keys (e.g., `GEMINI_API_KEY=your_key_here`).

---

## 5. Daily Git Workflow Cheat-Sheet

### Starting a New Task:
```bash
# 1. Always start from latest develop
git checkout develop
git pull origin develop

# 2. Create your isolated feature branch
git checkout -b feature/role1-onboarding-ui
```

### Committing & Pushing:
```bash
# 1. Check changed files
git status

# 2. Stage your specific files (do not blind git add . if untracked junk exists)
git add src/features/onboarding/

# 3. Commit with conventional commit message
git commit -m "feat(onboarding): implement domain discovery cards"

# 4. Push to remote
git push -u origin feature/role1-onboarding-ui
```

### Keeping Your Branch Up to Date:
```bash
# If develop has progressed, rebase or merge develop into your branch:
git fetch origin
git merge origin/develop
```

### Submitting PR:
1. Open GitHub $\rightarrow$ Create Pull Request from `feature/role{N}-...` into `develop`.
2. Assign the **Team Leader** as reviewer.
3. Once approved, merge using **Squash and Merge** or **Rebase and Merge** to keep the history clean.
