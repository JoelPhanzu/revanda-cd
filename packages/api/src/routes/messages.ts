import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateJWT } from '../middleware/auth';
import { requireFields } from '../middleware/validation';

const router = Router();

router.post('/', authenticateJWT, requireFields('conversationId', 'receiverId', 'content'), messageController.send);
router.get('/:conversationId', authenticateJWT, messageController.history);

export default router;
