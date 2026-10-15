import { Router } from 'express';
import { createMockTelegramInitData } from '../../infrastructure/crypto';
import { config } from '../../config/env';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    targetOrigin: config.targetOrigin,
  });
});

// Helper for dev/preview UI to obtain mock initData or forged initData
router.get('/api/dev/mock-init-data', (req, res) => {
  const userId = parseInt((req.query.userId as string) || '84920481', 10);
  const username = (req.query.username as string) || 'rcrowee';
  const firstName = (req.query.firstName as string) || 'Russell';

  const validInitData = createMockTelegramInitData(
    { id: userId, first_name: firstName, username },
    config.telegramBotToken
  );

  const forgedInitData = `${validInitData.substring(0, validInitData.lastIndexOf('=') + 1)}0000deadbeef1111forged`;

  res.status(200).json({
    validInitData,
    forgedInitData,
    user: { id: userId, first_name: firstName, username },
  });
});

export default router;
