import express, { Express, Request, Response, NextFunction } from 'express';
import { requestContextMiddleware } from './api/plugins/requestContext';
import profileRoutes from './api/routes/profiles';
import proxyRoutes from './api/routes/proxy';
import healthRoutes from './api/routes/health';
import { logger } from './infrastructure/logger';

export function createBackendApp(): Express {
  const app = express();

  // Basic parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request context & tracing
  app.use(requestContextMiddleware);

  // Mount routes
  app.use('/', healthRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/proxy', proxyRoutes);

  // Fallback 404 for unhandled /api or /proxy
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `API endpoint '${req.originalUrl}' not found`,
        traceId: req.traceId,
      },
    });
  });

  // Global error handler adhering to §6.5
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled server error', {
      error: err.message,
      stack: err.stack,
      traceId: req.traceId,
    });

    res.status(err.status || 500).json({
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred',
        traceId: req.traceId,
      },
    });
  });

  return app;
}
