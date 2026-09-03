# AI/ML Specialist (Member 6): Implementation Plan & Technical Spec
**Role:** AI, LLM Orchestration & Intelligent Recommendation Specialist  
**Skill Requirement:** Python, Google Gemini / OpenAI APIs, Prompt Engineering, Scoring Math & Embeddings  
**Target Codebase Location:** `src/modules/ai/`, `src/modules/recommendation/`

---

## 1. Why This Is Your Role
You are the **sole owner of all AI/ML and Recommendation Intelligence** in Vidyut:
- You ensure AI is **transparent, explainable, and reliable** (not a mysterious black box).
- You implement the **deterministic compatibility scoring formula** that ranks opportunities for students.
- You build the **AI Module wrapper** connecting to Google Gemini (or OpenAI) to extract skills, generate questions, and produce personalized natural-language match explanations.
- You build **fail-safes**: If an LLM API is slow, rate-limited, or offline, your service gracefully falls back to template text so the demo never crashes.

---

## 2. Your Core Responsibilities

### A. The Deterministic Compatibility Scoring Engine
Implement the exact mathematical formula defined in Section 16 of the architecture doc:

$$\text{Compatibility Score} = (0.50 \times \text{Skill Match}) + (0.25 \times \text{Career Alignment}) + (0.15 \times \text{Eligibility}) + (0.10 \times \text{Interest})$$

1. **Skill Match Score (0.0 to 1.0):**
   $$\text{Score} = \frac{\sum \min(\text{student\_level}, \text{required\_level}) \times \text{weight}}{\sum (\text{required\_level} \times \text{weight})}$$
2. **Career Alignment Score:** $1.0$ (exact role match), $0.5$ (same domain), $0.0$ (different domain).
3. **Eligibility Score:** $1.0$ if student year/degree matches opportunity criteria; otherwise $0.0$.
4. **Interest Score:** Overlap ratio between student onboarding tags and opportunity tags.

**3-Tier Segmentation Output:**
- **Ready Now ($\ge 0.75$):** *"You are a strong match"*
- **Almost Ready ($0.50 - 0.74$):** *"Close match — missing 1 to 2 skills"*
- **Aspirational ($0.25 - 0.49$):** *"Future target — keep progressing"*
- *$< 0.25$:* Filtered out.

---

### B. The AI Module (LLM Gateway)
Create a centralized service `src/modules/ai/ai_service.py` that wraps Google Gemini API (Recommended: Free tier, fast response):
- **Never let other modules call Gemini directly.**
- Strict pipeline: `validateInput()` $\rightarrow$ `buildPrompt()` $\rightarrow$ `callGemini()` $\rightarrow$ `validateJSON()` $\rightarrow$ `fallback()`.
- **Graceful Fallback:** If Gemini fails or times out, immediately return pre-written structured templates without raising an unhandled exception.

---

### C. AI-Powered Capabilities to Deliver
1. **Personalized Explanation Generator:**
   - Input: Student's matched skills, gap skills, and opportunity title.
   - Output: 2-sentence conversational explanation:
     > *"Strong match — your Python and Git skills align well with this role. Strengthening SQL will make you a top candidate."*
2. **AI Skill Extractor for Job Descriptions:**
   - Takes raw unstructured internship text $\rightarrow$ outputs canonical skill IDs from the Skill Graph.
3. **Semantic Opportunity Matcher:**
   - Generates text embeddings using `text-embedding-004` to compare student profile descriptions against vague job descriptions.

---

## 3. Endpoints You Deliver
- `GET /api/v1/recommendations/opportunities`: Returns personalized, segmented (`ready_now`, `almost_ready`, `aspirational`) opportunities with scores and explanations for Frontend Developer 2.
- `POST /api/v1/ai/extract-skills`: Utility endpoint used by the Data Engineer to extract skills from scraped job text.

---

## 4. Antigravity CLI Vibe-Coding Prompts

### Prompt 1: Deterministic Compatibility Scorer & Segmentation
```text
I am the AI & Recommendation Specialist for Vidyut.
In src/modules/recommendation/:
1. Implement compute_compatibility_score(student_profile, opportunity) using the formula:
   (skill_match * 0.50) + (career_alignment * 0.25) + (eligibility * 0.15) + (interest * 0.10).
2. Segment opportunities into 'ready_now' (>=0.75), 'almost_ready' (0.50-0.74), and 'aspirational' (0.25-0.49).
3. Return identified 'matching_skills' and 'gap_skills'.
Include unit tests verifying the scoring math against Priya's ML Engineer scenario.
```

### Prompt 2: Centralized Gemini AI Service with Fallback
```text
In src/modules/ai/:
1. Build GeminiService using google-generativeai SDK with API key from environment variables.
2. Implement generate_match_explanation(matched_skills, gap_skills, opportunity_title):
   - Uses structured prompt to produce a student-friendly 2-sentence explanation.
   - If the API call fails or times out (after 4 seconds), fall back to:
     "Good match for your current skill set. Focus on {gaps} to boost your chances."
3. Implement extract_skills_from_text(raw_text, available_skill_names) returning matched skill tags in JSON.
```

### Prompt 3: Recommendations Router
```text
In src/modules/recommendation/router.py:
Build GET /api/v1/recommendations/opportunities:
1. Extract current student from auth session.
2. Fetch active opportunities from database.
3. Run the scoring algorithm across opportunities in memory.
4. Enrich top 5 matches with AI explanations.
5. Return JSON payload matching Frontend Developer 2's expected schema.
```
