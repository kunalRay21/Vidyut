# Vidyut — Adaptive Career & Skill Trainer
> **SIH Problem Statement 26044:** Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement

Vidyut is an adaptive career-readiness intelligence platform that constructs standardized career & skill graphs (DAGs), assesses student skills through calibrated diagnostic testing, generates dynamic prerequisite-aware learning roadmaps, and deterministically matches verified students to real opportunities (Unstop, Internshala, AICTE).

---

## 📁 Project Architecture & Team Separation

This project is built as a **Modular Monolith** designed for a 6-person team with strictly isolated boundaries:

| Workstream | Owner | Implementation Plan | API & Contract Cheat-Sheet |
| :--- | :--- | :--- | :--- |
| **Frontend: Student Intake & Institutions** | Dev 1 | [Dev 1 Plan](Documentation/Frontend_Dev_1_Onboarding_Assessment/IMPLEMENTATION_PLAN.md) | [Dev 1 Contract](Documentation/Frontend_Dev_1_Onboarding_Assessment/DEPENDENCY_AND_API_CONTRACT.md) |
| **Frontend: Progression & Industry Portal** | Dev 2 | [Dev 2 Plan](Documentation/Frontend_Dev_2_Dashboard_Opportunities/IMPLEMENTATION_PLAN.md) | [Dev 2 Contract](Documentation/Frontend_Dev_2_Dashboard_Opportunities/DEPENDENCY_AND_API_CONTRACT.md) |
| **System Architecture, Auth, DB & Lead** | Leader | [Leader Plan](Documentation/Team_Leader_Backend_Architecture/IMPLEMENTATION_PLAN.md) | [Leader Contract](Documentation/Team_Leader_Backend_Architecture/DEPENDENCY_AND_API_CONTRACT.md) |
| **Skill Graph (DAG) & Assessment Logic** | Dev 4 | [Member 4 Plan](Documentation/Backend_Dev_SkillGraph_Assessment/IMPLEMENTATION_PLAN.md) | [Member 4 Contract](Documentation/Backend_Dev_SkillGraph_Assessment/DEPENDENCY_AND_API_CONTRACT.md) |
| **Data Scraping & Opportunity Index** | Dev 5 | [Member 5 Plan](Documentation/Data_Engineer_Scraping_Ingestion/IMPLEMENTATION_PLAN.md) | [Member 5 Contract](Documentation/Data_Engineer_Scraping_Ingestion/DEPENDENCY_AND_API_CONTRACT.md) |
| **AI / ML & Recommendation Engine** | Dev 6 | [Member 6 Plan](Documentation/AI_ML_Recommendation_Specialist/IMPLEMENTATION_PLAN.md) | [Member 6 Contract](Documentation/AI_ML_Recommendation_Specialist/DEPENDENCY_AND_API_CONTRACT.md) |

- **Master Database Schema:** [MASTER_DATABASE_SCHEMA.md](Documentation/MASTER_DATABASE_SCHEMA.md)
- **Git & Collaboration Rules:** [GITHUB_RULES.md](Documentation/GITHUB_RULES.md)

---

## 🚀 Getting Started

### 1. Database & Infrastructure
Start PostgreSQL 16 and Redis using Docker:
```bash
docker compose up -d
```

### 2. Backend (FastAPI Modular Monolith)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Client application will be live at: `http://localhost:5173`
