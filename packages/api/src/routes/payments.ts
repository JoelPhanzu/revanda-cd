import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/create-intent', apiRateLimiter, authenticateJWT, paymentController.createPaymentIntent);
router.get('/:paymentIntentId', apiRateLimiter, authenticateJWT, paymentController.getPayment);
router.get('/', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), paymentController.listPayments);

export default router;
