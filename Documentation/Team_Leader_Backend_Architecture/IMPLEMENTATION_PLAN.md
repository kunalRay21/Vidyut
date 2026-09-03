# Team Leader: Implementation Plan & Technical Spec
**Role:** System Architect, Core Backend & Integration Lead (You)  
**Skill Requirement:** Strong Backend, Systems & Database Engineering (Zero ML required)  
**Target Codebase Location:** `src/core/`, `src/api/`, `src/auth/`, `src/database/`, `docker-compose.yml`

---

## 1. Why This Is Your Role
As the project leader taking the highest responsibility:
- You control the **backbone of the entire application** (PostgreSQL database, Docker container, API Gateway, and server framework).
- You own **Authentication & RBAC** across all 4 roles (`STUDENT`, `ADMIN`, `INSTITUTION`, `INDUSTRY`).
- You unblock all 5 other team members by establishing the shared database tables, API routes, and running the system-wide integration tests.
- **No AI/ML is required** — your power is in clean architecture, database design, fast APIs, and keeping everyone connected.

---

## 2. Your Core Responsibilities

### A. System Foundation & DevOps
- Set up **FastAPI** (Python) or **Express/NestJS** (TypeScript) modular monolith repository.
- Configure `docker-compose.yml` with **PostgreSQL 16** and **Redis** (caching & sessions).
- Set up DB migration tooling (Alembic for Python / Prisma or Knex for Node).

### B. Authentication & Authorization (RBAC)
- Multi-role JWT Auth system with bcrypt password hashing:
  - `POST /api/v1/auth/register` (Students)
  - `POST /api/v1/auth/login` (All users $\rightarrow$ returns JWT with role claim)
  - `POST /api/v1/auth/refresh` & `logout`
- Role-based middleware:
  - Guard `/api/v1/institution/*` for `INSTITUTION` role.
  - Guard `/api/v1/industry/*` for `INDUSTRY` role.
  - Ensure students can only read/write their own profile (`403 Forbidden` checks).

### C. Core Profile & Metadata Services
- `GET /api/v1/profile/me` & `PUT /api/v1/profile/me` (Student details, degree, year).
- Institution endpoints: `POST /api/v1/institution/register`, `GET /api/v1/institution/metrics`.
- Industry endpoints: `POST /api/v1/industry/register`.

### D. System Integration & "Golden Path" Demo
- Review and approve Git pull requests into `develop`.
- Ensure all modules talk via internal service methods (modular monolith rules).
- Validate the end-to-end demo flow (Student registers $\rightarrow$ picks role $\rightarrow$ tests skills $\rightarrow$ gets roadmap $\rightarrow$ applies to matched job).

---

## 3. Database Tables You Own & Scaffold First
Create these primary tables first to unblock the other 3 backend/data/AI developers:
1. `users` (`id`, `email`, `password_hash`, `role`, `created_at`)
2. `student_profiles` (`id`, `user_id`, `full_name`, `institution`, `degree`, `year_of_study`, `interests`, `selected_role_id`)
3. `institutions` (`id`, `user_id`, `college_name`, `aishe_code`, `officer_name`, `departments`)
4. `companies` (`id`, `user_id`, `company_name`, `sector`, `website`)

---

## 4. Antigravity CLI Vibe-Coding Prompts

### Prompt 1: Project Skeleton & Database Setup
```text
I am the Project Lead. Initialize a modular monolith backend with FastAPI and PostgreSQL using async SQLAlchemy and Alembic.
1. Create docker-compose.yml with PostgreSQL 16 and Redis.
2. Create config.py reading from .env (DB url, JWT secrets).
3. Set up the core database connection pool and standard API response envelope format:
   {"success": true, "data": {}, "meta": {"timestamp": "...", "version": "1.0"}}
```

### Prompt 2: Multi-Role JWT Authentication
```text
Build a production-ready JWT authentication module in src/auth/:
1. Password hashing with bcrypt (cost factor 12).
2. JWT generation (HS256) with access_token (15 min) and refresh_token (7 days).
3. Endpoints: /api/v1/auth/register, /api/v1/auth/login, /api/v1/auth/refresh.
4. FastAPI dependency / middleware: get_current_user with role enforcement (STUDENT, INSTITUTION, INDUSTRY, ADMIN).
```

### Prompt 3: Student, Institution, and Company Profile APIs
```text
Build profile CRUD services and endpoints in src/core/:
1. StudentProfile model and router for GET/PUT /api/v1/profile/me.
2. Institution model and router for POST /api/v1/institution/register and GET /api/v1/institution/metrics.
3. Company model and router for POST /api/v1/industry/register.
Enforce data ownership: students can only access their own record.
```
