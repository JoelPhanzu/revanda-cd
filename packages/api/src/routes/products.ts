import { Router } from 'express';
import { productController } from '../controllers/productController';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter, browseLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), productController.create);
router.put('/:id', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), productController.update);
router.get('/my-products', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), productController.getMyProducts);
router.delete('/:id', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), productController.remove);
router.put('/:id/approve', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), adminController.approveProduct);
router.put('/:id/reject', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), adminController.rejectProduct);
router.get('/search', browseLimiter, productController.search);
router.get('/:id', browseLimiter, productController.getById);
router.get('/', browseLimiter, productController.list);

export default router;
