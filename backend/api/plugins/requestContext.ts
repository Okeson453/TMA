import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      traceId: string;
      telegramUserId?: number;
      telegramUser?: {
        id: number;
        first_name?: string;
        last_name?: string;
        username?: string;
      };
    }
  }
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingTrace = req.headers['x-trace-id'] as string;
  req.traceId = incomingTrace || crypto.randomUUID();
  res.setHeader('x-trace-id', req.traceId);
  next();
}
