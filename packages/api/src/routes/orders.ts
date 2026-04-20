import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, orderController.create);
router.get('/:id', authenticateJWT, orderController.getById);
router.get('/', authenticateJWT, orderController.getMyOrders);
router.put('/:id/status', authenticateJWT, orderController.updateStatus);

export default router;
