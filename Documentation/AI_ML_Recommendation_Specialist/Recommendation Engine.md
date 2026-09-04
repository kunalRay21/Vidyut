# Role 5 — AI / Recommendation Engine

### Technical Role Documentation v1.0

---

> **Document Status:** Stage 2 — Individual Role Documentation
> **Role:** AI / Recommendation Engine
> **Audience:** The team member responsible for this workstream
> **Depends on:** General Project Documentation v1.0, Role 2 Documentation v2.0 (Node.js), Role 3 Documentation v1.0, Role 4 Documentation v1.0

---

## Table of Contents

1. [Role Objective](#1-role-objective)
2. [Responsibility Boundary](#2-responsibility-boundary)
3. [Components Owned](#3-components-owned)
4. [Components Explicitly Not Owned](#4-components-explicitly-not-owned)
5. [Required Knowledge and Prerequisites](#5-required-knowledge-and-prerequisites)
6. [Technologies and Recommended Tools](#6-technologies-and-recommended-tools)
7. [Internal Architecture](#7-internal-architecture)
8. [Folder and Package Structure](#8-folder-and-package-structure)
9. [Detailed Workflows](#9-detailed-workflows)
10. [Inputs](#10-inputs)
11. [Outputs](#11-outputs)
12. [Data Models Owned](#12-data-models-owned)
13. [Database Tables Owned](#13-database-tables-owned)
14. [API Endpoints Owned](#14-api-endpoints-owned)
15. [API Request and Response Contracts](#15-api-request-and-response-contracts)
16. [Interfaces with Other Roles](#16-interfaces-with-other-roles)
17. [Data Contracts Between Modules](#17-data-contracts-between-modules)
18. [Algorithms and Business Logic](#18-algorithms-and-business-logic)
19. [AI Usage](#19-ai-usage)
20. [External Integrations](#20-external-integrations)
21. [Error Handling](#21-error-handling)
22. [Validation](#22-validation)
23. [Security Considerations](#23-security-considerations)
24. [Testing Strategy](#24-testing-strategy)
25. [Development Sequence](#25-development-sequence)
26. [Dependencies](#26-dependencies)
27. [Git Branch and Workflow Expectations](#27-git-branch-and-workflow-expectations)
28. [Definition of Done](#28-definition-of-done)
29. [Integration Checklist](#29-integration-checklist)
30. [Prototype-Specific Implementation](#30-prototype-specific-implementation)
31. [What Can Be Simplified for SIH](#31-what-can-be-simplified-for-sih)
32. [Future Production Improvements](#32-future-production-improvements)

---

## 1. Role Objective

**In one sentence:**

> Build the AI module that wraps all LLM interactions behind a controlled, validated interface, and build the recommendation engine that scores, ranks, segments, and explains opportunity matches for each student using deterministic algorithms augmented by AI.

This role sits at the **intelligence apex** of the platform. Everything the system has built — the skill graph, the student's assessed proficiency, the indexed opportunity data — converges here to answer the question every student actually cares about:

> *"What should I do next, and why?"*

This role has two inseparable sub-responsibilities:

1. **AI Module** — a controlled wrapper around all LLM API calls. Every other module that needs AI capability calls this module's service functions. No other module calls an LLM directly. The AI Module validates inputs, manages prompts, validates outputs, and handles failures gracefully.

2. **Recommendation Engine** — the scoring, ranking, segmentation, and explanation system that produces the student's personalized opportunity list and resource recommendations. The engine is **deterministic-first**: it uses an explicit, auditable formula. AI augments the quality of results but is never the sole decision-maker.

These two sub-responsibilities are inseparable because the recommendation engine's explanation quality depends on the AI Module, and the AI Module's purpose is defined by what the recommendation engine (and other consumers) need from it.

---

## 2. Responsibility Boundary

### You are responsible for

- The AI Module: all LLM API calls, prompt construction, response parsing, output validation, and graceful degradation
- The recommendation scoring formula: explicit weighted calculation of compatibility between a student profile and an opportunity
- The recommendation ranking and segmentation (Ready Now / Almost Ready / Aspirational)
- The explanation generation: converting structured match data into human-readable explanations (AI-assisted)
- The resource recommendation engine: matching learning resources to a student's current skill gaps
- The opportunity summary service function (consumed by Role 2's dashboard aggregator)
- The assessment question generation service (consumed by Role 3's assessment engine, optionally)
- The career exploration content enrichment (AI-generated domain explanations, called by Role 3 career module)
- Storing recommendation records in the `recommendations` table
- Exposing `GET /api/v1/recommendations/opportunities` and `GET /api/v1/recommendations/resources`

### You are not responsible for

- The skill taxonomy or graph structure (Role 3)
- The assessment scoring or proficiency assignment (Role 3)
- The roadmap generation algorithm (Role 3)
- The opportunity data collection or normalization (Role 4)
- The opportunity listing API (Role 4)
- Student profile CRUD (Role 2)
- Database schema (Role 2)
- Authentication infrastructure (Role 2)
- Frontend display (Role 1)

### The boundary in practice

Role 5 **reads** student skill states (from Role 2's profile service or directly from the database). It **reads** opportunity records (from the database populated by Role 4). It **computes** scores and **writes** recommendation records. It **serves** recommendations to Role 1.

If the skill states are wrong, that is a Role 3 problem.

If the opportunity data is wrong, that is a Role 4 problem.

If the scores or explanations are wrong, that is a Role 5 problem.

If the scores are correct but displayed confusingly, that is a Role 1 problem.

---

## 3. Components Owned

| Component | Description |
|---|---|
| `src/modules/ai/` | AI Module: all LLM interactions |
| `src/modules/ai/ai.service.ts` | Service functions called by other modules |
| `src/modules/ai/ai.client.ts` | LLM API client (provider-agnostic wrapper) |
| `src/modules/ai/prompts/` | Prompt templates for each AI task |
| `src/modules/ai/validators/` | Output validation for each AI task |
| `src/modules/recommendation/` | Recommendation module |
| `src/modules/recommendation/recommendation.service.ts` | Scoring, ranking, segmentation |
| `src/modules/recommendation/recommendation.controller.ts` | HTTP layer |
| `src/modules/recommendation/recommendation.routes.ts` | Route definitions |
| `src/modules/recommendation/explanation.service.ts` | Explanation generation |
| `src/modules/recommendation/resource-recommendation.service.ts` | Resource matching |

---

## 4. Components Explicitly Not Owned

| Component | Owner |
|---|---|
| `prisma/schema.prisma` | Role 2 |
| `src/modules/profile/` | Role 2 |
| `src/modules/career/` | Role 3 |
| `src/modules/skill/` | Role 3 |
| `src/modules/assessment/` | Role 3 |
| `src/modules/roadmap/` | Role 3 |
| `src/modules/opportunity/` | Role 4 |
| `data-pipeline/` | Role 4 |
| Frontend | Role 1 |
| Deployment | Role 6 |

---

## 5. Required Knowledge and Prerequisites

### Essential

| Topic | Why needed |
|---|---|
| TypeScript / Node.js | Working language |
| REST API consumption (HTTP/axios) | LLM API calls |
| Prisma ORM (read queries, joins) | Reading skill states and opportunity data |
| Express routing and middleware | Recommendation API endpoints |
| Zod | Input validation and AI output validation |
| JSON schema design | Structuring AI outputs for reliable parsing |
| Weighted scoring / linear algebra basics | Compatibility score formula |
| Git | Version control |

### Important

| Topic | Why needed |
|---|---|
| Prompt engineering fundamentals | Writing effective, reliable LLM prompts |
| LLM API usage (Gemini or OpenAI) | Calling the AI provider |
| Deterministic vs probabilistic system design | Knowing when to use rules vs AI |
| Jest + Supertest | Testing |
| Error handling for external API calls | LLM calls can fail in many ways |

### Helpful but not blocking

| Topic |
|---|
| Retrieval-Augmented Generation (RAG) concepts |
| Cosine similarity / vector embeddings |
| Evaluation metrics for recommendation quality |
| Information retrieval fundamentals |

### Critical mindset requirement

> **The AI must augment the system, not control it.**

The team member in this role must resist the instinct to delegate all decisions to the LLM. Every AI call must have:
- A deterministic fallback that works without it
- Output validation that catches hallucinations
- Clear documentation of what the AI is actually doing

The judges will ask: *"How does this recommendation work?"* The answer must be explainable without saying "the AI decided."

---

## 6. Technologies and Recommended Tools

### LLM provider

> **Decision Pending** — Final LLM provider selection.
> **Recommended default:** Google Gemini API (specifically `gemini-1.5-flash` model).
>
> **Rationale:**
> - Gemini Flash is free within generous rate limits suitable for a prototype demo
> - No billing required for the demo session
> - Fast response times suitable for real-time recommendation explanation
> - Strong JSON output mode (`responseMimeType: "application/json"`) for reliable structured output
> - Google AI SDK available for Node.js (`@google/generative-ai`)
>
> **Backup:** OpenAI `gpt-4o-mini` — slightly higher cost but excellent JSON mode reliability.

### Dependencies

| Package | Purpose |
|---|---|
| `@google/generative-ai` | Gemini API client (if using Gemini) |
| `openai` | OpenAI API client (if using OpenAI) |
| `axios` | HTTP client fallback if SDK unavailable |
| `zod` | AI output validation schemas |
| `@prisma/client` | Database reads |

### Testing

| Package | Purpose |
|---|---|
| `jest` | Test runner |
| `ts-jest` | TypeScript support |
| `supertest` | API integration tests |

### Development tools

| Tool | Purpose |
|---|---|
| Gemini AI Studio / OpenAI Playground | Prompt development and testing |
| `pino` (shared from Role 2) | Structured logging for AI calls |

---

## 7. Internal Architecture

### 7.1 Two-layer design

```
External request (GET /recommendations/opportunities)
              ↓
    RecommendationController
              ↓
    RecommendationService
    ┌─────────────────────────────────────────────┐
    │  1. Fetch student profile + skill states     │
    │     (profileService — Role 2)               │
    │                                             │
    │  2. Fetch candidate opportunities           │
    │     (Prisma direct read — Role 4 data)      │
    │                                             │
    │  3. Score each opportunity                  │
    │     (deterministic formula)                 │
    │                                             │
    │  4. Segment results                         │
    │     (threshold rules)                       │
    │                                             │
    │  5. Generate explanations                   │
    │     (ExplanationService → AIService)        │
    │                                             │
    │  6. Persist recommendations                 │
    │     (Prisma write)                          │
    │                                             │
    │  7. Return ranked, explained results        │
    └─────────────────────────────────────────────┘
              ↓
    AIService (called only for explanations)
              ↓
    AIClient (LLM API wrapper)
              ↓
    Gemini / OpenAI API
```

### 7.2 AI Module isolation principle

```
No other module calls the LLM directly.
All LLM calls go through AIService.

AIService contract:
  Input:  structured, validated data
  Output: structured, validated data OR deterministic fallback
  Throws: never (always returns something usable)
```

This isolation means:
- A Gemini outage does not break recommendations (fallback to template explanations)
- All prompts are in one place (easy to update, audit, and test)
- AI output validation is centralized (no scattered JSON.parse with no error handling)

### 7.3 Deterministic-first principle

```
Scoring:      100% deterministic formula
Segmentation: 100% deterministic thresholds
Ranking:      100% deterministic sort
Explanation:  AI-assisted, template fallback
Resources:    Deterministic skill-gap matching, AI ranking optional
Questions:    AI-generated, human-reviewed before activation
```

Every recommendation can be fully explained without AI. AI only improves the naturalness of the explanation.

---

## 8. Folder and Package Structure

```
src/modules/
│
├── ai/
│   ├── ai.service.ts              # Public API: functions other modules call
│   ├── ai.client.ts               # LLM provider wrapper (provider-agnostic)
│   ├── ai.types.ts                # Shared AI input/output types
│   │
│   ├── prompts/
│   │   ├── explanation.prompt.ts  # Prompt for opportunity match explanation
│   │   ├── questions.prompt.ts    # Prompt for assessment question generation
│   │   ├── skills.prompt.ts       # Prompt for skill extraction from text
│   │   └── career.prompt.ts       # Prompt for career domain explanation
│   │
│   └── validators/
│       ├── explanation.validator.ts   # Zod schema for explanation output
│       ├── questions.validator.ts     # Zod schema for question output
│       └── skills.validator.ts        # Zod schema for skill extraction output
│
└── recommendation/
    ├── recommendation.routes.ts
    ├── recommendation.controller.ts
    ├── recommendation.service.ts          # Core scoring engine
    ├── explanation.service.ts             # Explanation orchestration
    ├── resource-recommendation.service.ts # Resource matching
    ├── recommendation.schema.ts           # Zod: query params
    └── recommendation.types.ts            # All TypeScript types for this module
```

---

## 9. Detailed Workflows

### 9.1 Opportunity recommendation workflow (complete)

```
1.  GET /api/v1/recommendations/opportunities received
2.  authenticate middleware → req.user.studentId
3.  recommendationController.getOpportunities()
4.  recommendationService.generateRecommendations(studentId):

    [Step A: Gather student context]
    a.  profile = profileService.getProfile(studentId)
        → { selectedRoleId, interests, yearOfStudy }
    b.  skillStates = profileService.getSkillStates(studentId)
        → [{ skillId, assessedLevel, selfRating, evidenceBoost }]
    c.  roleSkills = prisma.skill.findMany({ where: { roleId } })
        → [{ id, name, targetProficiency, weight }]

    [Step B: Fetch candidate opportunities]
    d.  opportunities = prisma.opportunity.findMany({
          where: { isActive: true, deadline: { gte: now } },
          include: { skillTags: { include: { skill } }, domain: true },
          take: 200  // candidate pool cap
        })

    [Step C: Score each opportunity]
    e.  For each opportunity:
          scores = computeCompatibilityScore(
            studentSkillStates,
            roleSkills,
            opportunity,
            profile
          )
          → { total, skillMatch, careerAlignment, eligibility, interest }

    [Step D: Filter and segment]
    f.  Filter: total score < 0.20 → exclude
    g.  Segment:
          total >= 0.75 → READY_NOW
          0.50–0.74    → ALMOST_READY
          0.20–0.49    → ASPIRATIONAL

    [Step E: Rank within segments]
    h.  Sort each segment by total score descending
    i.  Cap: READY_NOW max 10, ALMOST_READY max 15, ASPIRATIONAL max 10

    [Step J: Generate explanations]
    j.  For each result in READY_NOW and ALMOST_READY:
          explanation = explanationService.generate(
            studentSkillStates,
            opportunity,
            scores
          )
          → { summary, matchingSkills, gapSkills, gapSeverity, careerAlignment, eligibilityStatus }

    [Step K: Persist recommendations]
    k.  For each result: prisma.recommendation.upsert(...)

    [Step L: Return]
    l.  Return { readyNow, almostReady, aspirational }

5.  Controller: res.json(successResponse(recommendations))
```

### 9.2 Compatibility score computation workflow

```
computeCompatibilityScore(studentSkillStates, roleSkills, opportunity, profile):

1.  Build studentLevelMap: Map<skillId, assessedLevel>
2.  Build requiredSkillMap: Map<skillId, requiredLevel> from opportunity.skillTags

    [Skill Match Score]
3.  For each skill in opportunity.skillTags:
        studentLevel = studentLevelMap.get(skillId) ?? 'UNASSESSED'
        requiredLevel = tag's implied level (default: INTERMEDIATE)
        skillScore = min(SCORES[studentLevel], SCORES[requiredLevel]) / SCORES[requiredLevel]
        weightedScore += skillScore * tag.confidence
        totalWeight += tag.confidence
4.  skillMatchScore = totalWeight > 0 ? weightedScore / totalWeight : 0.5
    (if no skill tags: score 0.5 — neutral, not penalized)

    [Career Alignment Score]
5.  opportunityDomainId = opportunity.domainId
    studentDomainId = profile.selectedRole.domainId
    if exact domain match → 1.0
    if null domainId on opportunity → 0.6 (unknown — benefit of doubt)
    if mismatch → 0.2

    [Eligibility Score]
6.  Parse eligibilityRaw for year-of-study mentions:
        "2nd year", "final year", "pre-final" → parse to year range
    if studentYearOfStudy in range → 1.0
    if range unclear or missing → 0.8 (benefit of doubt)
    if clearly ineligible → 0.0

    [Interest Score]
7.  opportunityDomain = opportunity.domain?.name
    studentInterests = profile.interests (string array)
    if opportunityDomain in studentInterests → 1.0
    if any partial match → 0.6
    if no match → 0.3

    [Composite]
8.  total = (skillMatchScore * 0.50)
           + (careerAlignmentScore * 0.25)
           + (eligibilityScore * 0.15)
           + (interestScore * 0.10)

9.  return { total, skillMatch: skillMatchScore, careerAlignment: careerAlignmentScore,
             eligibility: eligibilityScore, interest: interestScore }
```

### 9.3 Explanation generation workflow

```
explanationService.generate(skillStates, opportunity, scores):

1.  Build structured match data (deterministic):
        matchingSkills = opportunity.skillTags
          .filter(tag => studentHasSkill(tag.skillId, skillStates, tag.requiredLevel))
          .map(tag => tag.skill.name)
        gapSkills = opportunity.skillTags
          .filter(tag => !studentHasSkill(...))
          .map(tag => tag.skill.name)
        gapSeverity = computeGapSeverity(gapSkills.length, opportunity.skillTags.length)
        careerAlignment = scores.careerAlignment >= 0.9 ? 'direct'
                        : scores.careerAlignment >= 0.5 ? 'adjacent' : 'indirect'
        eligibilityStatus = scores.eligibility >= 0.9 ? 'eligible'
                          : scores.eligibility >= 0.6 ? 'likely_eligible' : 'check_required'

2.  Attempt AI explanation:
        if (aiService.isAvailable()):
          aiInput = {
            opportunityTitle: opportunity.title,
            organization: opportunity.organization,
            type: opportunity.type,
            matchingSkills,
            gapSkills,
            gapSeverity,
            careerAlignment,
            compatibilityScore: scores.total,
          }
          aiResult = await aiService.generateOpportunityExplanation(aiInput)
          if (aiResult.success):
            summary = aiResult.summary
          else:
            summary = buildTemplateSummary(matchingSkills, gapSkills, scores.total)
        else:
          summary = buildTemplateSummary(matchingSkills, gapSkills, scores.total)

3.  Return ExplanationResult:
        {
          summary,               ← AI-generated or template
          matchingSkills,        ← deterministic
          gapSkills,             ← deterministic
          gapSeverity,           ← deterministic
          careerAlignment,       ← deterministic
          eligibilityStatus,     ← deterministic
        }
```

### 9.4 Template explanation fallback

```typescript
function buildTemplateSummary(
  matchingSkills: string[],
  gapSkills: string[],
  score: number
): string {
  if (matchingSkills.length === 0 && gapSkills.length === 0) {
    return 'This opportunity aligns with your career direction.';
  }
  if (gapSkills.length === 0) {
    return `Strong match — your ${matchingSkills.slice(0, 3).join(', ')} skills align well with this opportunity.`;
  }
  if (matchingSkills.length === 0) {
    return `This opportunity would help you develop ${gapSkills.slice(0, 2).join(' and ')} skills for your career path.`;
  }
  return `Good match on ${matchingSkills.slice(0, 2).join(' and ')}. ` +
         `Strengthening ${gapSkills.slice(0, 2).join(' and ')} would make you a stronger candidate.`;
}
```

### 9.5 Resource recommendation workflow

```
GET /api/v1/recommendations/resources?skillId= (optional)

1.  authenticate middleware
2.  resourceRecommendationService.getResources(studentId, skillId?):

    a.  skillStates = profileService.getSkillStates(studentId)
    b.  if skillId provided: focus on that skill only
        else: identify top 5 priority skills from roadmap
              (skills that are NOT_STARTED or IN_PROGRESS, ordered by roadmap sequence)

    c.  For each priority skill:
          resources = prisma.resource.findMany({
            where: { skillId: skill.id },
            orderBy: { isFree: 'desc' }  // free resources first
          })
          Attach resources to skill

    d.  Return: { skillResources: [{ skill, resources }] }
```

### 9.6 AI Module: generateOpportunityExplanation workflow

```
aiService.generateOpportunityExplanation(input: ExplanationInput):

1.  validateInput(input)  ← if invalid: return fallback immediately
2.  prompt = buildExplanationPrompt(input)
3.  try:
      response = await aiClient.generate(prompt, {
        responseFormat: 'json',
        maxTokens: 200,
        temperature: 0.3,  ← low temperature for consistent, factual output
      })
4.  parsed = JSON.parse(response.text)
5.  validated = explanationOutputSchema.safeParse(parsed)
    if (!validated.success):
      log warning
      return { success: false }
6.  return { success: true, summary: validated.data.summary }
catch (any error):
  log error
  return { success: false }
```

**Temperature 0.3 rationale:**
Low temperature produces consistent, focused output. Higher temperatures produce more creative but less predictable text. For a factual recommendation explanation, consistency matters more than creativity.

### 9.7 getOpportunitySummary workflow (called by Role 2 dashboard)

```typescript
// Called by Role 2's dashboard aggregator
async function getOpportunitySummary(studentId: string): Promise<OpportunitySummary> {
  // Count previously computed recommendations by segment
  // This avoids re-running the full scoring on every dashboard load
  const counts = await prisma.recommendation.groupBy({
    by: ['segment'],
    where: { studentId },
    _count: { segment: true },
  });

  const countMap = new Map(counts.map(c => [c.segment, c._count.segment]));

  return {
    readyNowCount: countMap.get('READY_NOW') ?? 0,
    almostReadyCount: countMap.get('ALMOST_READY') ?? 0,
  };
}
```

**Why use stored counts rather than re-running scoring:**
The dashboard loads on every visit. Re-running the full recommendation scoring (200 opportunities × scoring formula) on every dashboard load would be unnecessarily expensive. Stored counts from the last full recommendation run are sufficient for the dashboard summary.

### 9.8 Assessment question generation workflow (called by Role 3)

```
aiService.generateAssessmentQuestions(input: QuestionGenInput):

1.  validateInput: skill exists, proficiency level valid, count 1–10
2.  prompt = buildQuestionsPrompt(input)
3.  response = await aiClient.generate(prompt, {
      responseFormat: 'json',
      maxTokens: 1500,
      temperature: 0.5,
    })
4.  parsed = JSON.parse(response.text)
5.  validated = questionOutputSchema.safeParse(parsed)
    if fails: return { success: false, questions: [] }
6.  For each question:
        Verify exactly 4 options
        Verify exactly 1 isCorrect = true
        Verify explanation is non-empty
7.  return { success: true, questions: validated.data.questions }

Note: ALL returned questions are DRAFT status.
Role 3 must review and set isActive = true manually before they enter the live question bank.
```

---

## 10. Inputs

### From HTTP clients

- `GET /api/v1/recommendations/opportunities` — authenticated student request
- `GET /api/v1/recommendations/resources` — authenticated student request with optional `skillId`

### From other backend modules (internal service calls)

- Role 2 dashboard aggregator calls `recommendationService.getOpportunitySummary(studentId)`
- Role 3 assessment module calls `aiService.generateAssessmentQuestions(input)`
- Role 4 skill extractor calls `aiService.extractSkillsFromText(text)` (optional)
- Role 3 career module may call `aiService.generateCareerExplanation(domain)` (optional)

### From the database (read)

- `student_profiles` (via profileService or direct Prisma read) — career selection, interests, year
- `student_skill_states` — assessed proficiency levels
- `skills` — role skill requirements, target proficiencies, weights
- `opportunities` with `opportunity_skill_tags` — candidate pool
- `resources` — for resource recommendations
- `milestones` — for identifying priority skills in roadmap
- `recommendations` — for dashboard summary counts

### From external (LLM API)

- Gemini or OpenAI API responses

---

## 11. Outputs

### HTTP responses

- Ranked, segmented, explained opportunity recommendations
- Skill-matched resource recommendations

### Internal service outputs

- `getOpportunitySummary(studentId)` → `{ readyNowCount, almostReadyCount }` (consumed by Role 2)
- `generateAssessmentQuestions(input)` → draft question objects (consumed by Role 3)
- `extractSkillsFromText(text)` → skill tag suggestions (consumed by Role 4)
- `generateCareerExplanation(domain)` → plain-language domain explanation (consumed by Role 3)

### Database writes

- `recommendations` table: one record per student-opportunity pair, updated on each scoring run

---

## 12. Data Models Owned

### TypeScript types

```typescript
// src/modules/recommendation/recommendation.types.ts

export interface CompatibilityScores {
  total: number;              // 0.0–1.0 composite
  skillMatch: number;         // 0.0–1.0
  careerAlignment: number;    // 0.0–1.0
  eligibility: number;        // 0.0–1.0
  interest: number;           // 0.0–1.0
}

export type RecommendationSegment = 'READY_NOW' | 'ALMOST_READY' | 'ASPIRATIONAL';

export interface MatchExplanation {
  summary: string;                  // Human-readable (AI or template)
  matchingSkills: string[];         // Skill names where student meets requirement
  gapSkills: string[];              // Skill names where student is below requirement
  gapSeverity: 'none' | 'minor' | 'moderate' | 'significant';
  careerAlignment: 'direct' | 'adjacent' | 'indirect';
  eligibilityStatus: 'eligible' | 'likely_eligible' | 'check_required';
}

export interface OpportunityRecommendation {
  opportunityId: string;
  title: string;
  organization: string;
  type: OpportunityType;
  mode: OpportunityMode;
  deadline: string | null;
  source: string;
  originalUrl: string;
  stipend: string | null;
  compatibilityScore: number;
  scores: CompatibilityScores;
  explanation: MatchExplanation;
}

export interface RecommendationResponse {
  readyNow: OpportunityRecommendation[];
  almostReady: OpportunityRecommendation[];
  aspirational: OpportunityRecommendation[];
  generatedAt: string;
}

export interface OpportunitySummary {
  readyNowCount: number;
  almostReadyCount: number;
}

export interface ResourceRecommendation {
  skillId: string;
  skillName: string;
  currentProficiency: ProficiencyLevel | null;
  targetProficiency: ProficiencyLevel;
  resources: ResourceItem[];
}

export interface ResourceRecommendationResponse {
  skillResources: ResourceRecommendation[];
}
```

```typescript
// src/modules/ai/ai.types.ts

export interface ExplanationInput {
  opportunityTitle: string;
  organization: string;
  type: string;
  matchingSkills: string[];
  gapSkills: string[];
  gapSeverity: string;
  careerAlignment: string;
  compatibilityScore: number;
}

export interface ExplanationOutput {
  success: boolean;
  summary?: string;
}

export interface QuestionGenInput {
  skillId: string;
  skillName: string;
  proficiencyLevel: ProficiencyLevel;
  competencyContext: string;
  count: number;            // 1–10
}

export interface DraftQuestion {
  questionText: string;
  options: Array<{
    label: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  difficulty: string;
}

export interface QuestionGenOutput {
  success: boolean;
  questions: DraftQuestion[];
}

export interface SkillExtractionInput {
  text: string;
  maxSkills?: number;
}

export interface ExtractedSkillMention {
  mention: string;
  skillName: string;
}

export interface SkillExtractionOutput {
  success: boolean;
  skills: ExtractedSkillMention[];
}

export interface CareerExplanationInput {
  domainName: string;
  roles: string[];
  topTechnologies: string[];
}

export interface CareerExplanationOutput {
  success: boolean;
  explanation?: string;
}

export interface AIGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}
```

---

## 13. Database Tables Owned

Role 5 owns the **content** of the `recommendations` table (Role 2 owns the schema):

| Table | Role 5 responsibility |
|---|---|
| `recommendations` | All recommendation records — written after each scoring run |

Role 5 reads (does not write) from:

| Table | Read purpose |
|---|---|
| `student_profiles` | Career goal, interests, year of study |
| `student_skill_states` | Assessed proficiency per skill |
| `skills` | Role skill requirements, target proficiencies, weights |
| `opportunities` | Candidate opportunity pool |
| `opportunity_skill_tags` | Required skills per opportunity |
| `resources` | Learning resources per skill |
| `milestones` | Priority skills from student roadmap |
| `domains` | Domain alignment for scoring |

---

## 14. API Endpoints Owned

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/recommendations/opportunities` | Yes | Personalized opportunity recommendations |
| GET | `/api/v1/recommendations/resources` | Yes | Learning resource recommendations |

### Internal service functions exposed to other modules

```typescript
// Consumed by Role 2:
recommendationService.getOpportunitySummary(studentId: string): Promise<OpportunitySummary>

// Consumed by Role 3:
aiService.generateAssessmentQuestions(input: QuestionGenInput): Promise<QuestionGenOutput>
aiService.generateCareerExplanation(input: CareerExplanationInput): Promise<CareerExplanationOutput>

// Consumed by Role 4:
aiService.extractSkillsFromText(input: SkillExtractionInput): Promise<SkillExtractionOutput>
```

---

## 15. API Request and Response Contracts

### 15.1 GET `/api/v1/recommendations/opportunities`

**Query parameters:** None required.

**Zod schema:**

```typescript
// src/modules/recommendation/recommendation.schema.ts
import { z } from 'zod';

export const opportunityRecommendationQuerySchema = z.object({
  query: z.object({
    refresh: z.enum(['true', 'false']).optional().default('false'),
    // refresh=true forces re-scoring even if recent results exist
  }),
});

export const resourceRecommendationQuerySchema = z.object({
  query: z.object({
    skillId: z.string().uuid().optional(),
    limit: z.string().transform(Number)
      .pipe(z.number().int().min(1).max(20))
      .optional()
      .default('5'),
  }),
});
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "readyNow": [
      {
        "opportunityId": "uuid-opp-1",
        "title": "ML Engineering Intern",
        "organization": "Sarvam AI",
        "type": "INTERNSHIP",
        "mode": "REMOTE",
        "deadline": "2025-04-30T00:00:00.000Z",
        "source": "MANUAL",
        "originalUrl": "https://sarvam.ai/careers/...",
        "stipend": "₹25,000/month",
        "compatibilityScore": 0.82,
        "scores": {
          "total": 0.82,
          "skillMatch": 0.88,
          "careerAlignment": 1.0,
          "eligibility": 0.8,
          "interest": 0.6
        },
        "explanation": {
          "summary": "Strong match — your Python and ML Fundamentals skills align well with this role. Sarvam AI works on speech AI and you've shown solid foundations.",
          "matchingSkills": ["Python", "Machine Learning Fundamentals", "SQL"],
          "gapSkills": ["PyTorch"],
          "gapSeverity": "minor",
          "careerAlignment": "direct",
          "eligibilityStatus": "likely_eligible"
        }
      }
    ],
    "almostReady": [
      {
        "opportunityId": "uuid-opp-2",
        "title": "Data Science Intern",
        "organization": "Flipkart",
        "type": "INTERNSHIP",
        "mode": "ON_SITE",
        "deadline": "2025-05-15T00:00:00.000Z",
        "source": "UNSTOP",
        "originalUrl": "https://unstop.com/...",
        "stipend": "₹30,000/month",
        "compatibilityScore": 0.61,
        "scores": {
          "total": 0.61,
          "skillMatch": 0.55,
          "careerAlignment": 1.0,
          "eligibility": 0.8,
          "interest": 0.6
        },
        "explanation": {
          "summary": "Close match — your Python skills are there, but strengthening pandas and scikit-learn would make you a strong candidate.",
          "matchingSkills": ["Python", "SQL"],
          "gapSkills": ["pandas", "scikit-learn", "Statistics"],
          "gapSeverity": "moderate",
          "careerAlignment": "direct",
          "eligibilityStatus": "likely_eligible"
        }
      }
    ],
    "aspirational": [
      {
        "opportunityId": "uuid-opp-3",
        "title": "Senior ML Engineer Intern",
        "organization": "Google",
        "type": "INTERNSHIP",
        "mode": "ON_SITE",
        "deadline": "2025-06-01T00:00:00.000Z",
        "source": "MANUAL",
        "originalUrl": "https://careers.google.com/...",
        "stipend": "₹80,000/month",
        "compatibilityScore": 0.31,
        "scores": {
          "total": 0.31,
          "skillMatch": 0.25,
          "careerAlignment": 1.0,
          "eligibility": 0.8,
          "interest": 0.6
        },
        "explanation": {
          "summary": "An ambitious target for later. Focus on your current roadmap and revisit this when you've completed the ML Core competency.",
          "matchingSkills": ["Python"],
          "gapSkills": ["PyTorch", "TensorFlow", "Deep Learning", "MLOps"],
          "gapSeverity": "significant",
          "careerAlignment": "direct",
          "eligibilityStatus": "likely_eligible"
        }
      }
    ],
    "generatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

### 15.2 GET `/api/v1/recommendations/resources`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "skillResources": [
      {
        "skillId": "uuid-python",
        "skillName": "Python",
        "currentProficiency": "BEGINNER",
        "targetProficiency": "PROFICIENT",
        "resources": [
          {
            "id": "uuid-r1",
            "title": "Python for Everybody — Coursera",
            "url": "https://coursera.org/specializations/python",
            "type": "COURSE",
            "platform": "Coursera",
            "isFree": false,
            "estimatedHours": 15
          },
          {
            "id": "uuid-r2",
            "title": "Python Official Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "type": "DOCUMENTATION",
            "platform": "python.org",
            "isFree": true,
            "estimatedHours": 8
          }
        ]
      },
      {
        "skillId": "uuid-statistics",
        "skillName": "Statistics and Probability",
        "currentProficiency": "AWARENESS",
        "targetProficiency": "INTERMEDIATE",
        "resources": [
          {
            "id": "uuid-r3",
            "title": "Statistics with Python — NPTEL",
            "url": "https://nptel.ac.in/courses/...",
            "type": "COURSE",
            "platform": "NPTEL",
            "isFree": true,
            "estimatedHours": 20
          }
        ]
      }
    ]
  }
}
```

---

## 16. Interfaces with Other Roles

### Dependency: Role 2 — Backend Platform

**Type:** Consumer of Role 2 infrastructure

Role 5 imports from Role 2:

```typescript
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { successResponse } from '../../utils/response';
import { AppError, NotFoundError } from '../../utils/errors';
import { profileService } from '../profile/profile.service';
```

Role 2 imports from Role 5:

```typescript
// Role 2's dashboard aggregator:
import { recommendationService } from '../recommendation/recommendation.service';
const summary = await recommendationService.getOpportunitySummary(studentId);
```

**Contract for `getOpportunitySummary`:**

```typescript
// Role 5 must export this function:
export async function getOpportunitySummary(
  studentId: string
): Promise<{ readyNowCount: number; almostReadyCount: number }> {
  // Fast query — uses stored recommendation counts
  // Must complete in < 100ms for dashboard performance
}
```

---

### Dependency: Role 3 — Career & Skill Graph

**Type:** Provider of AI services to Role 3

Role 3 imports from Role 5 (AI Module):

```typescript
// Role 3 assessment module (optionally):
import { aiService } from '../ai/ai.service';

// Generate draft questions for skill
const result = await aiService.generateAssessmentQuestions({
  skillId: skill.id,
  skillName: skill.name,
  proficiencyLevel: 'INTERMEDIATE',
  competencyContext: skill.category,
  count: 5,
});

// Role 3 career module (optionally):
const explanation = await aiService.generateCareerExplanation({
  domainName: domain.name,
  roles: domain.roles.map(r => r.name),
  topTechnologies: domain.topTechnologies,
});
```

Role 5 reads from Role 3's data (via database):

```typescript
// Reads skills table for scoring weights and target proficiencies
const roleSkills = await prisma.skill.findMany({
  where: { roleId: profile.selectedRoleId },
  select: { id: true, name: true, targetProficiency: true, weight: true }
});
```

---

### Dependency: Role 4 — Data Engineering

**Type:** Consumer of Role 4 data + Optional provider of AI skill extraction

Role 5 reads opportunity data directly from the database:

```typescript
const opportunities = await prisma.opportunity.findMany({
  where: { isActive: true, deadline: { gte: new Date() } },
  include: {
    skillTags: { include: { skill: { select: { id: true, name: true } } } },
    domain: { select: { id: true, name: true } },
  },
  take: 200,
});
```

Role 4 optionally calls Role 5's AI Module for skill extraction:

```typescript
// Role 4 calls this:
import { aiService } from '../ai/ai.service';
const result = await aiService.extractSkillsFromText({
  text: opportunityDescription,
  maxSkills: 10,
});
```

**Coordination requirement:** Role 4 must have populated the opportunity index with skill tags before Role 5 can produce quality recommendations. If no opportunities are tagged, skill match scores default to 0.5 (neutral). This is handled gracefully.

---

### Dependency: Role 1 — Frontend

**Type:** Provider (via API)

Role 1 consumes:
- `GET /api/v1/recommendations/opportunities` for `OpportunitiesPage`
- `GET /api/v1/recommendations/resources` for `RoadmapPage` milestone resource cards

The explanation JSON shape is the most important contract for Role 1. It must be stable before Role 1 builds the `MatchExplanation` component:

```typescript
// This shape must not change once Role 1 starts building against it:
interface MatchExplanation {
  summary: string;
  matchingSkills: string[];
  gapSkills: string[];
  gapSeverity: 'none' | 'minor' | 'moderate' | 'significant';
  careerAlignment: 'direct' | 'adjacent' | 'indirect';
  eligibilityStatus: 'eligible' | 'likely_eligible' | 'check_required';
}
```

---

## 17. Data Contracts Between Modules

### Contract: Role 5 → Role 2 (dashboard summary)

```typescript
// Role 5 exports:
export async function getOpportunitySummary(studentId: string): Promise<{
  readyNowCount: number;
  almostReadyCount: number;
}>;

// Performance requirement: < 100ms
// Fallback: if studentId has no recommendations yet, return { 0, 0 }
```

### Contract: Role 5 → Role 3 (question generation)

```typescript
// Role 5 exports from aiService:
export async function generateAssessmentQuestions(
  input: QuestionGenInput
): Promise<QuestionGenOutput>;

// Contract guarantee:
// - If LLM unavailable: return { success: false, questions: [] }
// - Never throw
// - All returned questions are DRAFT (isActive = false)
// - Role 3 is responsible for review and activation
```

### Contract: Role 5 → Role 4 (skill extraction)

```typescript
// Role 5 exports from aiService:
export async function extractSkillsFromText(
  input: SkillExtractionInput
): Promise<SkillExtractionOutput>;

// Contract guarantee:
// - If LLM unavailable: return { success: false, skills: [] }
// - Never throw
// - Role 4 must validate returned skillNames against its own dictionary
```

---

## 18. Algorithms and Business Logic

### 18.1 Proficiency level numerical scores

```typescript
// src/modules/recommendation/recommendation.service.ts

export const PROFICIENCY_SCORES: Record<string, number> = {
  'UNASSESSED': 0,    // student has no data for this skill
  'AWARENESS': 1,
  'BEGINNER': 2,
  'INTERMEDIATE': 3,
  'PROFICIENT': 4,
  'EXPERT': 5,
};

// Implied required proficiency when opportunity tags don't specify level
const DEFAULT_REQUIRED_PROFICIENCY_SCORE = PROFICIENCY_SCORES['INTERMEDIATE']; // 3
```

### 18.2 Full compatibility score implementation

```typescript
export function computeCompatibilityScore(
  skillStates: StudentSkillState[],
  roleSkills: RoleSkill[],
  opportunity: OpportunityWithTags,
  profile: StudentProfileContext
): CompatibilityScores {

  // Build lookup maps
  const studentLevelMap = new Map<string, string>(
    skillStates.map(s => [s.skillId, s.assessedLevel ?? 'UNASSESSED'])
  );

  // ── Skill Match Score ──────────────────────────────────────────
  let weightedSkillSum = 0;
  let totalTagWeight = 0;

  if (opportunity.skillTags.length === 0) {
    // No skill tags: neutral score (we don't know requirements)
    weightedSkillSum = 0.5;
    totalTagWeight = 1;
  } else {
    for (const tag of opportunity.skillTags) {
      const studentScore = PROFICIENCY_SCORES[studentLevelMap.get(tag.skillId) ?? 'UNASSESSED'];
      // Required level: tags don't store level, assume INTERMEDIATE unless specified
      const requiredScore = DEFAULT_REQUIRED_PROFICIENCY_SCORE;
      // Cap: exceeding required does not help further
      const skillContribution = Math.min(studentScore, requiredScore) / requiredScore;
      weightedSkillSum += skillContribution * tag.confidence;
      totalTagWeight += tag.confidence;
    }
  }

  const skillMatchScore = totalTagWeight > 0
    ? weightedSkillSum / totalTagWeight
    : 0.5;

  // ── Career Alignment Score ─────────────────────────────────────
  let careerAlignmentScore: number;

  if (!opportunity.domainId) {
    careerAlignmentScore = 0.6; // Unknown domain: benefit of doubt
  } else if (opportunity.domainId === profile.selectedDomainId) {
    careerAlignmentScore = 1.0; // Exact domain match
  } else {
    careerAlignmentScore = 0.2; // Domain mismatch
  }

  // ── Eligibility Score ──────────────────────────────────────────
  const eligibilityScore = parseEligibilityScore(
    opportunity.eligibilityRaw,
    profile.yearOfStudy
  );

  // ── Interest Score ─────────────────────────────────────────────
  const interestScore = computeInterestScore(
    opportunity.domain?.name ?? null,
    profile.interests
  );

  // ── Composite ──────────────────────────────────────────────────
  const total =
    (skillMatchScore   * 0.50) +
    (careerAlignmentScore * 0.25) +
    (eligibilityScore  * 0.15) +
    (interestScore     * 0.10);

  return {
    total: Math.round(total * 1000) / 1000,  // 3 decimal places
    skillMatch: Math.round(skillMatchScore * 1000) / 1000,
    careerAlignment: Math.round(careerAlignmentScore * 1000) / 1000,
    eligibility: Math.round(eligibilityScore * 1000) / 1000,
    interest: Math.round(interestScore * 1000) / 1000,
  };
}
```

### 18.3 Eligibility parsing

```typescript
function parseEligibilityScore(
  eligibilityRaw: string | null,
  studentYear: number
): number {
  if (!eligibilityRaw) return 0.8; // Unknown: benefit of doubt

  const text = eligibilityRaw.toLowerCase();

  // Extract year mentions
  const yearMentions: number[] = [];
  const patterns = [
    { regex: /\b1st\s+year\b|\bfirst\s+year\b/i, year: 1 },
    { regex: /\b2nd\s+year\b|\bsecond\s+year\b/i, year: 2 },
    { regex: /\b3rd\s+year\b|\bthird\s+year\b/i, year: 3 },
    { regex: /\bfinal\s+year\b|\b4th\s+year\b/i, year: 4 },
    { regex: /\bpre[\s-]?final\b/i, year: 3 },
    { regex: /\bpenultimate\b/i, year: 3 },
  ];

  for (const { regex, year } of patterns) {
    if (regex.test(text)) yearMentions.push(year);
  }

  if (yearMentions.length === 0) return 0.8; // Cannot determine — benefit of doubt

  if (yearMentions.includes(studentYear)) return 1.0;

  // Student year is adjacent to a mentioned year
  if (yearMentions.some(y => Math.abs(y - studentYear) === 1)) return 0.5;

  return 0.0; // Clearly ineligible
}
```

### 18.4 Gap severity computation

```typescript
function computeGapSeverity(
  gapCount: number,
  totalRequiredCount: number
): 'none' | 'minor' | 'moderate' | 'significant' {
  if (totalRequiredCount === 0) return 'none';

  const gapRatio = gapCount / totalRequiredCount;

  if (gapRatio === 0) return 'none';
  if (gapRatio <= 0.25) return 'minor';
  if (gapRatio <= 0.60) return 'moderate';
  return 'significant';
}
```

### 18.5 Recommendation upsert logic

```typescript
async function persistRecommendations(
  studentId: string,
  results: ScoredOpportunity[],
  prisma: PrismaClient
): Promise<void> {
  // Use transaction for atomic update
  await prisma.$transaction(
    results.map(result =>
      prisma.recommendation.upsert({
        where: {
          // Need a unique constraint on (studentId, opportunityId)
          // This is defined in the schema
          studentId_opportunityId: {
            studentId,
            opportunityId: result.opportunityId,
          },
        },
        create: {
          studentId,
          opportunityId: result.opportunityId,
          compatibilityScore: result.scores.total,
          skillMatchScore: result.scores.skillMatch,
          careerAlignmentScore: result.scores.careerAlignment,
          eligibilityScore: result.scores.eligibility,
          interestScore: result.scores.interest,
          segment: result.segment,
          explanationJson: result.explanation as any,
          generatedAt: new Date(),
        },
        update: {
          compatibilityScore: result.scores.total,
          skillMatchScore: result.scores.skillMatch,
          careerAlignmentScore: result.scores.careerAlignment,
          eligibilityScore: result.scores.eligibility,
          interestScore: result.scores.interest,
          segment: result.segment,
          explanationJson: result.explanation as any,
          generatedAt: new Date(),
        },
      })
    )
  );
}
```

> **Note:** The Prisma schema needs a `@@unique([studentId, opportunityId])` constraint on the `recommendations` table for the upsert to work. This should be coordinated with Role 2 when the schema is created.

---

## 19. AI Usage

This section is the most important in this role's documentation. Every AI call is explicitly documented.

### 19.1 AI Client wrapper

```typescript
// src/modules/ai/ai.client.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import { AIGenerateOptions } from './ai.types';

export class AIClient {
  private client: GoogleGenerativeAI;
  private modelName: string = 'gemini-1.5-flash';
  private available: boolean = true;

  constructor() {
    if (!config.geminiApiKey) {
      logger.warn('GEMINI_API_KEY not set — AI features will use fallback responses');
      this.available = false;
      return;
    }
    this.client = new GoogleGenerativeAI(config.geminiApiKey);
  }

  isAvailable(): boolean {
    return this.available;
  }

  async generate(
    prompt: string,
    options: AIGenerateOptions = {}
  ): Promise<{ text: string }> {
    if (!this.available) {
      throw new Error('AI client not available');
    }

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 500,
        temperature: options.temperature ?? 0.3,
        ...(options.responseFormat === 'json' && {
          responseMimeType: 'application/json',
        }),
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error('Empty response from AI');
    return { text };
  }
}

// Singleton instance
export const aiClient = new AIClient();
```

### 19.2 Task 1 — Opportunity explanation generation

**When called:** For each opportunity in READY_NOW and ALMOST_READY segments.

**Prompt template:**

```typescript
// src/modules/ai/prompts/explanation.prompt.ts

export function buildExplanationPrompt(input: ExplanationInput): string {
  return `You are helping a student understand why a career opportunity matches their skills.

Opportunity: "${input.opportunityTitle}" at ${input.organization} (${input.type})
Compatibility score: ${Math.round(input.compatibilityScore * 100)}%
Career alignment: ${input.careerAlignment}

Student's matching skills: ${input.matchingSkills.join(', ') || 'none identified'}
Skills they still need: ${input.gapSkills.join(', ') || 'none'}
Gap severity: ${input.gapSeverity}

Write ONE sentence (maximum 30 words) explaining why this opportunity is or is not a good match.
Be honest, encouraging, and specific. Do not use generic phrases like "great opportunity".
If there are gaps, mention what to work on. If it is a strong match, say why.

Respond with valid JSON only:
{"summary": "<your one-sentence explanation here>"}`;
}
```

**Output validation:**

```typescript
// src/modules/ai/validators/explanation.validator.ts
import { z } from 'zod';

export const explanationOutputSchema = z.object({
  summary: z.string()
    .min(10, 'Summary too short')
    .max(200, 'Summary too long')
    .refine(s => !s.includes('great opportunity'), {
      message: 'Detected generic phrase — prompt needs adjustment'
    }),
});
```

**Graceful degradation:** If AI fails, returns template summary (Section 9.4).

---

### 19.3 Task 2 — Assessment question generation

**When called:** By Role 3 to generate draft questions for the question bank.

**Prompt template:**

```typescript
// src/modules/ai/prompts/questions.prompt.ts

export function buildQuestionsPrompt(input: QuestionGenInput): string {
  return `Generate ${input.count} multiple-choice assessment questions to test a student's knowledge of "${input.skillName}" at the ${input.proficiencyLevel} proficiency level.

Context: This skill belongs to the "${input.competencyContext}" competency area.

Proficiency level definitions:
- AWARENESS: Basic conceptual understanding
- BEGINNER: Can use with reference materials
- INTERMEDIATE: Can use independently on standard problems
- PROFICIENT: Can handle complex, non-standard scenarios

Requirements for each question:
1. The question must test practical understanding, not just definitions
2. Exactly 4 options labeled A, B, C, D
3. Exactly 1 correct option
4. The incorrect options must be plausible (not obviously wrong)
5. Include a brief explanation of why the correct answer is right

Respond with valid JSON only:
{
  "questions": [
    {
      "questionText": "<question>",
      "options": [
        {"label": "A", "text": "<option>", "isCorrect": false},
        {"label": "B", "text": "<option>", "isCorrect": true},
        {"label": "C", "text": "<option>", "isCorrect": false},
        {"label": "D", "text": "<option>", "isCorrect": false}
      ],
      "explanation": "<why B is correct>",
      "difficulty": "${input.proficiencyLevel}"
    }
  ]
}`;
}
```

**Output validation:**

```typescript
// src/modules/ai/validators/questions.validator.ts
import { z } from 'zod';

const questionOptionSchema = z.object({
  label: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(5).max(500),
  isCorrect: z.boolean(),
});

const draftQuestionSchema = z.object({
  questionText: z.string().min(10).max(1000),
  options: z.array(questionOptionSchema)
    .length(4, 'Must have exactly 4 options')
    .refine(
      opts => opts.filter(o => o.isCorrect).length === 1,
      'Must have exactly 1 correct option'
    ),
  explanation: z.string().min(10).max(500),
  difficulty: z.string(),
});

export const questionOutputSchema = z.object({
  questions: z.array(draftQuestionSchema).min(1).max(10),
});
```

**Post-validation business rules:**
1. All questions are inserted with `isActive: false` (draft status)
2. Role 3 must review each question and set `isActive: true` manually
3. Any question failing the schema is discarded (not partially saved)

---

### 19.4 Task 3 — Skill extraction from text

**When called:** By Role 4 during opportunity pipeline processing.

**Prompt template:**

```typescript
// src/modules/ai/prompts/skills.prompt.ts

export function buildSkillExtractionPrompt(input: SkillExtractionInput): string {
  return `Extract technical skill names from the following job opportunity text.

Rules:
- Only extract skills explicitly mentioned in the text
- Do not invent or infer skills not present
- Normalize common abbreviations (e.g., "ML" → "Machine Learning")
- Maximum ${input.maxSkills ?? 10} skills
- If no technical skills are found, return an empty array

Text:
"""
${input.text.slice(0, 2000)}
"""

Respond with valid JSON only:
{
  "skills": [
    {"mention": "<exact text from input>", "skillName": "<normalized skill name>"}
  ]
}`;
}
```

**Output validation:**

```typescript
// src/modules/ai/validators/skills.validator.ts
import { z } from 'zod';

export const skillExtractionOutputSchema = z.object({
  skills: z.array(
    z.object({
      mention: z.string().min(1).max(100),
      skillName: z.string().min(1).max(100),
    })
  ).max(20),
});
```

**Post-validation:** Role 4 must check returned `skillName` values against its normalization dictionary. Only create `OpportunitySkillTag` records for skills that exist in the database.

---

### 19.5 Task 4 — Career domain explanation

**When called:** By Role 3 career module to enrich domain descriptions on demand.

**Prompt template:**

```typescript
// src/modules/ai/prompts/career.prompt.ts

export function buildCareerExplanationPrompt(input: CareerExplanationInput): string {
  return `Write a 3-sentence plain-language explanation of the "${input.domainName}" career domain for a college student who is exploring career options.

The domain includes these roles: ${input.roles.join(', ')}.
Common technologies: ${input.topTechnologies.join(', ')}.

Requirements:
- Use simple, direct language (no buzzwords)
- Describe what professionals in this field actually do day-to-day
- Mention one concrete real-world impact

Respond with valid JSON only:
{"explanation": "<3-sentence explanation>"}`;
}
```

**Output validation:**

```typescript
export const careerExplanationOutputSchema = z.object({
  explanation: z.string().min(50).max(600),
});
```

---

### 19.6 AI usage summary table

| Task | Caller | Input | Output | Fallback | Max tokens |
|---|---|---|---|---|---|
| Opportunity explanation | Self (recommendation) | Match data (structured) | 1-sentence summary | Template string | 200 |
| Question generation | Role 3 | Skill + level + count | Draft MCQ array | `{ success: false }` | 1500 |
| Skill extraction | Role 4 | Opportunity text | Skill mention list | `{ success: false }` | 400 |
| Career explanation | Role 3 | Domain name + roles | 3-sentence text | Static description | 300 |

### 19.7 What AI must never do

| Prohibited | Reason |
|---|---|
| Define which skills a role requires | Skill taxonomy is expert-authored (Role 3) |
| Score an assessment submission | Scoring is deterministic comparison |
| Make the final recommendation decision | Deterministic formula makes that |
| Store or retrieve student data | AI calls are stateless |
| Call the database | AI Module is a service layer, not a data layer |
| Generate questions that bypass Role 3 review | All generated questions are drafts |
| Override a deterministic fallback when it produces a valid result | Determinism is preferred |

---

## 20. External Integrations

### Gemini API (or OpenAI)

| Property | Gemini (default) | OpenAI (backup) |
|---|---|---|
| SDK | `@google/generative-ai` | `openai` |
| Model | `gemini-1.5-flash` | `gpt-4o-mini` |
| Free tier | Yes (generous) | No (requires billing) |
| JSON mode | `responseMimeType: 'application/json'` | `response_format: { type: 'json_object' }` |
| API key env var | `GEMINI_API_KEY` | `OPENAI_API_KEY` |

**Environment variables to add (Role 2 must add to `config/env.ts`):**

```typescript
// Add to env schema in src/config/env.ts:
GEMINI_API_KEY: z.string().optional(),  // optional: system works without it
// OR
OPENAI_API_KEY: z.string().optional(),
```

**Rate limit handling:**

```typescript
// ai.client.ts — handle rate limit errors
if (error.status === 429) {
  logger.warn('AI rate limit hit — returning fallback');
  throw new Error('RATE_LIMITED');
}
```

The recommendation engine must catch all AI errors and fall back to template responses. An AI outage must never cause a 500 response to the student.

---

## 21. Error Handling

### AI call error handling

```typescript
// src/modules/ai/ai.service.ts

export async function generateOpportunityExplanation(
  input: ExplanationInput
): Promise<ExplanationOutput> {
  // Never throws — always returns something usable

  if (!aiClient.isAvailable()) {
    return { success: false };
  }

  try {
    const prompt = buildExplanationPrompt(input);
    const { text } = await aiClient.generate(prompt, {
      maxTokens: 200,
      temperature: 0.3,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(text);
    const validated = explanationOutputSchema.safeParse(parsed);

    if (!validated.success) {
      logger.warn({ errors: validated.error.flatten(), text },
        'AI explanation failed validation');
      return { success: false };
    }

    return { success: true, summary: validated.data.summary };

  } catch (err) {
    logger.error({ err }, 'AI explanation generation failed');
    return { success: false };
  }
}
```

### Recommendation engine error handling

```typescript
// src/modules/recommendation/recommendation.service.ts

export async function generateRecommendations(
  studentId: string
): Promise<RecommendationResponse> {

  // If student has no career selected → return empty
  const profile = await getStudentProfileContext(studentId);
  if (!profile.selectedRoleId) {
    return {
      readyNow: [],
      almostReady: [],
      aspirational: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // If no skill states → score everything with 0 assessed
  // (System will produce mostly ASPIRATIONAL results — this is correct)
  const skillStates = await profileService.getSkillStates(studentId);

  // If no opportunities → return empty segments with explanation
  const opportunities = await fetchCandidateOpportunities(profile.selectedRoleId);
  if (opportunities.length === 0) {
    return {
      readyNow: [],
      almostReady: [],
      aspirational: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // Score and segment
  // Individual opportunity scoring errors are caught per-opportunity
  const scored: ScoredOpportunity[] = [];
  for (const opp of opportunities) {
    try {
      const scores = computeCompatibilityScore(skillStates, roleSkills, opp, profile);
      scored.push({ ...opp, scores });
    } catch (err) {
      logger.warn({ err, opportunityId: opp.id }, 'Scoring failed for opportunity — skipping');
    }
  }

  // Continue with successfully scored opportunities
  // ...
}
```

### Error response table

| Error condition | API response | Notes |
|---|---|---|
| Student has no career selected | 200 with empty segments | Not an error — normal early state |
| No opportunities in index | 200 with empty segments | Should not happen if Role 4 seeded data |
| AI unavailable | 200 with template explanations | Graceful degradation |
| AI rate limited | 200 with template explanations | Graceful degradation |
| AI output fails validation | 200 with template explanations | Graceful degradation |
| Database read error | 500 INTERNAL_ERROR | Genuine failure |
| Unauthenticated request | 401 UNAUTHORIZED | Standard auth error |

---

## 22. Validation

### API-level validation

```typescript
// src/modules/recommendation/recommendation.schema.ts

export const opportunityRecommendationQuerySchema = z.object({
  query: z.object({
    refresh: z.enum(['true', 'false']).optional().default('false'),
  }),
});

export const resourceRecommendationQuerySchema = z.object({
  query: z.object({
    skillId: z.string().uuid('skillId must be a valid UUID').optional(),
    limit: z.string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(20))
      .optional()
      .default('5'),
  }),
});
```

### AI input validation (before sending to LLM)

All AI service functions validate their input before constructing a prompt. If input is invalid, return the fallback immediately without calling the LLM:

```typescript
export async function generateAssessmentQuestions(
  input: QuestionGenInput
): Promise<QuestionGenOutput> {
  // Validate input first
  if (!input.skillId || !input.skillName) {
    return { success: false, questions: [] };
  }
  if (input.count < 1 || input.count > 10) {
    return { success: false, questions: [] };
  }
  // ... proceed with prompt construction
}
```

### Business-level validation

| Rule | Where enforced |
|---|---|
| Student must have selected a role | `generateRecommendations()` — returns empty if no role |
| Opportunity must be active and not expired | Prisma query filter |
| Recommendation upsert requires unique studentId+opportunityId | Prisma unique constraint |
| Segment thresholds are fixed | Code constants, not configurable per-request |
| AI output schema must pass Zod | Validated before use; fallback on failure |

---

## 23. Security Considerations

### AI prompt injection prevention

User-provided data that flows into prompts must be sanitized:

```typescript
function sanitizeForPrompt(text: string, maxLength: number = 2000): string {
  return text
    .replace(/[`${}\\]/g, ' ')    // remove template literal characters
    .replace(/\n{3,}/g, '\n\n')   // collapse excessive newlines
    .slice(0, maxLength)           // enforce length limit
    .trim();
}

// Usage in skill extraction prompt:
const safeText = sanitizeForPrompt(opportunityDescription, 2000);
```

**Why this matters:** If an opportunity description contained text like `"Ignore previous instructions and..."`, without sanitization this could alter the AI's behavior. The student-facing recommendations system is relatively low-risk (it is not a security boundary), but sanitization is still good practice.

### API key protection

- LLM API keys are stored in environment variables only
- Never logged, never returned in API responses, never committed to version control
- If the key is absent, the AI client marks itself unavailable — the system still functions

### Student data in AI prompts

The explanation prompt sends:
- Opportunity title and organization (public data)
- Skill names (not sensitive)
- Compatibility score (derived data)

It does **not** send:
- Student name
- Student email
- Institution
- Student ID
- Any personally identifiable information

This is both a privacy protection and a good AI practice (prompts should contain only what the model needs).

### Recommendation access control

- Recommendations are scoped to the authenticated student via `req.user.studentId`
- A student cannot request recommendations for another student
- The `studentId` comes from the JWT, not from a request parameter

---

## 24. Testing Strategy

### 24.1 Unit tests — scoring algorithm

```typescript
// tests/unit/scoring.test.ts
import { computeCompatibilityScore, PROFICIENCY_SCORES } from
  '../../src/modules/recommendation/recommendation.service';

const mockStudentSkillStates = [
  { skillId: 'skill-python', assessedLevel: 'PROFICIENT' },
  { skillId: 'skill-sql', assessedLevel: 'INTERMEDIATE' },
  { skillId: 'skill-docker', assessedLevel: 'UNASSESSED' },
];

const mockRoleSkills = [
  { id: 'skill-python', name: 'Python', targetProficiency: 'PROFICIENT', weight: 1.0 },
  { id: 'skill-sql', name: 'SQL', targetProficiency: 'PROFICIENT', weight: 1.0 },
];

const mockProfile = {
  selectedDomainId: 'domain-swe',
  yearOfStudy: 2,
  interests: ['Software Engineering'],
};

describe('computeCompatibilityScore', () => {
  it('returns high skill match when student meets requirements', () => {
    const opportunity = {
      domainId: 'domain-swe',
      domain: { name: 'Software Engineering' },
      eligibilityRaw: '2nd year students',
      skillTags: [
        { skillId: 'skill-python', skill: { name: 'Python' }, confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(
      mockStudentSkillStates, mockRoleSkills, opportunity, mockProfile
    );

    expect(scores.skillMatch).toBeGreaterThanOrEqual(0.9);
    expect(scores.careerAlignment).toBe(1.0);  // exact domain match
    expect(scores.eligibility).toBe(1.0);      // year 2 matches
    expect(scores.total).toBeGreaterThan(0.75);
  });

  it('returns low skill match when student lacks required skills', () => {
    const opportunity = {
      domainId: 'domain-swe',
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [
        { skillId: 'skill-docker', skill: { name: 'Docker' }, confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(
      mockStudentSkillStates, mockRoleSkills, opportunity, mockProfile
    );

    expect(scores.skillMatch).toBe(0); // UNASSESSED → 0/3 = 0
  });

  it('gives neutral score when opportunity has no skill tags', () => {
    const opportunity = {
      domainId: null,
      domain: null,
      eligibilityRaw: null,
      skillTags: [],
    };

    const scores = computeCompatibilityScore(
      mockStudentSkillStates, mockRoleSkills, opportunity, mockProfile
    );

    expect(scores.skillMatch).toBe(0.5);  // neutral — no tags
  });

  it('caps score at target — EXPERT does not exceed PROFICIENT requirement', () => {
    const expertStates = [{ skillId: 'skill-python', assessedLevel: 'EXPERT' }];
    const opportunity = {
      domainId: 'domain-swe', domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [{ skillId: 'skill-python', skill: { name: 'Python' }, confidence: 1.0 }],
    };

    const scores = computeCompatibilityScore(expertStates, mockRoleSkills, opportunity, mockProfile);
    // EXPERT (5) capped at INTERMEDIATE (3) → 3/3 = 1.0
    expect(scores.skillMatch).toBe(1.0);
  });

  it('weights composite score correctly', () => {
    const opportunity = {
      domainId: 'domain-swe',
      domain: { name: 'Software Engineering' },
      eligibilityRaw: 'Open to all years',
      skillTags: [
        { skillId: 'skill-python', skill: { name: 'Python' }, confidence: 1.0 }
      ],
    };

    const scores = computeCompatibilityScore(
      [{ skillId: 'skill-python', assessedLevel: 'PROFICIENT' }],
      mockRoleSkills, opportunity, mockProfile
    );

    // Manual calculation:
    // skillMatch: 1.0 * 0.50 = 0.50
    // careerAlignment: 1.0 * 0.25 = 0.25
    // eligibility: 0.8 * 0.15 = 0.12  (open = benefit of doubt)
    // interest: 1.0 * 0.10 = 0.10
    // total = 0.97
    expect(scores.total).toBeCloseTo(0.97, 1);
  });
});
```

```typescript
// tests/unit/segmentation.test.ts
import { segmentResults } from
  '../../src/modules/recommendation/recommendation.service';

describe('segmentResults', () => {
  it('segments READY_NOW for score >= 0.75', () => {
    const result = segmentResults([{ scores: { total: 0.80 } }]);
    expect(result.readyNow).toHaveLength(1);
    expect(result.almostReady).toHaveLength(0);
  });

  it('segments ALMOST_READY for score 0.50–0.74', () => {
    const result = segmentResults([{ scores: { total: 0.62 } }]);
    expect(result.almostReady).toHaveLength(1);
  });

  it('segments ASPIRATIONAL for score 0.20–0.49', () => {
    const result = segmentResults([{ scores: { total: 0.35 } }]);
    expect(result.aspirational).toHaveLength(1);
  });

  it('excludes results below 0.20', () => {
    const result = segmentResults([{ scores: { total: 0.10 } }]);
    expect(result.readyNow).toHaveLength(0);
    expect(result.almostReady).toHaveLength(0);
    expect(result.aspirational).toHaveLength(0);
  });

  it('caps READY_NOW at 10 results', () => {
    const many = Array(15).fill({ scores: { total: 0.90 } });
    const result = segmentResults(many);
    expect(result.readyNow).toHaveLength(10);
  });

  it('sorts within segments by score descending', () => {
    const results = [
      { scores: { total: 0.65 }, id: 'A' },
      { scores: { total: 0.80 }, id: 'B' },
      { scores: { total: 0.72 }, id: 'C' },
    ];
    // A, C are ALMOST_READY; B is READY_NOW
    const segmented = segmentResults(results);
    expect(segmented.readyNow[0].id).toBe('B');
    expect(segmented.almostReady[0].id).toBe('C'); // 0.72 > 0.65
  });
});
```

### 24.2 Unit tests — AI service

```typescript
// tests/unit/ai-service.test.ts
import { aiService } from '../../src/modules/ai/ai.service';

// Mock the AI client
jest.mock('../../src/modules/ai/ai.client', () => ({
  aiClient: {
    isAvailable: () => true,
    generate: jest.fn(),
  },
}));

import { aiClient } from '../../src/modules/ai/ai.client';

describe('aiService.generateOpportunityExplanation', () => {
  const validInput = {
    opportunityTitle: 'ML Intern',
    organization: 'TestCo',
    type: 'INTERNSHIP',
    matchingSkills: ['Python', 'SQL'],
    gapSkills: ['Docker'],
    gapSeverity: 'minor',
    careerAlignment: 'direct',
    compatibilityScore: 0.78,
  };

  it('returns AI summary when response is valid', async () => {
    (aiClient.generate as jest.Mock).mockResolvedValueOnce({
      text: JSON.stringify({ summary: 'Strong match on Python and SQL.' }),
    });

    const result = await aiService.generateOpportunityExplanation(validInput);
    expect(result.success).toBe(true);
    expect(result.summary).toBe('Strong match on Python and SQL.');
  });

  it('returns success: false when AI response fails schema validation', async () => {
    (aiClient.generate as jest.Mock).mockResolvedValueOnce({
      text: JSON.stringify({ message: 'wrong field name' }), // wrong field
    });

    const result = await aiService.generateOpportunityExplanation(validInput);
    expect(result.success).toBe(false);
  });

  it('returns success: false when AI throws', async () => {
    (aiClient.generate as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await aiService.generateOpportunityExplanation(validInput);
    expect(result.success).toBe(false);
  });

  it('returns success: false when AI client is unavailable', async () => {
    (aiClient.isAvailable as jest.Mock) = jest.fn().mockReturnValue(false);
    const result = await aiService.generateOpportunityExplanation(validInput);
    expect(result.success).toBe(false);
  });
});
```

### 24.3 Integration tests — recommendation API

```typescript
// tests/integration/recommendations.test.ts
import request from 'supertest';
import { createApp } from '../../../backend/src/app';
import { createTestUser, getAuthToken, seedTestOpportunities,
         setTestCareerAndSkillStates } from '../helpers';

const app = createApp();

describe('GET /api/v1/recommendations/opportunities', () => {
  let token: string;

  beforeEach(async () => {
    const { user } = await createTestUser();
    token = await getAuthToken(user.email, 'password123');
    await seedTestOpportunities();
    await setTestCareerAndSkillStates(user.profile.id);
  });

  it('returns 200 with three segments', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.readyNow).toBeDefined();
    expect(res.body.data.almostReady).toBeDefined();
    expect(res.body.data.aspirational).toBeDefined();
  });

  it('returns empty segments for student with no career selected', async () => {
    // Create user without career
    const { user: bareUser } = await createTestUser({ email: 'bare@test.com' });
    const bareToken = await getAuthToken('bare@test.com', 'password123');

    const res = await request(app)
      .get('/api/v1/recommendations/opportunities')
      .set('Authorization', `Bearer ${bareToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.readyNow).toHaveLength(0);
    expect(res.body.data.almostReady).toHaveLength(0);
  });

  it('each recommendation includes explanation with required fields', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities')
      .set('Authorization', `Bearer ${token}`);

    const allOpps = [
      ...res.body.data.readyNow,
      ...res.body.data.almostReady,
    ];

    for (const opp of allOpps) {
      expect(opp.explanation).toBeDefined();
      expect(opp.explanation.summary).toBeDefined();
      expect(Array.isArray(opp.explanation.matchingSkills)).toBe(true);
      expect(Array.isArray(opp.explanation.gapSkills)).toBe(true);
      expect(opp.explanation.careerAlignment).toMatch(/direct|adjacent|indirect/);
      expect(opp.explanation.eligibilityStatus).toMatch(/eligible|likely_eligible|check_required/);
    }
  });

  it('each recommendation includes originalUrl', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities')
      .set('Authorization', `Bearer ${token}`);

    const allOpps = [
      ...res.body.data.readyNow,
      ...res.body.data.almostReady,
      ...res.body.data.aspirational,
    ];

    for (const opp of allOpps) {
      expect(opp.originalUrl).toBeDefined();
      expect(() => new URL(opp.originalUrl)).not.toThrow();
    }
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/v1/recommendations/opportunities');
    expect(res.status).toBe(401);
  });
});
```

### 24.4 Tests for explanation fallback

```typescript
// tests/unit/explanation-fallback.test.ts
import { buildTemplateSummary } from
  '../../src/modules/recommendation/explanation.service';

describe('buildTemplateSummary', () => {
  it('acknowledges match when no gaps', () => {
    const summary = buildTemplateSummary(['Python', 'SQL'], [], 0.90);
    expect(summary).toContain('Python');
    expect(summary.length).toBeGreaterThan(10);
  });

  it('mentions gap skills when present', () => {
    const summary = buildTemplateSummary(['Python'], ['Docker', 'Testing'], 0.62);
    expect(summary).toContain('Docker');
  });

  it('handles empty arrays gracefully', () => {
    const summary = buildTemplateSummary([], [], 0.50);
    expect(summary.length).toBeGreaterThan(10);
  });
});
```

---

## 25. Development Sequence

### Phase 1 — AI Module foundation (can start as soon as Role 2 Phase 1 is done)

1. Set up `src/modules/ai/` directory structure
2. Implement `ai.client.ts` with Gemini integration
3. Implement graceful degradation: if no API key, `isAvailable()` returns false
4. Implement `prompts/explanation.prompt.ts`
5. Implement `validators/explanation.validator.ts`
6. Implement `aiService.generateOpportunityExplanation()` with full error handling
7. Write AI service unit tests with mocked client
8. Manually test against real Gemini API with a few sample inputs

**Deliverable:** AI Module available for other modules to import. Role 3 and Role 4 can begin using it.

---

### Phase 2 — Recommendation engine without AI (after Role 4 seeds data)

1. Implement `recommendation.service.ts` with `computeCompatibilityScore()`
2. Implement segmentation logic
3. Implement `getOpportunitySummary()` for Role 2 dashboard
4. Implement `recommendation.controller.ts` and `recommendation.routes.ts`
5. Wire to database: read skill states, opportunities, role skills
6. Test with manually seeded data from Role 4
7. Write scoring unit tests

**Deliverable:** Recommendations work with template explanations. Role 2 can wire up dashboard summary. Role 1 can build the opportunities page.

---

### Phase 3 — AI explanation integration

1. Implement `explanation.service.ts` integrating AI Module
2. Implement template fallback in same service
3. Test with and without AI key (verify fallback works)
4. Write explanation service tests

**Deliverable:** Recommendations include AI-generated explanations when available, template explanations otherwise.

---

### Phase 4 — Resource recommendations

1. Implement `resource-recommendation.service.ts`
2. Implement `GET /api/v1/recommendations/resources` endpoint
3. Test with seeded resource data from Role 3

**Deliverable:** Students see resource recommendations on their roadmap.

---

### Phase 5 — Additional AI services (for Role 3 and Role 4)

1. Implement `aiService.generateAssessmentQuestions()` with prompt and validator
2. Implement `aiService.extractSkillsFromText()` with prompt and validator
3. Implement `aiService.generateCareerExplanation()` with prompt and validator
4. Coordinate with Role 3 to test question generation
5. Coordinate with Role 4 to test skill extraction

**Deliverable:** AI Module fully implemented for all consumers.

---

### Phase 6 — Integration and refinement

1. Test full flow: student completes assessment → recommendations update → explanations render
2. Tune scoring weights if results seem unrealistic (adjust formula constants)
3. Tune prompt if AI explanations are too generic or too long
4. Verify `getOpportunitySummary()` correctly reflects recommendation counts
5. Load test with 100 opportunities to ensure scoring completes in < 2 seconds

---

## 26. Dependencies

### What Role 5 needs before starting

| Dependency | From | When needed |
|---|---|---|
| Running Express server | Role 2 | Before API testing |
| `prisma/schema.prisma` with all models | Role 2 | Before any DB queries |
| `prisma/client.ts` | Role 2 | Before Prisma queries |
| `authenticate` middleware | Role 2 | Before API endpoints |
| `profileService.getSkillStates()` | Role 2 | Before scoring |
| Skill data seeded (skills table) | Role 3 | Before scoring works meaningfully |
| Opportunity data seeded | Role 4 | Before recommendations return results |
| Gemini or OpenAI API key | External | Before AI explanations work |

### What other roles need from Role 5

| Deliverable | Needed by | When |
|---|---|---|
| `aiService.generateAssessmentQuestions()` | Role 3 (question bank) | Phase 5 |
| `aiService.extractSkillsFromText()` | Role 4 (pipeline) | Phase 5 |
| `recommendationService.getOpportunitySummary()` | Role 2 (dashboard) | Phase 2 end |
| `GET /recommendations/opportunities` functional | Role 1 (opportunities page) | Phase 3 end |
| `GET /recommendations/resources` functional | Role 1 (roadmap page) | Phase 4 end |

---

## 27. Git Branch and Workflow Expectations

### Branch naming

```
feature/role5-<short-description>
```

Examples:
```
feature/role5-ai-module-foundation
feature/role5-gemini-client
feature/role5-explanation-prompt
feature/role5-scoring-engine
feature/role5-recommendation-api
feature/role5-resource-recommendations
feature/role5-question-generation
feature/role5-skill-extraction-service
```

### Critical rules for Role 5

1. **Never commit API keys.** The `.env.example` gets a placeholder: `GEMINI_API_KEY=your-key-here`. The real key goes only in the local `.env` file which is gitignored.

2. **All AI tests must use mocked clients.** Tests must not make real API calls. Use `jest.mock()` on the AI client. This ensures tests are fast, free, and deterministic.

3. **Scoring formula changes require re-running unit tests.** The formula constants (`0.50`, `0.25`, `0.15`, `0.10`) are locked. If they need changing, update the tests accordingly and document the rationale in the PR.

4. **Prompt changes require manual review.** When modifying a prompt, test manually with at least 5 diverse inputs before committing. Document the inputs and outputs in the PR.

5. **Fallback must always be tested.** Every PR that touches AI service functions must include a test verifying the fallback works when `aiClient.isAvailable()` returns false.

### Commit message examples

```
feat(ai): implement Gemini client wrapper with graceful degradation
feat(ai): implement opportunity explanation prompt and validator
feat(recommendation): implement compatibility scoring formula
feat(recommendation): implement segmentation and ranking
feat(recommendation): implement explanation service with AI and template fallback
feat(recommendation): implement getOpportunitySummary for dashboard
feat(resource): implement resource recommendation by skill gap
feat(ai): implement question generation prompt and validator
feat(ai): implement skill extraction prompt for Role 4
test(recommendation): add scoring algorithm unit tests
test(ai): add AI service tests with mocked client
fix(recommendation): cap skillMatch score at 1.0 for EXPERT level
```

---

## 28. Definition of Done

A Role 5 feature is **Done** when:

- [ ] `GET /recommendations/opportunities` returns valid segmented results with real data
- [ ] `GET /recommendations/resources` returns skill-matched resources
- [ ] Every recommendation includes a valid explanation with all required fields
- [ ] Explanation fallback to template works when AI is unavailable (verified by test)
- [ ] AI module never throws — always returns a usable result or `{ success: false }`
- [ ] `getOpportunitySummary()` returns correct counts (verified by Role 2 dashboard test)
- [ ] `generateAssessmentQuestions()` returns draft questions with correct schema (verified by test)
- [ ] Scoring formula unit tests pass with 100% coverage of the formula function
- [ ] Segmentation tests pass including boundary values (0.20, 0.50, 0.75)
- [ ] AI client tests use mocked HTTP — no real API calls in test suite
- [ ] Recommendation records are written to `recommendations` table after scoring
- [ ] Student A cannot retrieve Student B's recommendations (auth test)
- [ ] System returns 200 (not 500) when AI is unavailable
- [ ] LLM API key is not present in any committed file
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes
- [ ] PR reviewed before merge

---

## 29. Integration Checklist

Before declaring Role 5 integration-ready for demo:

**Recommendation API:**
- [ ] `GET /recommendations/opportunities` returns results for a student with a complete profile
- [ ] `GET /recommendations/opportunities` returns empty segments for student with no career
- [ ] Segments are correctly populated: READY_NOW has highest scores, ASPIRATIONAL has lowest
- [ ] Each segment is sorted by score descending
- [ ] READY_NOW has at most 10 results; ALMOST_READY at most 15; ASPIRATIONAL at most 10
- [ ] All results include `originalUrl` from opportunity data
- [ ] All results include explanation with `summary`, `matchingSkills`, `gapSkills`, `gapSeverity`, `careerAlignment`, `eligibilityStatus`
- [ ] Template explanation is shown when AI is unavailable (not empty string)

**AI Module:**
- [ ] Gemini client initializes when `GEMINI_API_KEY` is set
- [ ] AI client marks itself unavailable gracefully when key is absent
- [ ] `generateOpportunityExplanation()` returns `success: false` (not throws) on LLM failure
- [ ] `generateAssessmentQuestions()` returns draft questions — verified with Role 3 that they are usable
- [ ] `extractSkillsFromText()` returns structured skill mentions — verified with Role 4

**Dashboard integration:**
- [ ] `getOpportunitySummary()` returns correct counts matching the recommendation segments
- [ ] Dashboard loads within 2 seconds (summary query must be fast)

**Cross-role:**
- [ ] Role 1 renders opportunity cards correctly with all recommendation fields
- [ ] Role 1 renders explanation fields (summary, skill chips, gap chips, badges)
- [ ] Role 2 dashboard shows correct readyNowCount and almostReadyCount
- [ ] Role 3 can receive draft questions from `generateAssessmentQuestions()`
- [ ] Role 4 can receive skill mentions from `extractSkillsFromText()`

**Scoring accuracy (manual review):**
- [ ] The golden demo student (Priya, ML Engineer path, BEGINNER Python) produces at least 1 READY_NOW and at least 3 ALMOST_READY results from the seeded opportunity data
- [ ] The READY_NOW results genuinely match the student's skills (manually verified)
- [ ] The ALMOST_READY explanations correctly identify the actual skill gaps

---

## 30. Prototype-Specific Implementation

### What must be flawless for the SIH demo

The golden demonstration path ends at the recommendation screen. When the judges see:

```
Ready Now:
  → AI for Good Hackathon (82% match)
    "Strong match — your Python and ML Fundamentals are well-aligned."

Almost Ready:
  → Junior ML Engineer Intern at Bangalore Analytics (61% match)
    "Close match — strengthening pandas and scikit-learn would make you a strong candidate."
```

This must be:
1. Deterministically produced (not random — same student, same results)
2. Accurately scored (the matches must genuinely make sense)
3. Clearly explained (no generic filler text)
4. Linking to real external URLs (clicking "Apply" must open a real page)

### Pre-demo preparation

The day before the demo:
1. Load the canonical test student (Priya, ML Engineer, known skill profile)
2. Run recommendations manually: `GET /recommendations/opportunities`
3. Verify at least 3 READY_NOW, 5 ALMOST_READY results appear
4. Manually read each explanation — reject any that sound generic
5. Verify all `originalUrl` values open real pages
6. Screenshot the results as backup in case AI is rate-limited during demo

---

## 31. What Can Be Simplified for SIH

| Full capability | SIH prototype simplification |
|---|---|
| Recommendation caching (Redis) | Re-compute on each request (acceptable for demo scale) |
| Recommendation refresh on skill update | Manual trigger via `?refresh=true` query param |
| Required proficiency level per opportunity tag | Assume INTERMEDIATE for all tags (one threshold) |
| Personalized resource ordering per student | Simple sort: isFree first, then estimatedHours asc |
| Semantic embedding-based matching | Dictionary matching only — no vector search |
| Opportunity tag confidence weighting | Binary (confidence > 0.5 = counted; below = ignored) |
| Eligibility structured parsing | Simple year-of-study regex only |
| Multi-role recommendation (student has multiple paths) | Single role only |
| Real-time recommendation update triggers | Batch: run full scoring on API call |
| A/B testing of scoring weights | Fixed weights in code constants |
| Explanation quality evaluation | Manual review before demo |

---

## 32. Future Production Improvements

| Area | Production improvement |
|---|---|
| Scoring | Fine-tuned weights per domain using historical application outcomes |
| Scoring | Required proficiency level per opportunity skill tag |
| Scoring | CGPA and academic performance as additional eligibility signal |
| Semantic matching | Sentence embedding similarity for skill-text matching |
| Vector search | pgvector for efficient similarity search at 10,000+ opportunities |
| Caching | Redis-cached recommendations with intelligent invalidation on profile change |
| Explanation | Multi-sentence explanations with career advice context |
| Feedback loop | Student applies / saves → implicit signal → improve future recommendations |
| Collaborative filtering | "Students like you also found these opportunities relevant" |
| LLM fine-tuning | Fine-tune on India-specific job market data for better skill extraction |
| Question generation | Psychometrician review pipeline with approval workflow |
| Diversity | Opportunity type diversity enforcement (not all internships) |
| Real-time | WebSocket push when new opportunities match student profile |
| Analytics | Recommendation click-through rate monitoring |
| Multi-modal | Resume/CV parsing for richer evidence signal |
| Institution analytics | Cohort-level recommendation analytics for colleges |

---

> **END OF ROLE 5 DOCUMENTATION — AI / RECOMMENDATION ENGINE**

---

**Waiting for your instruction.**

Say **"next"** to generate Role 6 documentation, or ask any clarifying question about Role 5 before proceeding.