import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();
router.use(apiRateLimiter);

router.post('/', authenticateJWT, requireRole('CUSTOMER', 'ADMIN'), requireFields('productId', 'rating'), reviewController.create);
router.get('/product/:productId', reviewController.getByProduct);

export default router;
