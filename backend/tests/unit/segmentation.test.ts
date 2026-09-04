/**
 * segmentation.test.ts
 * Role 5 — AI / Recommendation Engine — Step 2 tests
 *
 * Unit tests for segmentResults() and getOpportunitySummary().
 * All tests are deterministic. No external API or database calls.
 */

import {
  segmentResults,
  getOpportunitySummary,
  assignSegment,
  READY_NOW_THRESHOLD,
  ALMOST_READY_THRESHOLD,
  ASPIRATIONAL_THRESHOLD,
  READY_NOW_CAP,
  ALMOST_READY_CAP,
  ASPIRATIONAL_CAP,
  type ScoredItem,
  type RecommendationDbClient,
} from '../../src/modules/recommendation/recommendation.service';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Build a minimal ScoredItem with an optional id for ordering verification. */
function item(total: number, id?: string): ScoredItem & { id: string } {
  return { id: id ?? `item-${total}`, scores: { total } };
}

/** Build N items all scoring the same value, with unique ids. */
function manyItems(count: number, score: number): Array<ScoredItem & { id: string }> {
  return Array.from({ length: count }, (_, i) => item(score, `${score}-${i}`));
}

// ---------------------------------------------------------------------------
// 1. Boundary tests — exact threshold values
// ---------------------------------------------------------------------------

describe('segmentResults — boundary values', () => {
  it('0.19 is excluded (below ASPIRATIONAL threshold)', () => {
    const result = segmentResults([item(0.19)]);
    expect(result.readyNow).toHaveLength(0);
    expect(result.almostReady).toHaveLength(0);
    expect(result.aspirational).toHaveLength(0);
  });

  it('0.20 goes to ASPIRATIONAL (= ASPIRATIONAL_THRESHOLD, inclusive)', () => {
    const result = segmentResults([item(0.20)]);
    expect(result.aspirational).toHaveLength(1);
    expect(result.readyNow).toHaveLength(0);
    expect(result.almostReady).toHaveLength(0);
    expect(result.aspirational[0]!.scores.total).toBe(0.20);
  });

  it('0.49 goes to ASPIRATIONAL (just below ALMOST_READY threshold)', () => {
    const result = segmentResults([item(0.49)]);
    expect(result.aspirational).toHaveLength(1);
    expect(result.almostReady).toHaveLength(0);
  });

  it('0.50 goes to ALMOST_READY (= ALMOST_READY_THRESHOLD, inclusive)', () => {
    const result = segmentResults([item(0.50)]);
    expect(result.almostReady).toHaveLength(1);
    expect(result.aspirational).toHaveLength(0);
    expect(result.readyNow).toHaveLength(0);
    expect(result.almostReady[0]!.scores.total).toBe(0.50);
  });

  it('0.74 goes to ALMOST_READY (just below READY_NOW threshold)', () => {
    const result = segmentResults([item(0.74)]);
    expect(result.almostReady).toHaveLength(1);
    expect(result.readyNow).toHaveLength(0);
  });

  it('0.75 goes to READY_NOW (= READY_NOW_THRESHOLD, inclusive)', () => {
    const result = segmentResults([item(0.75)]);
    expect(result.readyNow).toHaveLength(1);
    expect(result.almostReady).toHaveLength(0);
    expect(result.aspirational).toHaveLength(0);
    expect(result.readyNow[0]!.scores.total).toBe(0.75);
  });
});

// ---------------------------------------------------------------------------
// 2. Basic segmentation
// ---------------------------------------------------------------------------

describe('segmentResults — basic segmentation', () => {
  it('0.80 goes to READY_NOW', () => {
    const result = segmentResults([item(0.80)]);
    expect(result.readyNow).toHaveLength(1);
  });

  it('0.62 goes to ALMOST_READY', () => {
    const result = segmentResults([item(0.62)]);
    expect(result.almostReady).toHaveLength(1);
  });

  it('0.35 goes to ASPIRATIONAL', () => {
    const result = segmentResults([item(0.35)]);
    expect(result.aspirational).toHaveLength(1);
  });

  it('0.10 is excluded', () => {
    const result = segmentResults([item(0.10)]);
    expect(result.readyNow).toHaveLength(0);
    expect(result.almostReady).toHaveLength(0);
    expect(result.aspirational).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Ranking — descending sort within each segment
// ---------------------------------------------------------------------------

describe('segmentResults — ranking (descending order within segment)', () => {
  it('READY_NOW is sorted highest to lowest', () => {
    const inputs = [item(0.80, 'A'), item(0.92, 'B'), item(0.77, 'C')];
    const result = segmentResults(inputs);

    expect(result.readyNow).toHaveLength(3);
    expect(result.readyNow[0]!.id).toBe('B'); // 0.92
    expect(result.readyNow[1]!.id).toBe('A'); // 0.80
    expect(result.readyNow[2]!.id).toBe('C'); // 0.77
  });

  it('ALMOST_READY is sorted highest to lowest', () => {
    const inputs = [item(0.61, 'A'), item(0.80, 'X'), item(0.72, 'C')];
    // 0.80 is READY_NOW; 0.61 and 0.72 are ALMOST_READY
    const result = segmentResults(inputs);

    expect(result.readyNow).toHaveLength(1);
    expect(result.readyNow[0]!.id).toBe('X');

    expect(result.almostReady).toHaveLength(2);
    expect(result.almostReady[0]!.id).toBe('C'); // 0.72 first
    expect(result.almostReady[1]!.id).toBe('A'); // 0.61 second
  });

  it('ASPIRATIONAL is sorted highest to lowest', () => {
    const inputs = [item(0.22, 'low'), item(0.48, 'high'), item(0.35, 'mid')];
    const result = segmentResults(inputs);

    expect(result.aspirational).toHaveLength(3);
    expect(result.aspirational[0]!.id).toBe('high'); // 0.48
    expect(result.aspirational[1]!.id).toBe('mid');  // 0.35
    expect(result.aspirational[2]!.id).toBe('low');  // 0.22
  });

  it('mixed: spec example from the task — A(0.61), B(0.80), C(0.72)', () => {
    const inputs = [item(0.61, 'A'), item(0.80, 'B'), item(0.72, 'C')];
    const result = segmentResults(inputs);

    expect(result.readyNow).toHaveLength(1);
    expect(result.readyNow[0]!.id).toBe('B');

    expect(result.almostReady).toHaveLength(2);
    expect(result.almostReady[0]!.id).toBe('C'); // 0.72
    expect(result.almostReady[1]!.id).toBe('A'); // 0.61
  });
});

// ---------------------------------------------------------------------------
// 4. READY_NOW cap (max 10)
// ---------------------------------------------------------------------------

describe('segmentResults — READY_NOW cap', () => {
  it('returns exactly 10 items when 15 qualify for READY_NOW', () => {
    const inputs = manyItems(15, 0.90);
    const result = segmentResults(inputs);

    expect(result.readyNow).toHaveLength(READY_NOW_CAP);
    expect(result.readyNow).toHaveLength(10);
  });

  it('keeps highest-scoring 10 when applying the cap', () => {
    // Create 12 items scored 0.80, 0.81, ..., 0.91 (spread to verify order)
    const inputs = Array.from({ length: 12 }, (_, i) =>
      item(parseFloat((0.80 + i * 0.01).toFixed(2)), `id-${i}`)
    );
    const result = segmentResults(inputs);

    expect(result.readyNow).toHaveLength(10);
    // The highest score (0.91) should be first
    expect(result.readyNow[0]!.scores.total).toBeCloseTo(0.91, 2);
    // The 10th highest (0.82) should be last; 0.80 and 0.81 are excluded by cap
    expect(result.readyNow[9]!.scores.total).toBeCloseTo(0.82, 2);
  });
});

// ---------------------------------------------------------------------------
// 5. ALMOST_READY cap (max 15)
// ---------------------------------------------------------------------------

describe('segmentResults — ALMOST_READY cap', () => {
  it('returns exactly 15 items when 20 qualify for ALMOST_READY', () => {
    const inputs = manyItems(20, 0.60);
    const result = segmentResults(inputs);

    expect(result.almostReady).toHaveLength(ALMOST_READY_CAP);
    expect(result.almostReady).toHaveLength(15);
  });
});

// ---------------------------------------------------------------------------
// 6. ASPIRATIONAL cap (max 10)
// ---------------------------------------------------------------------------

describe('segmentResults — ASPIRATIONAL cap', () => {
  it('returns exactly 10 items when 15 qualify for ASPIRATIONAL', () => {
    const inputs = manyItems(15, 0.30);
    const result = segmentResults(inputs);

    expect(result.aspirational).toHaveLength(ASPIRATIONAL_CAP);
    expect(result.aspirational).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// 7. Mixed input — all segments + excluded, one pass
// ---------------------------------------------------------------------------

describe('segmentResults — mixed input', () => {
  const mixedInputs = [
    item(0.05, 'excluded-1'),
    item(0.19, 'excluded-2'),
    item(0.20, 'aspir-low'),
    item(0.35, 'aspir-mid'),
    item(0.48, 'aspir-high'),
    item(0.50, 'almost-low'),
    item(0.62, 'almost-mid'),
    item(0.74, 'almost-high'),
    item(0.75, 'ready-low'),
    item(0.88, 'ready-mid'),
    item(0.99, 'ready-high'),
  ];

  type MixedItem = ScoredItem & { id: string };

  let result: ReturnType<typeof segmentResults<MixedItem>>;

  beforeEach(() => {
    result = segmentResults<MixedItem>(mixedInputs);
  });

  it('READY_NOW contains exactly the expected items', () => {
    const ids = result.readyNow.map((i) => i.id);
    expect(ids).toContain('ready-high');
    expect(ids).toContain('ready-mid');
    expect(ids).toContain('ready-low');
    expect(ids).not.toContain('almost-high');
    expect(ids).not.toContain('aspir-high');
    expect(result.readyNow).toHaveLength(3);
  });

  it('ALMOST_READY contains exactly the expected items', () => {
    const ids = result.almostReady.map((i) => i.id);
    expect(ids).toContain('almost-low');
    expect(ids).toContain('almost-mid');
    expect(ids).toContain('almost-high');
    expect(ids).not.toContain('ready-low');
    expect(ids).not.toContain('aspir-high');
    expect(result.almostReady).toHaveLength(3);
  });

  it('ASPIRATIONAL contains exactly the expected items', () => {
    const ids = result.aspirational.map((i) => i.id);
    expect(ids).toContain('aspir-low');
    expect(ids).toContain('aspir-mid');
    expect(ids).toContain('aspir-high');
    expect(ids).not.toContain('almost-low');
    expect(result.aspirational).toHaveLength(3);
  });

  it('excluded items are absent from all segments', () => {
    const allIds = [
      ...result.readyNow,
      ...result.almostReady,
      ...result.aspirational,
    ].map((i) => i.id);

    expect(allIds).not.toContain('excluded-1');
    expect(allIds).not.toContain('excluded-2');
  });

  it('READY_NOW is sorted descending', () => {
    expect(result.readyNow[0]!.id).toBe('ready-high'); // 0.99
    expect(result.readyNow[1]!.id).toBe('ready-mid');  // 0.88
    expect(result.readyNow[2]!.id).toBe('ready-low');  // 0.75
  });

  it('ALMOST_READY is sorted descending', () => {
    expect(result.almostReady[0]!.id).toBe('almost-high'); // 0.74
    expect(result.almostReady[1]!.id).toBe('almost-mid');  // 0.62
    expect(result.almostReady[2]!.id).toBe('almost-low');  // 0.50
  });

  it('ASPIRATIONAL is sorted descending', () => {
    expect(result.aspirational[0]!.id).toBe('aspir-high'); // 0.48
    expect(result.aspirational[1]!.id).toBe('aspir-mid');  // 0.35
    expect(result.aspirational[2]!.id).toBe('aspir-low');  // 0.20
  });
});

// ---------------------------------------------------------------------------
// 8. Empty input
// ---------------------------------------------------------------------------

describe('segmentResults — empty input', () => {
  it('returns three empty arrays for empty input', () => {
    const result = segmentResults([]);
    expect(result.readyNow).toEqual([]);
    expect(result.almostReady).toEqual([]);
    expect(result.aspirational).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 9. Input array is not mutated
// ---------------------------------------------------------------------------

describe('segmentResults — immutability', () => {
  it('does not mutate the caller\'s input array', () => {
    const inputs = [item(0.80, 'A'), item(0.60, 'B'), item(0.30, 'C')];
    const originalOrder = inputs.map((i) => i.id);

    segmentResults(inputs);

    expect(inputs.map((i) => i.id)).toEqual(originalOrder);
  });

  it('does not mutate when all items are excluded', () => {
    const inputs = [item(0.05), item(0.10)];
    const snapshot = [...inputs];
    segmentResults(inputs);
    expect(inputs).toEqual(snapshot);
  });
});

// ---------------------------------------------------------------------------
// 10. Additional items fit under cap without being truncated
// ---------------------------------------------------------------------------

describe('segmentResults — under cap', () => {
  it('returns all 3 READY_NOW items when only 3 exist (under cap of 10)', () => {
    const result = segmentResults(manyItems(3, 0.85));
    expect(result.readyNow).toHaveLength(3);
  });

  it('returns all 5 ALMOST_READY items when only 5 exist (under cap of 15)', () => {
    const result = segmentResults(manyItems(5, 0.60));
    expect(result.almostReady).toHaveLength(5);
  });

  it('returns all 4 ASPIRATIONAL items when only 4 exist (under cap of 10)', () => {
    const result = segmentResults(manyItems(4, 0.30));
    expect(result.aspirational).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// 11. Threshold / cap constants are correct
// ---------------------------------------------------------------------------

describe('segmentation constants', () => {
  it('READY_NOW_THRESHOLD is 0.75', () => expect(READY_NOW_THRESHOLD).toBe(0.75));
  it('ALMOST_READY_THRESHOLD is 0.50', () => expect(ALMOST_READY_THRESHOLD).toBe(0.50));
  it('ASPIRATIONAL_THRESHOLD is 0.20', () => expect(ASPIRATIONAL_THRESHOLD).toBe(0.20));
  it('READY_NOW_CAP is 10',    () => expect(READY_NOW_CAP).toBe(10));
  it('ALMOST_READY_CAP is 15', () => expect(ALMOST_READY_CAP).toBe(15));
  it('ASPIRATIONAL_CAP is 10', () => expect(ASPIRATIONAL_CAP).toBe(10));
});

// ---------------------------------------------------------------------------
// 12. assignSegment() helper
// ---------------------------------------------------------------------------

describe('assignSegment()', () => {
  it('returns READY_NOW for score >= 0.75', () => {
    expect(assignSegment(0.75)).toBe('READY_NOW');
    expect(assignSegment(0.90)).toBe('READY_NOW');
    expect(assignSegment(1.00)).toBe('READY_NOW');
  });

  it('returns ALMOST_READY for 0.50 <= score < 0.75', () => {
    expect(assignSegment(0.50)).toBe('ALMOST_READY');
    expect(assignSegment(0.62)).toBe('ALMOST_READY');
    expect(assignSegment(0.74)).toBe('ALMOST_READY');
  });

  it('returns ASPIRATIONAL for 0.20 <= score < 0.50', () => {
    expect(assignSegment(0.20)).toBe('ASPIRATIONAL');
    expect(assignSegment(0.35)).toBe('ASPIRATIONAL');
    expect(assignSegment(0.49)).toBe('ASPIRATIONAL');
  });

  it('returns null for score < 0.20 (excluded)', () => {
    expect(assignSegment(0.19)).toBeNull();
    expect(assignSegment(0.00)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 13. getOpportunitySummary() — with a mock DB client
// ---------------------------------------------------------------------------

describe('getOpportunitySummary()', () => {
  /** Build a mock DB client with preset groupBy results. */
  function mockDb(
    rows: Array<{ segment: string; _count: { segment: number } }>
  ): RecommendationDbClient {
    return {
      recommendation: {
        groupBy: async () => rows,
      },
    };
  }

  it('returns correct counts for all segments present', async () => {
    const db = mockDb([
      { segment: 'READY_NOW',    _count: { segment: 4 } },
      { segment: 'ALMOST_READY', _count: { segment: 7 } },
      { segment: 'ASPIRATIONAL', _count: { segment: 2 } }, // should be ignored
    ]);

    const summary = await getOpportunitySummary('student-1', db);

    expect(summary.readyNowCount).toBe(4);
    expect(summary.almostReadyCount).toBe(7);
    // ASPIRATIONAL is not part of the Role 2 dashboard contract
    expect((summary as unknown as Record<string, unknown>)['aspirationalCount']).toBeUndefined();
  });

  it('returns 0 for a segment not present in DB rows', async () => {
    const db = mockDb([
      { segment: 'READY_NOW', _count: { segment: 3 } },
      // ALMOST_READY not returned → should be 0
    ]);

    const summary = await getOpportunitySummary('student-2', db);

    expect(summary.readyNowCount).toBe(3);
    expect(summary.almostReadyCount).toBe(0);
  });

  it('returns { 0, 0 } when the student has no stored recommendations', async () => {
    const db = mockDb([]); // empty result

    const summary = await getOpportunitySummary('student-new', db);

    expect(summary.readyNowCount).toBe(0);
    expect(summary.almostReadyCount).toBe(0);
  });

  it('passes the correct studentId to the DB query', async () => {
    let capturedArgs: Parameters<RecommendationDbClient['recommendation']['groupBy']>[0] | null =
      null;

    const db: RecommendationDbClient = {
      recommendation: {
        groupBy: async (args) => {
          capturedArgs = args;
          return [];
        },
      },
    };

    await getOpportunitySummary('student-xyz', db);

    expect(capturedArgs).not.toBeNull();
    expect(capturedArgs!.where.studentId).toBe('student-xyz');
  });

  it('returns only readyNowCount and almostReadyCount (exact shape)', async () => {
    const db = mockDb([]);
    const summary = await getOpportunitySummary('s', db);

    // Exact keys — no extra fields
    expect(Object.keys(summary).sort()).toEqual(['almostReadyCount', 'readyNowCount']);
  });
});
