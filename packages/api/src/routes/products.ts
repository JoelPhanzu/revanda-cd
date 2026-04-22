import { Router } from 'express';
import { productController } from '../controllers/productController';
import { adminController } from '../controllers/adminController';
import { auditLog, authenticateJWT, canDeleteResource, requireRole } from '../middleware/auth';
import { apiRateLimiter, browseLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();

router.post('/', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), productController.create);
router.put('/:id', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), productController.update);
router.get('/my-products', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), productController.getMyProducts);
router.post(
  '/:id/request-deletion',
  apiRateLimiter,
  authenticateJWT,
  requireRole('VENDOR', 'ADMIN'),
  auditLog('REQUEST_DELETION'),
  requireFields('reason'),
  productController.requestDeletion,
);
router.post(
  '/:id/request-modification',
  apiRateLimiter,
  authenticateJWT,
  requireRole('VENDOR', 'ADMIN'),
  auditLog('REQUEST_MODIFICATION'),
  requireFields('fieldName'),
  productController.requestModification,
);
router.delete('/:id', apiRateLimiter, authenticateJWT, canDeleteResource('products'), auditLog('HARD_DELETE'), productController.hardDelete);
router.put('/:id/approve', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), adminController.approveProduct);
router.put('/:id/reject', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), adminController.rejectProduct);
router.get('/search', browseLimiter, productController.search);
router.get('/:id', browseLimiter, productController.getById);
router.get('/', browseLimiter, productController.list);

export default router;
