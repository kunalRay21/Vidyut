# Data Engineer (Member 5): Implementation Plan & Technical Spec
**Role:** Data Pipeline, Web Scraping & Opportunity Index Specialist  
**Skill Requirement:** Python, Web Scraping (BeautifulSoup / Playwright / Requests), Data Normalization (Zero ML required)  
**Target Codebase Location:** `src/pipeline/`, `src/modules/opportunities/`

---

## 1. Why This Is Your Role
You are responsible for **feeding real-world opportunities into Vidyut**.  
You do **not** do machine learning. Your job is to collect, clean, deduplicate, and store internships, hackathons, and competitions from:
1. **Unstop** (Hackathons, coding challenges, student competitions)
2. **Internshala** (Internships, traineeships)
3. **AICTE Internship Portal** (Government & corporate apprenticeships)
4. **Direct Industry Postings** (Opportunities posted through the Industry Portal)

---

## 2. Your Core Responsibilities

### A. The Opportunity Index Schema
- Implement the `opportunities` table in PostgreSQL:
  - `id` (UUID)
  - `external_id`, `source` (`UNSTOP`, `INTERNSHALA`, `AICTE`, `DIRECT`)
  - `original_url`, `title`, `organization`, `type` (`INTERNSHIP`, `HACKATHON`, `PROJECT`)
  - `mode` (`REMOTE`, `ON_SITE`, `HYBRID`), `location`, `deadline`, `stipend`
  - `description_raw`, `eligibility_raw`
  - `fingerprint` (Unique hash preventing duplicates)
  - `is_active` (Boolean)
- Implement `opportunity_skill_tags` table:
  - Links opportunity IDs to canonical `skill_id` tags.

### B. Reliable Seed Dataset (Top Priority for Demo)
> [!IMPORTANT]
> Live scrapers can get rate-limited or blocked during a live demo. Your **#1 deliverable** is a robust manual seed dataset!
- Create `data/seed_opportunities.json` containing **50 to 100 real, verified opportunities**:
  - 25+ Backend Engineering internships/hackathons.
  - 25+ Machine Learning / Data Science internships/hackathons.
  - Correct external redirect URLs, realistic stipends, and explicit skill tags.
- Build `manual_seed_loader.py` to populate the database with one command.

### C. Connectors & Deduplication Engine
- Build isolated source connectors in `src/pipeline/connectors/`:
  - `unstop_connector.py`
  - `internshala_connector.py`
  - `aicte_connector.py`
- Enforce politeness rules:
  - Minimum 3-second delay between requests.
  - Descriptive User-Agent.
- Implement **Deduplication**:
  - Compute fingerprint: `hash(source + external_id)` or `hash(title + org + deadline)`.
  - If existing $\rightarrow$ update `last_seen_at`. If new $\rightarrow$ insert.

### D. Opportunity Serving APIs
- `GET /api/v1/opportunities`: Paginated browse endpoint with filters for type (`INTERNSHIP`, `HACKATHON`), mode (`REMOTE`), and domain.
- `GET /api/v1/opportunities/:id`: Returns full details and original apply link.
- `POST /api/v1/opportunities/direct`: Inserts opportunities posted directly by companies from Developer 2's recruiter portal.

---

## 3. Antigravity CLI Vibe-Coding Prompts

### Prompt 1: Opportunity Schema & 100-Item Seed Loader
```text
I am the Data Engineer for Vidyut.
1. In src/modules/opportunities/, create SQLAlchemy models for Opportunity and OpportunitySkillTag.
2. In data/seed_opportunities.json, generate a realistic dataset of 60 opportunities (25 ML internships, 20 Backend internships, 15 hackathons) with titles, companies, stipends, deadlines, and skill tags.
3. Write a seed script src/pipeline/manual_seed_loader.py that loads this JSON into PostgreSQL with fingerprint deduplication.
```

### Prompt 2: Web Scraping Pipeline Architecture
```text
In src/pipeline/:
1. Create a BaseConnector abstract class with rate-limiting (3s delay), session management, and error handling.
2. Implement UnstopConnector and InternshalaConnector that scrape public listings for 'Backend' and 'Machine Learning' tags.
3. Add a normalizer that maps raw HTML/JSON into the standard Opportunity dictionary schema.
```

### Prompt 3: Opportunity Search & Filter API
```text
In src/modules/opportunities/router.py:
Build FastAPI endpoints:
1. GET /api/v1/opportunities with query params: domain, role, type (INTERNSHIP/HACKATHON), mode (REMOTE/ON_SITE), page, limit.
2. GET /api/v1/opportunities/{id} returning opportunity details and canonical redirect URL.
3. POST /api/v1/opportunities/direct to receive recruiter job postings and tag them with skill IDs.
```
