# ROLE5_MEMORY.md — Role 5 Development State

> Development-state record. Not a copy of documentation.
> Updated after each step.

---

## Current Progress

| Step | Status |
|------|--------|
| Step 1 — Deterministic Compatibility Scoring Engine | ✅ COMPLETE |
| Step 2 — Segmentation + Ranking | Not started |
| Step 3 — Recommendation Service + Controller + Routes | Not started |
| Step 4 — Explanation Service (AI + template fallback) | Not started |
| Step 5 — Resource Recommendation Service | Not started |
| Step 6 — AI Module (Gemini client, validators, prompts) | Not started |

---

## Implementation Record

### Files Created (Step 1)

| File | Purpose |
|------|---------|
| `backend/src/modules/recommendation/recommendation.types.ts` | TypeScript interfaces: `StudentSkillState`, `RoleSkill`, `OpportunitySkillTag`, `OpportunityWithTags`, `StudentProfileContext`, `CompatibilityScores`, `RecommendationSegment`, `MatchExplanation`, `OpportunitySummary` |
| `backend/src/modules/recommendation/scoring.engine.ts` | Pure deterministic scoring engine: `computeCompatibilityScore()`, `parseEligibilityScore()`, `computeInterestScore()`, `PROFICIENCY_SCORES`, `DEFAULT_REQUIRED_PROFICIENCY_SCORE` |
| `backend/tests/unit/scoring.engine.test.ts` | 20+ unit tests covering all required test cases from the task specification |
| `backend/jest.config.js` | Jest configuration with ts-jest preset |

### Dev Dependencies Added

- `jest`, `ts-jest`, `@types/jest` — installed via npm as devDependencies
- `package.json` `test` script updated to `jest`

---

## Decisions / Assumptions

### 1. File naming: `scoring.engine.ts` vs `recommendation.service.ts`

The spec (Section 8) shows `recommendation.service.ts` as the file containing `computeCompatibilityScore`. However, the task explicitly says Step 1 is **only** the scoring engine, and NOT the full recommendation service (which includes Prisma, database queries, HTTP controllers, etc.).

**Decision:** Place the pure scoring logic in `scoring.engine.ts` which will be imported by `recommendation.service.ts` in a later step. This keeps Step 1 completely isolated from all infrastructure.

The `PROFICIENCY_SCORES` constant and `computeCompatibilityScore` are exported from `scoring.engine.ts` so that `recommendation.service.ts` can re-export them (matching the path the spec's test examples reference).

### 2. `_roleSkills` parameter

The spec signature includes `roleSkills: RoleSkill[]` in `computeCompatibilityScore`. The Step 1 scoring formula per Section 18.2 uses `opportunity.skillTags` (each tag has its own `confidence`) rather than the role skills for weighting. The role skills parameter is accepted to keep the signature stable for later steps, but prefixed `_roleSkills` to indicate it is intentionally unused in this step.

### 3. Interest score for null domain

When `opportunityDomainName` is null, the spec says `computeInterestScore` receives `opportunity.domain?.name ?? null`. The documented rule says "if no match → 0.3". A null domain means there's nothing to match against, so `0.3` is returned (no match).

### 4. `requiredLevel` on `OpportunitySkillTag`

The prototype simplification (Section 31) says: "Required proficiency level per opportunity tag: Assume INTERMEDIATE for all tags (one threshold)." However, the type was defined with an optional `requiredLevel` field to maintain future compatibility. When absent, `DEFAULT_REQUIRED_PROFICIENCY_SCORE` (INTERMEDIATE=3) is used.

### 5. tsconfig does not include `tests/`

The backend `tsconfig.json` has `"include": ["src/**/*"]` which excludes `tests/`. This is intentional — Jest uses ts-jest which does its own TypeScript compilation for test files, so tests don't need to be in the tsconfig includes. No tsconfig modification needed.

### 6. Adjacent eligibility: year ±1

The spec says "adjacent year → 0.5". This is implemented as `Math.abs(y - studentYear) === 1` — exactly ±1 year distance. Years at distance ≥ 2 from all mentioned years produce 0.0 (clearly ineligible).

---

## Integration Notes

### Types available for later steps

All types are in `recommendation.types.ts`. Future steps import from this file:

```typescript
import type {
  StudentSkillState,
  RoleSkill,
  OpportunityWithTags,
  StudentProfileContext,
  CompatibilityScores,
  RecommendationSegment,
  MatchExplanation,
  OpportunitySummary,
} from './recommendation.types';
```

### Scoring engine available for later steps

```typescript
import {
  computeCompatibilityScore,
  parseEligibilityScore,
  computeInterestScore,
  PROFICIENCY_SCORES,
  DEFAULT_REQUIRED_PROFICIENCY_SCORE,
} from './scoring.engine';
```

The `recommendation.service.ts` (Step 2+) will import from `scoring.engine.ts` and also re-export `PROFICIENCY_SCORES` and `computeCompatibilityScore` so that the test import paths in the spec (`from '../../src/modules/recommendation/recommendation.service'`) continue to work.

### Test infrastructure

- Jest + ts-jest installed as devDependencies
- `jest.config.js` at `backend/jest.config.js`
- Test script: `npm test` runs jest
- Tests live in `backend/tests/unit/`

---

## Next Step

**Step 2 — Segmentation + Ranking**

Implement `segmentResults()` in `recommendation.service.ts`:
- Filters scores below 0.20
- Segments: `READY_NOW` (≥ 0.75), `ALMOST_READY` (0.50–0.74), `ASPIRATIONAL` (0.20–0.49)
- Sorts each segment descending by score
- Caps: READY_NOW max 10, ALMOST_READY max 15, ASPIRATIONAL max 10
- Also implement `getOpportunitySummary()` for the Role 2 dashboard contract
- Add segmentation unit tests (boundary values: 0.20, 0.50, 0.75)

Do NOT start Step 2 until explicitly instructed.
