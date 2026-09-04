/**
 * recommendation.schema.ts
 * Role 5 — AI / Recommendation Engine — Step 3
 *
 * Zod validation schemas for the recommendation HTTP layer.
 *
 * IMPORTANT: Express query parameters always arrive as strings.
 * ?refresh=true  → req.query.refresh === "true"   (string, not boolean)
 * ?refresh=false → req.query.refresh === "false"  (string, not boolean)
 *
 * Only the exact strings "true" and "false" are accepted.
 * Values like "1", "yes", "on", "random" are rejected with a 400 error.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// refresh query parameter
// ---------------------------------------------------------------------------

/**
 * Transforms the raw Express query string value to a boolean.
 *
 * Accepted:
 *   "true"       → true
 *   "false"      → false
 *   undefined    → false   (omitting the parameter = use cache)
 *
 * Rejected:
 *   "1", "0", "yes", "no", "on", "off", any other string → ZodError
 */
const refreshParam = z
  .union([
    z.literal('true').transform(() => true),
    z.literal('false').transform(() => false),
    z.undefined().transform(() => false),
  ])
  .describe(
    'Whether to recompute recommendations. Must be "true" or "false". Omitting defaults to false.'
  );

/**
 * Full query-parameter schema for GET /api/v1/recommendations/opportunities.
 *
 * Usage:
 *   const result = GetRecommendationsQuerySchema.safeParse(req.query);
 *   if (!result.success) → 400
 *   result.data.refresh  → boolean
 */
export const GetRecommendationsQuerySchema = z.object({
  refresh: refreshParam,
});

export type GetRecommendationsQuery = z.infer<typeof GetRecommendationsQuerySchema>;
