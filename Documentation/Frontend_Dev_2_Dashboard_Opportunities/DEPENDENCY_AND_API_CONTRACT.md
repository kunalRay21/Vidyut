# Frontend Developer 2: Dependencies & API Contract Cheat-Sheet
**Your Role:** Student Progression, Adaptive Roadmap & Industry Recruiter Portal  
**Your Primary Counterparts:** Backend Dev (Member 4 - Roadmap/Skills), Data Engineer (Member 5), and AI Specialist (Member 6)

---

## 1. Relevant Database Models (Read-Only Awareness)
These models define the shape of your dashboard, roadmap, and opportunities:
- [student_profiles & student_skill_states](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#4-student-skill-state--assessments-owned-by-member-4)
- [roadmap_states & milestones](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#5-adaptive-roadmap-owned-by-member-4)
- [opportunities & recommendations](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#6-opportunity-index-owned-by-member-5)
- [companies](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#2-profiles--entities-owned-by-team-leader)

---

## 2. APIs You Must CALL (Consume)

### From Team Leader (Core Backend)

#### 1. Fetch Student Profile
- **Call:** `GET /api/v1/profile/me` (Header: `Authorization: Bearer <token>`)
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "full_name": "Priya Sharma",
      "institution": "VIT Chennai",
      "degree": "B.Tech CSE",
      "year_of_study": 2,
      "selected_role": "Machine Learning Engineer"
    }
  }
  ```

#### 2. Industry Partner Registration
- **Call:** `POST /api/v1/industry/register`
- **Request Body:**
  ```json
  {
    "company_name": "Bangalore Analytics Co.",
    "sector": "Artificial Intelligence & Analytics",
    "website": "https://bangaloreanalytics.example.com"
  }
  ```

---

### From Backend Dev (Member 4 - Skill Graph & Roadmap)

#### 3. Fetch Student Skill Matrix & Readiness
- **Call:** `GET /api/v1/profile/me/skills`
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "readiness_pct": 14.0,
      "skills": [
        { "name": "Programming Fundamentals", "assessed_level": "PROFICIENT", "target_level": "PROFICIENT", "status": "completed" },
        { "name": "Python", "assessed_level": "BEGINNER", "target_level": "PROFICIENT", "status": "in_progress" },
        { "name": "SQL", "assessed_level": "AWARENESS", "target_level": "INTERMEDIATE", "status": "not_started" }
      ]
    }
  }
  ```

#### 4. Fetch Student Roadmap
- **Call:** `GET /api/v1/roadmap`
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "phases": [
        {
          "phase_number": 1,
          "title": "Python and Programming Core",
          "milestones": [
            { "id": "m1", "title": "Python Language (Intermediate)", "status": "IN_PROGRESS" }
          ]
        },
        {
          "phase_number": 4,
          "title": "Core Machine Learning",
          "has_decision_point": true,
          "decision_options": [
            { "branch_id": "branch-tf", "name": "TensorFlow" },
            { "branch_id": "branch-pytorch", "name": "PyTorch" }
          ]
        }
      ]
    }
  }
  ```

#### 5. Choose Decision Branch & Recalculate Roadmap
- **Call:** `POST /api/v1/roadmap/branch`
- **Request Body:** `{ "branch_id": "branch-pytorch" }`
- **Response Expected:** Returns the updated roadmap object with Phase 5 populated with PyTorch milestones.

#### 6. Submit Milestone Evidence
- **Call:** `POST /api/v1/portfolio/evidence`
- **Request Body:**
  ```json
  {
    "skill_id": "skill-pandas",
    "type": "GITHUB",
    "title": "Data Analysis Mini Project",
    "url": "https://github.com/priya/pandas-eda",
    "description": "Exploratory data analysis on dataset with 10k rows"
  }
  ```
- **Response Expected:** `{ "success": true, "data": { "new_readiness_pct": 19.0 } }`

---

### From Data Engineer (Member 5 - Direct Postings)

#### 7. Post Recruiter Opportunity (From Industry Portal)
- **Call:** `POST /api/v1/opportunities/direct`
- **Request Body:**
  ```json
  {
    "title": "Junior ML Engineer Intern",
    "type": "INTERNSHIP",
    "mode": "REMOTE",
    "stipend": "₹25,000 / month",
    "description": "Work on computer vision and predictive models.",
    "required_skills": [
      { "skill_id": "skill-python", "min_proficiency": "PROFICIENT" },
      { "skill_id": "skill-ml-fund", "min_proficiency": "INTERMEDIATE" }
    ]
  }
  ```

---

### From AI/ML Specialist (Member 6 - Recommendations & Talent Search)

#### 8. Fetch Matched Opportunities with AI Explanations
- **Call:** `GET /api/v1/recommendations/opportunities`
- **Response Expected:**
  ```json
  {
    "success": true,
    "data": {
      "ready_now": [
        {
          "id": "opp-1",
          "title": "AI for Good Hackathon",
          "organization": "Unstop x NASSCOM",
          "compatibility_score": 0.78,
          "source": "UNSTOP",
          "original_url": "https://unstop.com/...",
          "explanation": {
            "summary": "Strong match — your Python and ML fundamentals align well.",
            "matching_skills": ["Python", "ML Fundamentals"],
            "gap_skills": []
          }
        }
      ],
      "almost_ready": [
        {
          "id": "opp-2",
          "title": "Junior ML Engineer Intern",
          "organization": "Bangalore Analytics Co.",
          "compatibility_score": 0.61,
          "explanation": {
            "summary": "Close match. Strengthen pandas and scikit-learn to qualify.",
            "matching_skills": ["Python"],
            "gap_skills": ["pandas", "SQL"]
          }
        }
      ],
      "aspirational": []
    }
  }
  ```

#### 9. Recruiter Talent Pool Search
- **Call:** `GET /api/v1/industry/talent?min_score=70`
- **Response Expected:** List of matching candidate aliases with verified badges and readiness scores.
