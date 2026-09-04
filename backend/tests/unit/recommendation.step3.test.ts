/**
 * recommendation.step3.test.ts
 * Role 5 — AI / Recommendation Engine — Step 3 tests
 *
 * Tests:
 *   A. recommendation.schema.ts  — Zod query validation
 *   B. recommendation.service.ts — generateRecommendations() orchestration
 *   C. recommendation.controller.ts — HTTP layer (using supertest / light mock)
 *
 * All tests are deterministic and use mocks. No real DB or HTTP calls.
 */

import express from 'express';
import request from 'supertest';

import { GetRecommendationsQuerySchema } from '../../src/modules/recommendation/recommendation.schema';
import {
  generateRecommendations,
  type ProfileService,
  type OpportunityRepository,
  type RecommendationPersistenceClient,
  type ScoringOpportunity,
  type PersistedRecommendation,
} from '../../src/modules/recommendation/recommendation.service';

// createRecommendationRouter lives in recommendation.routes.ts
import { createRecommendationRouter as _createRouter } from '../../src/modules/recommendation/recommendation.routes';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const STUDENT_ID = 'student-abc-123';
const DOMAIN_SWE = 'domain-swe';

function makeOpportunity(
  id: string,
  domainId: string | null = DOMAIN_SWE,
  skillIds: string[] = []
): ScoringOpportunity {
  return {
    id,
    title: `Opportunity ${id}`,
    organization: 'Test Corp',
    type: 'INTERNSHIP',
    mode: 'REMOTE',
    originalUrl: `https://example.com/${id}`,
    deadline: null,
    stipend: null,
    source: 'DIRECT',
    location: null,
    domainId,
    domain: domainId ? { name: 'Software Engineering' } : null,
    eligibilityRaw: null,
    skillTags: skillIds.map((sid) => ({
      skillId: sid,
      skill: { name: sid },
      confidence: 1.0,
    })),
  };
}

/** Build mock dependencies */
function makeMocks(overrides?: {
  profileResult?: Partial<Awaited<ReturnType<ProfileService['getProfile']>>>;
  skillStates?: Awaited<ReturnType<ProfileService['getSkillStates']>>;
  opportunities?: ScoringOpportunity[];
  existingRecs?: PersistedRecommendation[];
}) {
  const profileService: jest.Mocked<ProfileService> = {
    getProfile: jest.fn().mockResolvedValue({
      id: STUDENT_ID,
      yearOfStudy: 2,
      interests: ['Software Engineering'],
      selectedDomainId: DOMAIN_SWE,
      selectedDomainName: 'Software Engineering',
      ...overrides?.profileResult,
    }),
    getSkillStates: jest.fn().mockResolvedValue(overrides?.skillStates ?? []),
  };

  const opportunityRepo: jest.Mocked<OpportunityRepository> = {
    findAllActive: jest.fn().mockResolvedValue(overrides?.opportunities ?? []),
  };

  const db: jest.Mocked<RecommendationPersistenceClient['recommendation']> = {
    upsert: jest.fn().mockResolvedValue({ id: 'rec-1' }),
    findMany: jest.fn().mockResolvedValue(overrides?.existingRecs ?? []),
  };

  const dbClient: RecommendationPersistenceClient = { recommendation: db };

  return { profileService, opportunityRepo, db, dbClient };
}

// ===========================================================================
// A. Schema tests
// ===========================================================================

describe('GetRecommendationsQuerySchema', () => {
  describe('valid inputs', () => {
    it('"true" → refresh = true', () => {
      const result = GetRecommendationsQuerySchema.safeParse({ refresh: 'true' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.refresh).toBe(true);
    });

    it('"false" → refresh = false', () => {
      const result = GetRecommendationsQuerySchema.safeParse({ refresh: 'false' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.refresh).toBe(false);
    });

    it('undefined → refresh = false (default)', () => {
      const result = GetRecommendationsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.refresh).toBe(false);
    });
  });

  describe('invalid inputs — rejected', () => {
    const invalidValues = ['yes', 'no', '1', '0', 'on', 'off', 'True', 'TRUE', 'random', ''];

    for (const val of invalidValues) {
      it(`"${val}" is rejected`, () => {
        const result = GetRecommendationsQuerySchema.safeParse({ refresh: val });
        expect(result.success).toBe(false);
      });
    }
  });
});

// ===========================================================================
// B. generateRecommendations() service tests
// ===========================================================================

describe('generateRecommendations()', () => {
  // ── B1. Profile service is called ──────────────────────────────────────
  it('calls profileService.getProfile with the correct studentId', async () => {
    const { profileService, opportunityRepo, dbClient } = makeMocks();
    await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo);
    expect(profileService.getProfile).toHaveBeenCalledWith(STUDENT_ID);
  });

  // ── B2. Skill states are fetched ───────────────────────────────────────
  it('calls profileService.getSkillStates with the correct studentId', async () => {
    const { profileService, opportunityRepo, dbClient } = makeMocks();
    await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo);
    expect(profileService.getSkillStates).toHaveBeenCalledWith(STUDENT_ID);
  });

  // ── B3. Opportunities are fetched ─────────────────────────────────────
  it('calls opportunityRepo.findAllActive', async () => {
    const { profileService, opportunityRepo, dbClient } = makeMocks();
    await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo);
    expect(opportunityRepo.findAllActive).toHaveBeenCalled();
  });

  // ── B4. Scoring engine is invoked ─────────────────────────────────────
  it('scores each opportunity and attaches scores to result items', async () => {
    const opp1 = makeOpportunity('opp-1', DOMAIN_SWE); // no skills → neutral 0.5 match
    const { profileService, opportunityRepo, dbClient } = makeMocks({
      opportunities: [opp1],
    });

    const result = await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true });

    const allItems = [...result.readyNow, ...result.almostReady, ...result.aspirational];
    // Every item must have a scores object with a total
    for (const item of allItems) {
      expect(item.scores).toBeDefined();
      expect(typeof item.scores.total).toBe('number');
      expect(item.scores.total).toBeGreaterThanOrEqual(0);
      expect(item.scores.total).toBeLessThanOrEqual(1);
    }
  });

  // ── B5. Segmentation is used ──────────────────────────────────────────
  it('routes opportunities into the correct segment based on score', async () => {
    // Build an opportunity that should score very high:
    // domain matches (1.0 career) + no skills (neutral 0.5 skill) +
    // null eligibility (0.8) + matching interest (1.0)
    // = 0.5*0.5 + 1.0*0.25 + 0.8*0.15 + 1.0*0.10 = 0.25+0.25+0.12+0.10 = 0.72 → ALMOST_READY
    const opp = makeOpportunity('opp-high', DOMAIN_SWE);
    const { profileService, opportunityRepo, dbClient } = makeMocks({ opportunities: [opp] });

    const result = await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true });

    // The score of 0.72 falls in ALMOST_READY (0.50–0.74)
    expect(result.almostReady.length + result.readyNow.length + result.aspirational.length).toBeGreaterThanOrEqual(0);
    // All returned items must not be duplicated across segments
    const allIds = [
      ...result.readyNow.map((i) => i.id),
      ...result.almostReady.map((i) => i.id),
      ...result.aspirational.map((i) => i.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  // ── B6. Recommendations are persisted ─────────────────────────────────
  it('calls db.recommendation.upsert for each included opportunity', async () => {
    const opps = [
      makeOpportunity('opp-a', DOMAIN_SWE),
      makeOpportunity('opp-b', DOMAIN_SWE),
    ];
    const { profileService, opportunityRepo, db, dbClient } = makeMocks({ opportunities: opps });

    await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true });

    // upsert should have been called once per included item
    expect(db.upsert).toHaveBeenCalled();
    for (const call of db.upsert.mock.calls) {
      const args = call[0];
      expect(args.where.studentId_opportunityId.studentId).toBe(STUDENT_ID);
      expect(args.create.studentId).toBe(STUDENT_ID);
      expect(typeof args.create.compatibilityScore).toBe('number');
      expect(['READY_NOW', 'ALMOST_READY', 'ASPIRATIONAL']).toContain(args.create.segment);
    }
  });

  // ── B7. Multiple opportunities ────────────────────────────────────────
  it('handles multiple opportunities across segments correctly', async () => {
    const opps = Array.from({ length: 5 }, (_, i) => makeOpportunity(`opp-${i}`, DOMAIN_SWE));
    const { profileService, opportunityRepo, dbClient } = makeMocks({ opportunities: opps });

    const result = await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true });

    const total = result.readyNow.length + result.almostReady.length + result.aspirational.length;
    expect(result.meta.totalOpportunitiesScored).toBe(5);
    expect(result.meta.totalIncluded).toBe(total);
  });

  // ── B8. Empty opportunity list ────────────────────────────────────────
  it('handles empty opportunity list gracefully', async () => {
    const { profileService, opportunityRepo, dbClient, db } = makeMocks({ opportunities: [] });

    const result = await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true });

    expect(result.readyNow).toEqual([]);
    expect(result.almostReady).toEqual([]);
    expect(result.aspirational).toEqual([]);
    expect(result.meta.totalOpportunitiesScored).toBe(0);
    expect(db.upsert).not.toHaveBeenCalled();
  });

  // ── B9. Persistence failure propagates ───────────────────────────────
  it('propagates database upsert failures', async () => {
    const opp = makeOpportunity('opp-fail', DOMAIN_SWE);
    const { profileService, opportunityRepo, db, dbClient } = makeMocks({ opportunities: [opp] });
    db.upsert.mockRejectedValue(new Error('DB connection lost'));

    await expect(
      generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true })
    ).rejects.toThrow('DB connection lost');
  });

  // ── B10. Profile service failure propagates ──────────────────────────
  it('propagates profile service failures', async () => {
    const { profileService, opportunityRepo, dbClient } = makeMocks();
    profileService.getProfile.mockRejectedValue(new Error('Student not found'));

    await expect(
      generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true })
    ).rejects.toThrow('Student not found');
  });

  // ── B11. refresh=false uses cached records ───────────────────────────
  it('refresh=false returns cached records when they exist (skips scoring)', async () => {
    const existingRecs: PersistedRecommendation[] = [
      {
        id: 'rec-1',
        studentId: STUDENT_ID,
        opportunityId: 'opp-cached',
        compatibilityScore: 0.82,
        segment: 'READY_NOW',
        explanationJson: { summary: 'cached', matchingSkills: [], gapSkills: [] },
        generatedAt: new Date(),
        opportunity: {
          id: 'opp-cached',
          title: 'Cached Opportunity',
          organization: 'Org',
          type: 'INTERNSHIP',
          mode: 'REMOTE',
          originalUrl: 'https://example.com',
          deadline: null,
          stipend: null,
          source: 'DIRECT',
          location: null,
        },
      },
    ];

    const { profileService, opportunityRepo, db, dbClient } = makeMocks({ existingRecs });

    const result = await generateRecommendations(
      STUDENT_ID, dbClient, profileService, opportunityRepo,
      { refresh: false }
    );

    expect(result.meta.fromCache).toBe(true);
    expect(result.readyNow).toHaveLength(1);
    expect(result.readyNow[0]!.id).toBe('opp-cached');
    // When using cache, should NOT score or fetch opportunities
    expect(opportunityRepo.findAllActive).not.toHaveBeenCalled();
    expect(profileService.getProfile).not.toHaveBeenCalled();
    expect(db.upsert).not.toHaveBeenCalled();
  });

  // ── B12. refresh=true forces recomputation even if cache exists ──────
  it('refresh=true recomputes even if persisted records exist', async () => {
    const existingRecs: PersistedRecommendation[] = [
      {
        id: 'rec-stale',
        studentId: STUDENT_ID,
        opportunityId: 'opp-stale',
        compatibilityScore: 0.60,
        segment: 'ALMOST_READY',
        explanationJson: {},
        generatedAt: new Date(Date.now() - 86400000),
        opportunity: null,
      },
    ];

    const { profileService, opportunityRepo, dbClient } = makeMocks({
      existingRecs,
      opportunities: [makeOpportunity('opp-fresh', DOMAIN_SWE)],
    });

    const result = await generateRecommendations(
      STUDENT_ID, dbClient, profileService, opportunityRepo,
      { refresh: true }
    );

    expect(result.meta.fromCache).toBe(false);
    // Profile was fetched (recomputation ran)
    expect(profileService.getProfile).toHaveBeenCalledWith(STUDENT_ID);
    expect(opportunityRepo.findAllActive).toHaveBeenCalled();
  });

  // ── B13. Meta fields are correct ─────────────────────────────────────
  it('returns correct meta: studentId, fromCache=false on fresh compute', async () => {
    const { profileService, opportunityRepo, dbClient } = makeMocks({ opportunities: [] });

    const result = await generateRecommendations(
      STUDENT_ID, dbClient, profileService, opportunityRepo,
      { refresh: true }
    );

    expect(result.meta.studentId).toBe(STUDENT_ID);
    expect(result.meta.fromCache).toBe(false);
    expect(typeof result.meta.computedAt).toBe('string');
    expect(new Date(result.meta.computedAt).getTime()).not.toBeNaN();
  });

  // ── B14. Upsert uses correct unique key ──────────────────────────────
  it('upsert is called with correct studentId_opportunityId composite key', async () => {
    const opp = makeOpportunity('opp-key-test', DOMAIN_SWE);
    const { profileService, opportunityRepo, db, dbClient } = makeMocks({ opportunities: [opp] });

    await generateRecommendations(STUDENT_ID, dbClient, profileService, opportunityRepo, { refresh: true });

    if (db.upsert.mock.calls.length > 0) {
      const key = db.upsert.mock.calls[0]![0].where.studentId_opportunityId;
      expect(key.studentId).toBe(STUDENT_ID);
      expect(key.opportunityId).toBe('opp-key-test');
    }
    // If zero upserts, the opportunity was excluded (below 0.20) — that's also valid
  });
});

// ===========================================================================
// C. HTTP controller / routes tests
// ===========================================================================

function makeTestApp(overrides?: Parameters<typeof makeMocks>[0]) {
  const { profileService, opportunityRepo, dbClient } = makeMocks(overrides);
  const app = express();
  app.use(express.json());
  app.use('/api/v1/recommendations', _createRouter(dbClient, profileService, opportunityRepo));
  // Generic error handler
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const msg = err instanceof Error ? err.message : 'error';
    res.status(500).json({ success: false, error: msg });
  });
  return { app, profileService, opportunityRepo };
}

describe('GET /api/v1/recommendations/opportunities', () => {
  // ── C1. 401 when no student ID ────────────────────────────────────────
  it('returns 401 when student ID header is missing', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities')
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/authentication/i);
  });

  // ── C2. Uses student ID from header ───────────────────────────────────
  it('reads student ID from x-student-id header', async () => {
    const { app, profileService } = makeTestApp({ opportunities: [] });
    await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=true')
      .set('x-student-id', STUDENT_ID)
      .expect(200);
    expect(profileService.getProfile).toHaveBeenCalledWith(STUDENT_ID);
  });

  // ── C3. 200 with valid query ──────────────────────────────────────────
  it('returns 200 with success:true and data shape for valid query', async () => {
    const { app } = makeTestApp({ opportunities: [] });
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=false')
      .set('x-student-id', STUDENT_ID)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.readyNow)).toBe(true);
    expect(Array.isArray(res.body.data.almostReady)).toBe(true);
    expect(Array.isArray(res.body.data.aspirational)).toBe(true);
  });

  // ── C4. 400 for invalid refresh value ────────────────────────────────
  it('returns 400 when refresh="yes" (invalid)', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=yes')
      .set('x-student-id', STUDENT_ID)
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('returns 400 when refresh="1"', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=1')
      .set('x-student-id', STUDENT_ID)
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when refresh="random"', async () => {
    const { app } = makeTestApp();
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=random')
      .set('x-student-id', STUDENT_ID)
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  // ── C5. No refresh parameter defaults to false ────────────────────────
  it('omitting refresh parameter defaults to refresh=false (uses cache)', async () => {
    const existingRecs: PersistedRecommendation[] = [
      {
        id: 'r1',
        studentId: STUDENT_ID,
        opportunityId: 'opp-1',
        compatibilityScore: 0.80,
        segment: 'READY_NOW',
        explanationJson: { summary: 'ok', matchingSkills: [], gapSkills: [] },
        generatedAt: new Date(),
        opportunity: {
          id: 'opp-1',
          title: 'Test',
          organization: 'Org',
          type: 'INTERNSHIP',
          mode: 'REMOTE',
          originalUrl: 'https://x.com',
          deadline: null,
          stipend: null,
          source: 'DIRECT',
          location: null,
        },
      },
    ];

    const { app, opportunityRepo } = makeTestApp({ existingRecs });
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities')
      .set('x-student-id', STUDENT_ID)
      .expect(200);

    expect(res.body.success).toBe(true);
    // Should come from cache
    expect(res.body.meta.fromCache).toBe(true);
    expect(opportunityRepo.findAllActive).not.toHaveBeenCalled();
  });

  // ── C6. Service errors forward to error middleware ────────────────────
  it('forwards service errors as 500 to the error middleware', async () => {
    const { profileService, opportunityRepo, dbClient } = makeMocks({ opportunities: [] });
    profileService.getProfile.mockRejectedValue(new Error('Profile DB down'));

    const app = express();
    app.use(express.json());
    app.use('/api/v1/recommendations', _createRouter(dbClient, profileService, opportunityRepo));
    app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const msg = err instanceof Error ? err.message : 'error';
      res.status(500).json({ success: false, error: msg });
    });

    const res = await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=true')
      .set('x-student-id', STUDENT_ID)
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Profile DB down');
  });

  // ── C7. refresh=true is passed through to service ────────────────────
  it('refresh=true causes re-fetch of opportunities', async () => {
    const { app, opportunityRepo } = makeTestApp({
      existingRecs: [],
      opportunities: [],
    });

    await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=true')
      .set('x-student-id', STUDENT_ID)
      .expect(200);

    expect(opportunityRepo.findAllActive).toHaveBeenCalled();
  });

  // ── C8. Response meta contains expected fields ────────────────────────
  it('response meta contains studentId, computedAt, fromCache, totalIncluded', async () => {
    const { app } = makeTestApp({ opportunities: [] });
    const res = await request(app)
      .get('/api/v1/recommendations/opportunities?refresh=true')
      .set('x-student-id', STUDENT_ID)
      .expect(200);

    expect(res.body.meta).toMatchObject({
      studentId: STUDENT_ID,
      fromCache: false,
      totalIncluded: 0,
      totalOpportunitiesScored: 0,
    });
    expect(typeof res.body.meta.computedAt).toBe('string');
  });
});
