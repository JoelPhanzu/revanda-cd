import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticateJWT } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimiter);

router.post('/', authenticateJWT, orderController.create);
router.get('/:id', authenticateJWT, orderController.getById);
router.get('/', authenticateJWT, orderController.getMyOrders);
router.put('/:id/status', authenticateJWT, orderController.updateStatus);

export default router;
