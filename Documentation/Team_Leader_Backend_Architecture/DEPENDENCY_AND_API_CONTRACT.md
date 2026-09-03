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

### A. Database Session Dependency
Provide an async or sync session generator in `src/database/session.py`:
```python
# Other devs will import this:
from src.database.session import get_db

@router.get("/my-route")
def my_endpoint(db: Session = Depends(get_db)):
    ...
```

### B. Authentication & Role-Based Middleware
Provide `get_current_user` in `src/auth/dependencies.py`:
```python
# Other devs will protect their routes like this:
from src.auth.dependencies import get_current_user, require_role

@router.get("/student/secret")
def get_secret(current_user: User = Depends(get_current_user)):
    # current_user.id, current_user.role are guaranteed valid
    ...
```

### C. Standard Response Envelope Helper
Provide standard response wrapper in `src/core/responses.py`:
```python
def api_response(data=None, success=True, error=None):
    return {
        "success": success,
        "data": data,
        "error": error,
        "meta": {"timestamp": datetime.utcnow().isoformat(), "version": "1.0"}
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
In your central `src/main.py`, you assemble the modular monolith by including routers created by the other 3 members:

```python
from fastapi import FastAPI
from src.auth.router import router as auth_router
from src.core.profile_router import router as profile_router
from src.modules.skill_graph.router import router as skill_router       # From Member 4
from src.modules.assessment.router import router as assessment_router   # From Member 4
from src.modules.roadmap.router import router as roadmap_router         # From Member 4
from src.modules.opportunities.router import router as opps_router      # From Member 5
from src.modules.recommendation.router import router as rec_router      # From Member 6

app = FastAPI(title="Vidyut API", version="1.0")

# Mount Auth & Core (Yours)
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(profile_router, prefix="/api/v1/profile", tags=["Profile"])

# Mount Skill Graph & Assessments (Member 4)
app.include_router(skill_router, prefix="/api/v1/careers", tags=["Careers & Skills"])
app.include_router(assessment_router, prefix="/api/v1/assessments", tags=["Assessments"])
app.include_router(roadmap_router, prefix="/api/v1/roadmap", tags=["Roadmap"])

# Mount Opportunities (Member 5)
app.include_router(opps_router, prefix="/api/v1/opportunities", tags=["Opportunities"])

# Mount Recommendations (Member 6)
app.include_router(rec_router, prefix="/api/v1/recommendations", tags=["Recommendations"])
```
