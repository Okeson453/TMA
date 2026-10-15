import { Router } from 'express';
import { profileController } from '../controllers/profileController';
import { telegramAuthMiddleware } from '../plugins/telegramAuth';

const router = Router();

// Enforce Telegram auth on all profile routes
router.use(telegramAuthMiddleware);

router.get('/', (req, res) => profileController.list(req, res));
router.post('/', (req, res) => profileController.create(req, res));
router.get('/:profileId', (req, res) => profileController.get(req, res));
router.patch('/:profileId', (req, res) => profileController.update(req, res));
router.delete('/:profileId', (req, res) => profileController.delete(req, res));
router.get('/:profileId/health', (req, res) => profileController.healthCheck(req, res));

export default router;
