import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { requireFields } from '../middleware/validation';

const router = Router();

router.post('/', authenticateJWT, requireRole('CUSTOMER', 'ADMIN'), requireFields('productId', 'rating'), reviewController.create);
router.get('/product/:productId', reviewController.getByProduct);

export default router;
