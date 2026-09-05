# Vidyut (Adaptive Career & Skill Trainer) — Production Runbook

SIH 2026 Problem Statement: **26044 — Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement**

This runbook guides engineers, judges, and evaluators to set up, operate, test, and troubleshoot the complete Vidyut platform reproducibly from a fresh clone.

---

## 1. Prerequisites

Ensure the following runtimes are installed on your host machine:

| Component | Minimum Version | Verified Version | Purpose |
|:---|:---|:---|:---|
| **Node.js** | `>= 18.18.0` | `v20.x` / `v22.x` | Backend runtime & Frontend build tooling |
| **npm** | `>= 9.0.0` | `10.x` | Package management |
| **Docker & Docker Compose** *(Optional)* | `>= 24.0.0` | `26.x` | Containerized PostgreSQL and Redis instance |
| **PostgreSQL** *(Optional if using in-memory)* | `>= 15.0` | `16-alpine` | Relational database persistence |

> [!NOTE]
> **Dual-Persistence Resilience**: Vidyut operates with full dual-persistence. If PostgreSQL is not running or unreachable, the system automatically runs in **offline in-memory mode**, enabling complete end-to-end demonstrations without external dependencies.

---

## 2. Environment Setup

### Backend Environment Configuration
Navigate to `backend` and initialize `.env`:
```bash
cd backend
cp .env.example .env
```

Ensure variables are set:
```env
PORT=8000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vidyut_db?schema=public"
JWT_SECRET="vidyut_jwt_super_secret_signing_key_2026"
ADMIN_KEY="vidyut_admin_secret_key"
```

### Frontend Environment Configuration
The frontend automatically proxies `/api` requests to `http://localhost:8000` via Vite. If configuring a custom backend URL:
```bash
cd ../frontend
# Optional: create .env if running on non-default port
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

---

## 3. Database Startup

To start PostgreSQL and Redis via Docker Compose:
```bash
# From repository root
docker compose up -d postgres redis
```

To verify database container health:
```bash
docker compose ps
```

---

## 4. Prisma Client Initialization

Initialize the Prisma client bindings:
```bash
cd backend
npm run prisma:generate
```

To push schema changes to PostgreSQL (when running):
```bash
npm run prisma:push
```

---

## 5. Demonstration Environment Reset & Seeding

Vidyut includes a dedicated, non-destructive demo reset command that seeds the canonical demonstration scenario for **Ananya Sharma** (CSE student targeting Backend Developer with FastAPI):

```bash
cd backend
npm run demo:reset
```

### What `npm run demo:reset` Does:
1. Safely removes only previous demo records for `ananya.sharma@vidyut.ac.in`.
2. Preserves all other users, institutions, companies, and canonical taxonomies.
3. Sets up initial deterministic skill states:
   - **Programming Fundamentals**: `PROFICIENT` (Mastered, automatically fast-tracked)
   - **Python**: `BEGINNER` (Active focus gap)
   - **SQL**: `BEGINNER` (Active focus gap)
   - **HTTP, REST API, Docker**: Unassessed / locked downstream prerequisites.
4. Synchronizes across both PostgreSQL (if available) and the in-memory fallback store.

---

## 6. Backend Startup

Start the Express + TypeScript backend:
```bash
cd backend
npm run dev
```

- Endpoint URL: `http://localhost:8000`
- API Root: `http://localhost:8000/api/v1`

Production compile and start:
```bash
npm run build
npm start
```

---

## 7. Frontend Startup

Start the Vite + React + TypeScript development server:
```bash
cd frontend
npm run dev
```

- Local URL: `http://localhost:5173`
- The application will automatically open or be available at `http://localhost:5173`.

Production compile:
```bash
npm run build
npm run preview
```

---

## 8. Running Test Suites

Vidyut includes automated verification suites covering every phase and architectural subsystem:

```bash
cd backend

# 1. Run full Jest unit and regression test suite (164 tests)
npm test

# 2. Run Phase 2 Academic Branch Verification (6 tests)
npx ts-node src/tests/academicBranch.test.ts

# 3. Run Phase 3 Opportunity Pipeline Verification (5 tests)
npx ts-node src/tests/opportunityPipeline.test.ts

# 4. Run Phase 4 Adaptive Roadmap Engine Verification (12 tests)
npx ts-node src/tests/adaptiveRoadmap.test.ts

# 5. Run Phase 5 System Integration Verification (13 tests)
npx ts-node src/tests/systemIntegration.test.ts

# 6. Run Phase 6 Hardening, Security & Demo Verification (12 tests)
npx ts-node src/tests/phase6Hardening.test.ts
```

---

## 9. Health & Observability Check

To inspect system health and runtime mode:
```bash
curl http://localhost:8000/health
# or
curl http://localhost:8000/api/v1/health
```

Expected JSON Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "mode": "postgresql",
    "version": "1.0.0",
    "timestamp": "2026-09-05T08:11:58.247Z",
    "uptime": "142s",
    "services": {
      "api": "operational",
      "database": "connected",
      "redis": "optional (in-memory caching active)"
    }
  },
  "meta": {
    "timestamp": "2026-09-05T08:11:58.247Z",
    "version": "1.0"
  }
}
```

---

## 10. Troubleshooting & FAQ

### Q1: What happens if PostgreSQL is not installed or Docker is stopped?
**A**: The backend detects database connectivity on startup. If unavailable, it seamlessly switches to the in-memory fallback store (`store.ts`). All APIs, roadmap calculations, assessments, and recommendations continue to function without crashing.

### Q2: Why did an external opportunity scraper fail?
**A**: External platforms (Internshala, Unstop) frequently change layouts or block automated scrapers. Vidyut isolates scraper failures so one failing source never blocks other sources. When a live scrape is unreachable, the adapter immediately uses verified fallback fixtures through the exact same normalization and canonical matching pipeline.

### Q3: How do I test the skill improvement feedback loop during judging?
**A**: Use the demo advancement endpoint or UI quiz:
```bash
curl -X POST http://localhost:8000/api/v1/demo/advance-skill \
  -H "Content-Type: application/json" \
  -H "x-admin-key: vidyut_admin_secret_key" \
  -d '{"skillName": "Python", "newLevel": "PROFICIENT", "accuracy": 0.95}'
```
Refreshing the Roadmap page will immediately demonstrate Python transitioning to **Mastered**, the readiness score jumping, and the **Next Best Skill** advancing.
