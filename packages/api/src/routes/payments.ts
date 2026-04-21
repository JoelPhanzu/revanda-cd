import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { paymentsLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/create-intent', paymentsLimiter, authenticateJWT, paymentController.createPaymentIntent);
router.get('/:paymentIntentId', paymentsLimiter, authenticateJWT, paymentController.getPayment);
router.get('/', paymentsLimiter, authenticateJWT, requireRole('VENDOR'), paymentController.listPayments);

export default router;
