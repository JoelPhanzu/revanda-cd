import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticateJWT } from '../middleware/auth';
import { apiRateLimiter, ordersLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', ordersLimiter, authenticateJWT, orderController.create);
router.get('/:id', apiRateLimiter, authenticateJWT, orderController.getById);
router.get('/', apiRateLimiter, authenticateJWT, orderController.getMyOrders);
router.put('/:id/status', apiRateLimiter, authenticateJWT, orderController.updateStatus);

export default router;
