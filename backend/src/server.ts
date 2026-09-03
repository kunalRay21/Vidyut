import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabaseSchema } from './database/db';
import authRouter from './auth/router';
import profileRouter from './core/profileRouter';
import institutionRouter from './core/institutionRouter';
import industryRouter from './core/industryRouter';

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

// Module Routers (Scaffolded for Members 4, 5, 6 to mount their routes):
// app.use('/api/v1/careers', skillGraphRouter);     // Member 4
// app.use('/api/v1/assessments', assessmentRouter); // Member 4
// app.use('/api/v1/roadmap', roadmapRouter);       // Member 4
// app.use('/api/v1/opportunities', oppsRouter);    // Member 5
// app.use('/api/v1/recommendations', recRouter);   // Member 6

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`⚡ Vidyut Backend running on http://localhost:${PORT}`);
    // Initialize database schema on startup
    await initDatabaseSchema();
  });
}

export default app;
