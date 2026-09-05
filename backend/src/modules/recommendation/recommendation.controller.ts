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
import { verifyToken } from '../../auth/jwt';
import { prisma } from '../../database/prisma';

async function resolveStudentId(req: Request): Promise<string | null> {
  const directId =
    (req.headers['x-student-id'] as string | undefined) ??
    (req.query['studentId'] as string | undefined);

  if (directId && directId.trim() !== '') {
    const trimmed = directId.trim();
    try {
      const profile = await prisma.studentProfile.findFirst({
        where: {
          OR: [{ id: trimmed }, { userId: trimmed }],
        },
      });
      if (profile) return profile.id;
    } catch {
      // ignore
    }
    return trimmed;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const profile = await prisma.studentProfile.findFirst({
          where: { userId: decoded.id }
        });
        if (profile) return profile.id;
        return decoded.id;
      }
    } catch {
      // Ignore token decode failures
    }
  }

  return null;
}

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
      const studentId = await resolveStudentId(req);

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
      let studentId = await resolveStudentId(req);

      if (!studentId || studentId.trim() === '') {
        // Fallback for public browsing: default student id
        studentId = 'default-student';
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

  /**
   * GET /api/v1/recommendations/courses
   *
   * Query parameters:
   *   roleId?: string (e.g. 'role-backend', 'role-ml', 'role-cloud', 'role-data', 'role-fullstack', 'role-security')
   *   skill?: string
   *   provider?: string
   *   search?: string
   *   freeOnly?: "true" | "false"
   */
  async function getCuratedCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { RESOURCES_SEED } = await import('./seedResources');
      const { roleId, skill, provider, search, freeOnly } = req.query;
      let courses = [...RESOURCES_SEED];

      // If roleId provided, filter by skills mapped to that role
      if (roleId && typeof roleId === 'string' && roleId !== 'ALL') {
        const { BACKEND_DOMAIN_TAXONOMY } = await import('../resume/resumeService');
        const domain = BACKEND_DOMAIN_TAXONOMY[roleId];
        if (domain) {
          const roleSkillKeywords = [...domain.coreSkills, ...domain.secondarySkills].map(s => s.toLowerCase());
          courses = courses.filter(c => {
            const cSkill = c.skillName.toLowerCase();
            return roleSkillKeywords.some(k => cSkill.includes(k) || k.includes(cSkill));
          });
        }
      }

      if (skill && typeof skill === 'string') {
        const sLower = skill.toLowerCase();
        courses = courses.filter(c => c.skillName.toLowerCase().includes(sLower));
      }

      if (provider && typeof provider === 'string' && provider !== 'ALL') {
        const pLower = provider.toLowerCase();
        courses = courses.filter(c => c.provider.toLowerCase().includes(pLower));
      }

      if (search && typeof search === 'string' && search.trim().length > 0) {
        const q = search.toLowerCase().trim();
        courses = courses.filter(c => 
          c.title.toLowerCase().includes(q) ||
          c.skillName.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q)
        );
      }

      if (freeOnly === 'true') {
        courses = courses.filter(c => c.isFree);
      }

      successResponse(res, {
        total: courses.length,
        courses: courses.map((c, idx) => ({
          id: `course-${idx + 1}`,
          title: c.title,
          url: c.url,
          skillName: c.skillName,
          type: c.type,
          isFree: c.isFree,
          provider: c.provider,
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  return { getOpportunityRecommendations, getResourceRecommendations, getCuratedCourses };
}
