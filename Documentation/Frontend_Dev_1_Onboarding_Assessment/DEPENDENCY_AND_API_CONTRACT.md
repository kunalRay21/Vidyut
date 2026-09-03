# Frontend Developer 1: Dependencies & API Contract Cheat-Sheet
**Your Role:** Student Entry, Assessment Flow & Academic Institution Portal  
**Your Primary Counterparts:** Team Leader (Auth/Institution) & Backend Dev (Member 4 - Skill Graph & Quiz)

---

## 1. Relevant Database Models (Read-Only Awareness)
You do not query the database directly, but these models define the data you send and receive:
- [users & student_profiles](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#1-authentication--users-owned-by-team-leader)
- [institutions](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#2-profiles--entities-owned-by-team-leader)
- [domains, roles, skills](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#3-career--skill-graph-dag-owned-by-member-4)
- [questions & assessment_sessions](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#4-student-skill-state--assessments-owned-by-member-4)

---

## 2. APIs You Must CALL (Consume)

### From Team Leader (Core Backend & Auth)

#### 1. Student Registration
- **Call:** `POST /api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "securepassword123",
    "full_name": "Priya Sharma",
    "institution": "VIT Chennai",
    "degree": "B.Tech CSE",
    "year_of_study": 2,
    "interests": ["AI/ML", "Backend"]
  }
  ```
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": { "id": "uuid-1", "email": "student@example.com", "role": "STUDENT" }
    }
  }
  ```
- **Action:** Store token in `localStorage.setItem('access_token', token)`.

#### 2. User Login
- **Call:** `POST /api/v1/auth/login`
- **Request Body:** `{ "email": "...", "password": "..." }`
- **Response Expected:** Same envelope with `access_token` and `user.role`.

#### 3. Institution Registration
- **Call:** `POST /api/v1/institution/register` (Requires Authorization Header)
- **Request Body:**
  ```json
  {
    "college_name": "VIT Chennai",
    "aishe_code": "C-36944",
    "officer_name": "Dr. Rajesh Kumar",
    "departments": ["Computer Science", "Information Tech", "AI & DS"]
  }
  ```
- **Response Expected:** `{ "success": true, "data": { "institution_id": "inst-101" } }`

#### 4. Institution Cohort Metrics
- **Call:** `GET /api/v1/institution/metrics`
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "total_students": 420,
      "average_readiness": 54.2,
      "distribution": { "ready_now_pct": 22, "almost_ready_pct": 48, "needs_foundation_pct": 30 },
      "curriculum_gaps": [
        { "skill": "Docker", "cohort_avg": 24, "industry_target": 70 }
      ]
    }
  }
  ```

---

### From Backend Dev (Member 4 - Skill Graph & Assessment)

#### 5. Get Career Domains
- **Call:** `GET /api/v1/careers/domains`
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "domain-ai-ml",
        "name": "Data and AI",
        "demand_level": "HIGH",
        "top_technologies": ["Python", "PyTorch", "SQL"]
      }
    ]
  }
  ```

#### 6. Get Role Details & Skills for Selected Domain
- **Call:** `GET /api/v1/careers/roles/{role_id}`
- **Response Expected:** Returns role object and list of skills to render on the self-assessment page.

#### 7. Submit Self-Assessment Ratings
- **Call:** `POST /api/v1/assessments/self` (Header: `Authorization: Bearer <token>`)
- **Request Body:**
  ```json
  {
    "role_id": "role-ml-engineer",
    "ratings": [
      { "skill_id": "skill-python", "rating": "AVERAGE" },
      { "skill_id": "skill-git", "rating": "AVERAGE" }
    ]
  }
  ```
- **Response Expected:** `{ "success": true, "data": { "status": "SAVED" } }`

#### 8. Start Calibrated MCQ Quiz
- **Call:** `POST /api/v1/assessments/start`
- **Request Body:** `{ "role_id": "role-ml-engineer" }`
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "session_id": "sess-9901",
      "total_questions": 20,
      "questions": [
        {
          "id": "q1",
          "skill_id": "skill-python",
          "question_text": "In Python, which creates a shallow copy?",
          "options": [
            { "label": "A", "text": "b = a" },
            { "label": "B", "text": "b = a[:]" }
          ]
        }
      ]
    }
  }
  ```

#### 9. Submit Quiz Answers
- **Call:** `POST /api/v1/assessments/{session_id}/submit`
- **Request Body:**
  ```json
  {
    "answers": [
      { "question_id": "q1", "selected_option": "B", "time_taken_secs": 14 }
    ]
  }
  ```
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "discrepancies": [
        "Your Git skills are stronger than expected! Fast-tracked."
      ],
      "next_url": "/dashboard"
    }
  }
  ```
- **Action:** Show the discrepancy modal, then call `navigate('/dashboard')`.

---

## 3. What You PROVIDE (Handoff)
- When the student finishes the assessment quiz, your workstream is complete. Simply redirect the browser to `/dashboard`. Developer 2 picks up the session from there.
