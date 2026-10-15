import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData } from '../../infrastructure/crypto';
import { config } from '../../config/env';
import { logger } from '../../infrastructure/logger';

export function telegramAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check header first, then query parameter (for iframe top-level GET navigation)
  const initData = (req.headers['x-telegram-init-data'] as string) || (req.query.initData as string);

  // If initData is provided, rigorously validate HMAC-SHA256
  if (initData) {
    const validation = validateTelegramInitData(initData, config.telegramBotToken);
    if (validation.valid && validation.user) {
      req.telegramUserId = validation.user.id;
      req.telegramUser = validation.user;
      return next();
    } else {
      logger.warn('Telegram initData HMAC validation failed', {
        traceId: req.traceId,
        ip: req.ip,
      });
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Invalid or forged Telegram initData signature',
          traceId: req.traceId,
        },
      });
    }
  }

  // Check for test/demo mode outside native Telegram client
  if (config.allowDevAuthBypass) {
    const devUserIdHeader = req.headers['x-dev-telegram-user-id'] as string;
    const queryUserId = req.query.devUserId as string;
    const parsedUserId = parseInt(devUserIdHeader || queryUserId || '84920481', 10);

    req.telegramUserId = isNaN(parsedUserId) ? 84920481 : parsedUserId;
    req.telegramUser = {
      id: req.telegramUserId,
      first_name: 'Russell',
      username: 'rcrowee',
    };
    return next();
  }

  // Reject missing auth
  return res.status(403).json({
    error: {
      code: 'FORBIDDEN',
      message: 'Missing required X-Telegram-Init-Data authentication header',
      traceId: req.traceId,
    },
  });
}
