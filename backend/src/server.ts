import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

import assessmentRouter from './modules/assessment/router';

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

// Assessment Platform Diagnostic Subsystem
app.use('/api/v1/assessments', assessmentRouter);


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ Vidyut Backend running on http://localhost:${PORT}`);
  });
}

export default app;
