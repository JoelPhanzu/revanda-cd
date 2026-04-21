import { Router } from 'express';
import { productController } from '../controllers/productController';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimiter);

router.post('/', authenticateJWT, requireRole('VENDOR'), productController.create);
router.put('/:id', authenticateJWT, requireRole('VENDOR'), productController.update);
router.get('/my-products', authenticateJWT, requireRole('VENDOR'), productController.getMyProducts);
router.delete('/:id', authenticateJWT, requireRole('VENDOR'), productController.remove);
router.put('/:id/approve', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), adminController.approveProduct);
router.put('/:id/reject', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), adminController.rejectProduct);
router.get('/search', productController.search);
router.get('/:id', productController.getById);
router.get('/', productController.list);

export default router;
