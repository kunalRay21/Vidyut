import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Recommendation module
// ---------------------------------------------------------------------------
// Dependencies are injected here so the router stays testable.
// Replace each stub with the real implementation when Role 1/2/4 provide them.

import { createRecommendationRouter } from './modules/recommendation/recommendation.routes';
import type {
  RecommendationPersistenceClient,
  ProfileService,
  OpportunityRepository,
} from './modules/recommendation/recommendation.service';

/**
 * Stub persistence client — satisfies the interface but throws if called.
 * Replace with the real Prisma client when the schema is generated.
 */
const stubDb: RecommendationPersistenceClient = {
  recommendation: {
    upsert: async () => {
      console.warn('[STUB] RecommendationPersistenceClient.upsert — real DB not wired yet.');
      return { id: 'stub-id' };
    },
    findMany: async () => {
      console.warn('[STUB] RecommendationPersistenceClient.findMany — real DB not wired yet.');
      return [];
    },
  },
};

/**
 * Stub profile service — returns a neutral profile so scoring doesn't crash.
 * Replace with Role 2's real service when available.
 */
const stubProfileService: ProfileService = {
  getProfile: async (studentId: string) => {
    console.warn(`[STUB] ProfileService.getProfile(${studentId}) — real service not wired.`);
    return {
      id: studentId,
      yearOfStudy: 2,
      interests: [],
      selectedDomainId: null,
      selectedDomainName: null,
    };
  },
  getSkillStates: async (studentId: string) => {
    console.warn(`[STUB] ProfileService.getSkillStates(${studentId}) — real service not wired.`);
    return [];
  },
};

/**
 * Stub opportunity repository — returns an empty list.
 * Replace with Role 4's real repository when available.
 */
const stubOpportunityRepo: OpportunityRepository = {
  findAllActive: async () => {
    console.warn('[STUB] OpportunityRepository.findAllActive — real repo not wired.');
    return [];
  },
};

app.use(
  '/api/v1/recommendations',
  createRecommendationRouter(stubDb, stubProfileService, stubOpportunityRepo)
);

// ---------------------------------------------------------------------------
// Root & Health check
// ---------------------------------------------------------------------------

app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Vidyut Express/Node.js Modular Monolith API',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// ---------------------------------------------------------------------------
// Generic error handler (must be last middleware)
// ---------------------------------------------------------------------------

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err);
  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred.';
  res.status(500).json({ success: false, error: message });
});

// ---------------------------------------------------------------------------

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ Vidyut Backend running on http://localhost:${PORT}`);
  });
}

export default app;
