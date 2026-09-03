# Team Leader: Dependencies & Architecture Contract Cheat-Sheet
**Your Role:** System Architect, Core Backend & Integration Lead  
**Your Mission:** Keep all 5 team members unblocked by maintaining the shared database, auth utilities, and mounting everyone's routers into one modular monolith.

---

## 1. Tables You Own & Maintain
You own the initialization scripts and migrations for the primary entity tables:
- [`users`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#1-authentication--users-owned-by-team-leader)
- [`student_profiles`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#2-profiles--entities-owned-by-team-leader)
- [`institutions`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#2-profiles--entities-owned-by-team-leader)
- [`companies`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#2-profiles--entities-owned-by-team-leader)

---

## 2. Shared Utilities You PROVIDE to Other Backend Members

### A. Database Pool
Provide a PostgreSQL pool/client in `src/database/db.ts`:
```typescript
// Other devs will import this:
import { pool } from '../database/db';

router.get('/my-route', async (req, res) => {
  const result = await pool.query('SELECT * FROM my_table');
  ...
});
```

### B. Authentication & Role-Based Middleware
Provide `authenticateJWT` and `requireRole` in `src/auth/middleware.ts`:
```typescript
// Other devs will protect their routes like this:
import { authenticateJWT, requireRole } from '../auth/middleware';

router.get('/student/secret', authenticateJWT, requireRole(['STUDENT']), (req, res) => {
  const studentId = req.user.id;
  ...
});
```

### C. Standard Response Envelope Helper
Provide standard response wrapper in `src/core/responses.ts`:
```typescript
export function apiResponse(res: Response, data: any = null, success = true, error: any = null) {
  return res.json({
    success,
    data,
    error,
    meta: { timestamp: new Date().toISOString(), version: '1.0' }
  });
}
```

---

## 3. Endpoints You PROVIDE to Frontend

### For Frontend Developer 1:
- `POST /api/v1/auth/register` (student registration with degree/year metadata)
- `POST /api/v1/auth/login` (returns JWT + role claim)
- `POST /api/v1/institution/register` (registers college + TPO)
- `GET /api/v1/institution/metrics` (cohort readiness distribution & skill gaps)

### For Frontend Developer 2:
- `GET /api/v1/profile/me` & `PUT /api/v1/profile/me`
- `POST /api/v1/industry/register` (registers company + sector)

---

## 4. Routers You MOUNT from Other Backend Members
In your central `src/server.ts`, you assemble the modular monolith by mounting routers created by the other 3 members:

```typescript
import express from 'express';
import authRouter from './auth/router';
import profileRouter from './core/profileRouter';
import skillRouter from './modules/skill_graph/router';     // From Member 4
import assessmentRouter from './modules/assessment/router'; // From Member 4
import roadmapRouter from './modules/roadmap/router';       // From Member 4
import oppsRouter from './modules/opportunities/router';    // From Member 5
import recRouter from './modules/recommendation/router';    // From Member 6

const app = express();

// Mount Auth & Core (Yours)
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);

// Mount Skill Graph & Assessments (Member 4)
app.use('/api/v1/careers', skillRouter);
app.use('/api/v1/assessments', assessmentRouter);
app.use('/api/v1/roadmap', roadmapRouter);

// Mount Opportunities (Member 5)
app.use('/api/v1/opportunities', oppsRouter);

// Mount Recommendations (Member 6)
app.use('/api/v1/recommendations', recRouter);
```
```
