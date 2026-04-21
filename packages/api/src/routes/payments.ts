import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimiter);

router.post('/create-intent', authenticateJWT, paymentController.createPaymentIntent);
router.get('/:paymentIntentId', authenticateJWT, paymentController.getPayment);
router.get('/', authenticateJWT, requireRole('VENDOR'), paymentController.listPayments);

export default router;
