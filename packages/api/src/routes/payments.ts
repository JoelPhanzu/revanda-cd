import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, requireRole('VENDOR', 'ADMIN'), paymentController.getMyPayments);
router.post('/webhook', paymentController.webhook);

export default router;
