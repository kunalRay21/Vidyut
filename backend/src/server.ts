import express, { Request, Response } from 'express';
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

// Root & Health check
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

async function startServer() {
  if (process.env.NODE_ENV !== 'test') {
    await initDatabaseSchema();

    app.listen(PORT, () => {
      console.log(`⚡ Vidyut Backend running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
