/**
 * recommendation.routes.ts
 * Role 5 — AI / Recommendation Engine — Step 3
 *
 * Registers the recommendation module's HTTP routes.
 *
 * Usage — in server.ts (or a central router):
 *
 *   import { createRecommendationRouter } from './modules/recommendation/recommendation.routes';
 *   app.use('/api/v1/recommendations', createRecommendationRouter(db, profileService, opportunityRepo));
 *
 * Registered routes (relative to mount prefix):
 *   GET /opportunities   → GET /api/v1/recommendations/opportunities
 */

import { Router } from 'express';
import { createRecommendationController } from './recommendation.controller';
import type {
  RecommendationPersistenceClient,
  ProfileService,
  OpportunityRepository,
} from './recommendation.service';
import type { ExplanationService } from './explanation.service';

import type { ResourceRecommendationService } from './resource-recommendation.service';

/**
 * Creates an Express Router with all recommendation routes registered.
 *
 * Accepts injected dependencies so the router remains testable and
 * decoupled from any global singleton Prisma instance.
 *
 * @param db             - Recommendation persistence client.
 * @param profileService - Profile + skill state provider.
 * @param opportunityRepo- Active opportunity reader.
 * @param explanationService - Explanation service.
 * @param resourceService - Resource recommendation generation.
 * @returns              - Configured Express Router.
 */
export function createRecommendationRouter(
  db: RecommendationPersistenceClient,
  profileService: ProfileService,
  opportunityRepo: OpportunityRepository,
  explanationService: ExplanationService,
  resourceService?: ResourceRecommendationService
): Router {
  const router = Router();
  const controller = createRecommendationController(
    db, 
    profileService, 
    opportunityRepo, 
    explanationService, 
    resourceService
  );

  /**
   * GET /opportunities
   * Full path: GET /api/v1/recommendations/opportunities
   *
   * Returns segmented and ranked opportunity recommendations for the
   * authenticated student.
   *
   * Query parameters:
   *   refresh?: "true" | "false"   (default: "false")
   */
  router.get('/opportunities', controller.getOpportunityRecommendations);

  /**
   * GET /resources
   * Full path: GET /api/v1/recommendations/resources
   *
   * Returns skill gaps and mapped learning resources.
   * 
   * Query parameters:
   *   skillId?: string (optional)
   */
  router.get('/resources', controller.getResourceRecommendations);

  /**
   * GET /courses
   * Full path: GET /api/v1/recommendations/courses
   *
   * Returns curated accredited courses & learning resources
   * filtered by roleId, skill, provider, search, and freeOnly.
   */
  router.get('/courses', controller.getCuratedCourses);

  return router;
}
