import { Router } from 'express';
import { proxyController } from '../controllers/proxyController';
import { telegramAuthMiddleware } from '../plugins/telegramAuth';

const router = Router();

// Enforce Telegram auth on proxy routes
router.use(telegramAuthMiddleware);

// Handle root proxy request /proxy/:profileId
router.all('/:profileId', (req, res) => proxyController.proxy(req, res));

// Handle wildcard proxy requests /proxy/:profileId/*
router.all('/:profileId/*', (req, res) => proxyController.proxy(req, res));

export default router;
