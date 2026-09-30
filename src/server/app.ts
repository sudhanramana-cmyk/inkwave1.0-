import express, { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './auth';
import { apiRouter } from './routes';

export function createExpressApp() {
  const app = express();

  // Basic CORS headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token'
    );
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Attach auth middleware to populate req.user if token is present
  app.use(authMiddleware);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'INKWAVE API', timestamp: new Date().toISOString() });
  });

  // Mount API router on /api, /api/auth, and /auth for complete endpoint compatibility
  app.use('/api', apiRouter);
  app.use('/auth', apiRouter);

  return app;
}
