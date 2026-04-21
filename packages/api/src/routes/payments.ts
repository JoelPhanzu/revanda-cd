import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { paymentsLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/create-intent', authenticateJWT, paymentsLimiter, paymentController.createPaymentIntent);
router.get('/:paymentIntentId', authenticateJWT, paymentsLimiter, paymentController.getPayment);
router.get('/', authenticateJWT, paymentsLimiter, requireRole('VENDOR'), paymentController.listPayments);

export default router;
