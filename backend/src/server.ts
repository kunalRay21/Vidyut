import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabaseSchema } from './database/db';

// Team Leader Core Routers
import authRouter from './auth/router';
import profileRouter from './core/profileRouter';
import institutionRouter from './core/institutionRouter';
import industryRouter from './core/industryRouter';

// Member 5 Routers
import opportunitiesRouter from './modules/opportunities/router';

// Member 4 Routers
import careersRouter from './modules/careers/router';
import skillGraphRouter from './modules/skill_graph/router';
import assessmentRouter from './modules/assessment/router';
import roadmapRouter from './modules/roadmap/router';
import portfolioRouter from './modules/portfolio/router';

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
import { GeminiClient } from './modules/ai/ai.client';
import { CentralizedAIService } from './modules/ai/ai.service';
import { ExplanationService } from './modules/recommendation/explanation.service';
import { ResourceRecommendationService, type ResourceRepository, type RoadmapRepository } from './modules/recommendation/resource-recommendation.service';

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

/**
 * Stub roadmap repository — returns an empty roadmap.
 * Replace with Role 3's real repository when available.
 */
const stubRoadmapRepo: RoadmapRepository = {
  getStudentRoadmap: async (studentId: string) => {
    console.warn(`[STUB] RoadmapRepository.getStudentRoadmap(${studentId}) — real repo not wired.`);
    return [];
  }
};

/**
 * Stub resource repository — returns an empty array.
 * Replace with Role 3's real repository when available.
 */
const stubResourceRepo: ResourceRepository = {
  findResourcesBySkillId: async (skillId: string) => {
    console.warn(`[STUB] ResourceRepository.findResourcesBySkillId(${skillId}) — real repo not wired.`);
    return [];
  }
};

/**
 * Initialize AI and Explanation services.
 * We initialize the Gemini client with an env var API key, which might be undefined.
 * The AIService safely handles errors, and the ExplanationService has a deterministic fallback.
 */
const aiClient = new GeminiClient(process.env.GEMINI_API_KEY);
const aiService = new CentralizedAIService(aiClient);
const explanationService = new ExplanationService(aiService);
const resourceRecommendationService = new ResourceRecommendationService(stubResourceRepo, stubRoadmapRepo);

app.use(
  '/api/v1/recommendations',
  createRecommendationRouter(stubDb, stubProfileService, stubOpportunityRepo, explanationService, resourceRecommendationService)
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

// Core Routes (Owned by Team Leader)
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/institution', institutionRouter);
app.use('/api/v1/industry', industryRouter);

// Module Routers
app.use('/api/v1/opportunities', opportunitiesRouter); // Member 5 (Data Engineer)
app.use('/api/v1/careers', careersRouter);             // Member 4 (Career Domains & Roles)
app.use('/api/v1/skill-graph', skillGraphRouter);       // Member 4 (Skill Graph DAG)
app.use('/api/v1/skills', skillGraphRouter);            // Member 4 (Skill Graph DAG alias)
app.use('/api/v1/assessments', assessmentRouter);       // Member 4 (Assessment Engine)
app.use('/api/v1/roadmap', roadmapRouter);              // Member 4 (Adaptive Roadmap)
app.use('/api/v1/portfolio', portfolioRouter);          // Member 4 (Portfolio & Evidence)

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

async function startServer() {
  await initDatabaseSchema();

  app.listen(PORT, () => {
    console.log(`⚡ Vidyut Backend running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  startServer();
}

export default app;
