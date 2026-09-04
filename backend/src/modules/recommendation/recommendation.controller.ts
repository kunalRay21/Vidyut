/**
 * recommendation.controller.ts
 * Role 5 — AI / Recommendation Engine — Step 3
 *
 * HTTP controller for:
 *   GET /api/v1/recommendations/opportunities
 *
 * Architecture:
 *   request → validate query → call service → return response
 *
 * The controller keeps all business logic in the service layer.
 * It is responsible only for:
 *   1. Extracting the authenticated student ID from the request.
 *   2. Validating query parameters with Zod.
 *   3. Delegating to generateRecommendations().
 *   4. Shaping the HTTP response.
 *   5. Forwarding errors to Express error middleware via next().
 *
 * Authentication note:
 *   The Node/Express backend does not yet have auth middleware wired.
 *   The controller reads `req.headers['x-student-id']` as a stand-in for
 *   the authenticated JWT claim. When Role 1 (Team Leader) wires the JWT
 *   middleware (populating req.user), replace the header extraction with:
 *
 *       const studentId = (req as AuthenticatedRequest).user.studentId;
 *
 *   The controller is deliberately structured so this is a one-line change.
 *   A 401 is returned if the student ID cannot be determined.
 */

import type { Request, Response, NextFunction } from 'express';
import { GetRecommendationsQuerySchema } from './recommendation.schema';
import {
  generateRecommendations,
  type RecommendationPersistenceClient,
  type ProfileService,
  type OpportunityRepository,
} from './recommendation.service';
import type { ExplanationService } from './explanation.service';

// ---------------------------------------------------------------------------
// Response shape helpers
// ---------------------------------------------------------------------------

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

function successResponse<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): void {
  const body: ApiSuccess<T> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(status).json(body);
}

function errorResponse(
  res: Response,
  message: string,
  status: number,
  details?: unknown
): void {
  const body: ApiError = { success: false, error: message };
  if (details !== undefined) body.details = details;
  res.status(body ? status : 500).json(body);
}

// ---------------------------------------------------------------------------
// Controller factory
// ---------------------------------------------------------------------------

import type { ResourceRecommendationService } from './resource-recommendation.service';

/**
 * Creates the recommendation controller with injected dependencies.
 *
 * Using a factory allows the unit tests to inject mocks without needing
 * module-level mocking infrastructure.
 *
 * @param db             - Persistence client (Prisma-compatible).
 * @param profileService - Role 2's profile + skill state fetcher.
 * @param opportunityRepo- Opportunity reader.
 * @param explanationService - Explanation generation.
 * @param resourceService - Resource recommendation generation.
 */
export function createRecommendationController(
  db: RecommendationPersistenceClient,
  profileService: ProfileService,
  opportunityRepo: OpportunityRepository,
  explanationService: ExplanationService,
  resourceService?: ResourceRecommendationService
) {
  /**
   * GET /api/v1/recommendations/opportunities
   *
   * Query parameters:
   *   refresh?: "true" | "false"   — defaults to false
   *
   * Response:
   *   200 { success: true, data: { readyNow, almostReady, aspirational }, meta }
   *   400 { success: false, error: "Invalid query parameters", details: ... }
   *   401 { success: false, error: "Authentication required" }
   *   500 { success: false, error: "Internal server error" }
   */
  async function getOpportunityRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // ── 1. Resolve authenticated student ID ──────────────────────────────
      const studentId =
        (req.headers['x-student-id'] as string | undefined) ??
        (req.query['studentId'] as string | undefined);

      if (!studentId || studentId.trim() === '') {
        errorResponse(res, 'Authentication required: student ID not found in request.', 401);
        return;
      }

      // ── 2. Validate query parameters ─────────────────────────────────────
      const queryResult = GetRecommendationsQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        errorResponse(
          res,
          'Invalid query parameters.',
          400,
          queryResult.error.flatten().fieldErrors
        );
        return;
      }

      const { refresh } = queryResult.data;

      // ── 3. Call service ───────────────────────────────────────────────────
      const result = await generateRecommendations(
        studentId.trim(),
        db,
        profileService,
        opportunityRepo,
        explanationService,
        { refresh }
      );

      // ── 4. Return response ────────────────────────────────────────────────
      successResponse(
        res,
        {
          readyNow:    result.readyNow,
          almostReady: result.almostReady,
          aspirational: result.aspirational,
        },
        {
          studentId: result.meta.studentId,
          totalOpportunitiesScored: result.meta.totalOpportunitiesScored,
          totalIncluded: result.meta.totalIncluded,
          computedAt: result.meta.computedAt,
          fromCache: result.meta.fromCache,
        }
      );
    } catch (err) {
      // Forward unexpected errors to Express error middleware
      next(err);
    }
  }

  /**
   * GET /api/v1/recommendations/resources
   *
   * Query parameters:
   *   skillId?: string
   *
   * Response:
   *   200 { success: true, data: { skillResources: [...] } }
   *   401 { success: false, error: "Authentication required" }
   *   500 { success: false, error: "Internal server error" }
   */
  async function getResourceRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const studentId =
        (req.headers['x-student-id'] as string | undefined) ??
        (req.query['studentId'] as string | undefined);

      if (!studentId || studentId.trim() === '') {
        errorResponse(res, 'Authentication required: student ID not found in request.', 401);
        return;
      }

      if (!resourceService) {
        errorResponse(res, 'Resource recommendation service is not configured.', 500);
        return;
      }

      const skillId = req.query['skillId'] as string | undefined;

      const result = await resourceService.getResourceRecommendations(studentId.trim(), skillId);

      successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }

  return { getOpportunityRecommendations, getResourceRecommendations };
}
