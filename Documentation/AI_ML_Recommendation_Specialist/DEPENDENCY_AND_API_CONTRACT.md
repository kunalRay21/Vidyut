# Member 6 (AI Specialist): Dependencies & Contract Cheat-Sheet
**Your Role:** AI, LLM Orchestration & Intelligent Recommendation Specialist  
**Your Primary Counterparts:** Team Leader (Auth & Env), Member 4 (Student Skills), Member 5 (Opportunities), and Frontend 2 (Recommendation Cards)

---

## 1. Tables You Own & Maintain
You own the caching table for computed recommendations:
- [`recommendations`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#7-recommendations--explanations-owned-by-member-6)

---

## 2. Dependencies You NEED (Consume)

### From Team Leader:
- `GEMINI_API_KEY` passed via `.env`.
- `get_db` database session dependency from `src.database.session`.
- `get_current_user` auth dependency to obtain the logged-in student's identity.

### From Member 4 (Skill Graph Specialist):
- You need the student's evaluated skills. Call Member 4's internal Python service:
  ```python
  from src.modules.assessment.service import get_student_evaluated_skills
  
  # Returns list of { skill_id, skill_name, assessed_level, target_level, weight }
  student_skills = get_student_evaluated_skills(student_id)
  ```

### From Member 5 (Data Engineer):
- You need the opportunities and their skill tags:
  ```python
  from src.modules.opportunities.models import Opportunity
  
  active_opps = db.query(Opportunity).filter(Opportunity.is_active == True).all()
  ```

---

## 3. What You PROVIDE to Other Team Members

### Internal Service for Data Engineer (Member 5):
Export an AI skill extraction function:
```python
# In src/modules/ai/ai_service.py:
def extract_skills_from_text(raw_text: str) -> List[str]:
    """
    Calls Gemini API with structured prompt to pull skill keywords from job description.
    Falls back to regex keyword matching if Gemini fails.
    """
    ...
```

---

### For Frontend Developer 2 (Recommendations & Recruiter Search):

#### 1. Personalized Ranked Opportunities with AI Explanations
- **Endpoint:** `GET /api/v1/recommendations/opportunities` (Header: `Authorization: Bearer <token>`)
- **Internal Action:**
  1. Computes compatibility formula: $(0.50 \times \text{skill}) + (0.25 \times \text{role}) + (0.15 \times \text{eligibility}) + (0.10 \times \text{interest})$.
  2. Segments into 3 tiers: `ready_now` ($\ge 0.75$), `almost_ready` ($0.50 - 0.74$), `aspirational` ($0.25 - 0.49$).
  3. Calls Gemini for top items to generate a 2-sentence conversational explanation (with template fallback).
- **Response Format Expected by Frontend 2:**
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
            "summary": "Strong match — your Python and ML fundamentals align well for this challenge.",
            "matching_skills": ["Python", "ML Fundamentals", "Git"],
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
          "source": "INTERNSHALA",
          "original_url": "https://internshala.com/...",
          "explanation": {
            "summary": "Close match. Strengthening pandas and scikit-learn will qualify you.",
            "matching_skills": ["Python", "ML Fundamentals"],
            "gap_skills": ["pandas", "SQL"]
          }
        }
      ],
      "aspirational": []
    }
  }
  ```

#### 2. Candidate Talent Pool Search (for Industry Recruiter Portal)
- **Endpoint:** `GET /api/v1/industry/talent?min_score=70`
- **Response Format:**
  ```json
  {
    "success": true,
    "data": [
      {
        "candidate_alias": "Candidate #4812 (VIT Chennai - 2nd Year)",
        "role_target": "Machine Learning Engineer",
        "readiness_score": 78,
        "verified_skills": ["Python", "ML Fundamentals", "Git"],
        "status": "Ready Now"
      }
    ]
  }
  ```
