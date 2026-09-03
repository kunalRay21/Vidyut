# Member 5 (Data Engineer): Dependencies & Contract Cheat-Sheet
**Your Role:** Data Pipeline, Web Scraping & Opportunity Index Specialist  
**Your Primary Counterparts:** Team Leader (Database), Member 4 (Skill Taxonomy), Member 6 (AI Skill Extraction), and Frontend 2 (Opportunities UI)

---

## 1. Tables You Own & Maintain
You own the schemas, scraping loaders, and seed datasets for:
- [`opportunities`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#6-opportunity-index-owned-by-member-5)
- [`opportunity_skill_tags`](file:///D:/Projects/Vidyut/Documentation/MASTER_DATABASE_SCHEMA.md#6-opportunity-index-owned-by-member-5)

---

## 2. Dependencies You NEED (Consume)

### From Team Leader:
- `get_db` database session dependency from `src.database.session`.

### From Member 4 (Skill Graph Specialist):
- You need the canonical skill taxonomy (table `skills`) to link opportunities to valid skill IDs:
  ```python
  # Query Member 4's table:
  skills = db.query(Skill).all()
  skill_lookup = {s.name.lower(): s.id for s in skills}
  ```

### From Member 6 (AI Specialist):
- For unstructured job descriptions where simple keyword matching is ambiguous, call Member 6's internal AI extractor:
  ```python
  from src.modules.ai.ai_service import extract_skills_from_text
  
  extracted_skill_names = extract_skills_from_text(raw_html_description)
  ```

---

## 3. What You PROVIDE to Other Team Members

### To AI Specialist (Member 6):
- You populate and maintain the `opportunities` table with at least **60–100 clean, deduplicated rows** (via `seed_opportunities.json` and your live scrapers).
- Member 6 reads directly from `opportunities` and `opportunity_skill_tags` to generate student recommendation rankings.

### For Frontend Developer 2 (Opportunities & Industry Portal):

#### 1. Browse All Opportunities (Public Index)
- **Endpoint:** `GET /api/v1/opportunities`
- **Query Params:** `?type=INTERNSHIP&mode=REMOTE&page=1&limit=10`
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "opp-101",
          "title": "Backend Engineering Intern",
          "organization": "Acme Corp",
          "type": "INTERNSHIP",
          "mode": "REMOTE",
          "stipend": "₹20,000 / month",
          "deadline": "2026-10-15",
          "source": "INTERNSHALA",
          "original_url": "https://internshala.com/..."
        }
      ],
      "total": 65
    }
  }
  ```

#### 2. Get Single Opportunity Detail
- **Endpoint:** `GET /api/v1/opportunities/{id}`

#### 3. Direct Opportunity Posting (from Recruiter Portal)
- **Endpoint:** `POST /api/v1/opportunities/direct`
- **Request Body:**
  ```json
  {
    "title": "Junior ML Engineer Intern",
    "type": "INTERNSHIP",
    "mode": "HYBRID",
    "stipend": "₹25,000 / month",
    "description": "...",
    "required_skills": [
      { "skill_id": "skill-python", "min_proficiency": "PROFICIENT" }
    ]
  }
  ```
- **Action:** Inserts directly into `opportunities` and links `opportunity_skill_tags`.
