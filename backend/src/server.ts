import { initDatabaseSchema } from './database/db';
import express, { Request, Response } from 'express';
import skillGraphRouter from './modules/skill_graph/router';
import assessmentRouter from './modules/assessment/router';
import roadmapRouter from './modules/roadmap/router';
import profileRouter from './modules/profile/router';
import careersRouter from './modules/careers/router';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/api/v1/skill-graph', skillGraphRouter);
app.use('/api/v1/assessments', assessmentRouter);
app.use('/api/v1/roadmap', roadmapRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/careers', careersRouter);

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
