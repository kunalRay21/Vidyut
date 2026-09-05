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

// Help & Guided Assistant Router
import helpRouter from './modules/help/router';

// Phase 6 Demo Router
import demoRouter from './modules/demo/router';
import { checkDatabaseConnection } from './database/db';
import { apiSuccess, apiError } from './core/responses';
import { logger } from './core/logger';

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
import { GeminiClient } from './modules/ai/ai.client';
import { CentralizedAIService } from './modules/ai/ai.service';
import { ExplanationService } from './modules/recommendation/explanation.service';
import { ResourceRecommendationService } from './modules/recommendation/resource-recommendation.service';
import { 
  PrismaProfileService, 
  PrismaOpportunityRepository,
  PrismaRecommendationPersistenceClient,
  PrismaResourceRepository,
  PrismaRoadmapRepository
} from './modules/recommendation/recommendation.adapters';

const prismaProfileService = new PrismaProfileService();
const prismaOpportunityRepo = new PrismaOpportunityRepository();
const prismaRecommendationDb = new PrismaRecommendationPersistenceClient();
const prismaResourceRepo = new PrismaResourceRepository();
const prismaRoadmapRepo = new PrismaRoadmapRepository();

/**
 * Initialize AI and Explanation services.
 * We initialize the Gemini client with an env var API key, which might be undefined.
 * The AIService safely handles errors, and the ExplanationService has a deterministic fallback.
 */
const aiClient = new GeminiClient(process.env.GEMINI_API_KEY);
const aiService = new CentralizedAIService(aiClient);
const explanationService = new ExplanationService(aiService);
const resourceRecommendationService = new ResourceRecommendationService(prismaResourceRepo, prismaRoadmapRepo);

app.use(
  '/api/v1/recommendations',
  createRecommendationRouter(prismaRecommendationDb, prismaProfileService, prismaOpportunityRepo, explanationService, resourceRecommendationService)
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

app.get(['/health', '/api/v1/health'], async (_req: Request, res: Response) => {
  const dbConnected = await checkDatabaseConnection();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: dbConnected ? 'healthy' : 'degraded',
    mode: dbConnected ? 'postgresql' : 'in-memory-fallback',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    services: {
      api: 'operational',
      database: dbConnected ? 'connected' : 'disconnected (using in-memory fallback)',
      redis: 'optional (in-memory caching active)'
    }
  };

  return apiSuccess(res, healthData, 200);
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
app.use('/api/v1/help', helpRouter);                    // Vidyut Help Assistant
app.use('/api/v1/demo', demoRouter);                    // Phase 6 Demo & Simulation Router

// ---------------------------------------------------------------------------
// Generic error handler (must be last middleware)
// ---------------------------------------------------------------------------

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Server', 'Unhandled server error', { error: err instanceof Error ? err.message : String(err) });
  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred.';
  return apiError(res, message, 500, 'INTERNAL_SERVER_ERROR');
});

// ---------------------------------------------------------------------------

async function startServer() {
  await initDatabaseSchema();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`⚡ Vidyut Backend running on http://localhost:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  startServer();
}

export default app;
