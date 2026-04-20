import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateJWT } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();
router.use(apiRateLimiter);

router.post('/', authenticateJWT, requireFields('conversationId', 'receiverId', 'content'), messageController.send);
router.get('/:conversationId', authenticateJWT, messageController.history);

export default router;
