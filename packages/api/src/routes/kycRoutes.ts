import { Router } from 'express';
import { kycController } from '../controllers/kycController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();

router.post('/submit', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), kycController.submit);
router.post(
  '/documents/upload',
  apiRateLimiter,
  authenticateJWT,
  requireRole('VENDOR'),
  requireFields('type', 'fileUrl', 'fileName', 'fileSize', 'mimeType'),
  kycController.uploadDocument,
);
router.get('/status', apiRateLimiter, authenticateJWT, requireRole('VENDOR'), kycController.getStatus);

router.get('/pending', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), kycController.listPending);
router.get('/:vendorId', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), kycController.getByVendorId);
router.patch('/:kycId/approve', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), kycController.approve);
router.patch('/:kycId/reject', apiRateLimiter, authenticateJWT, requireRole('ADMIN'), requireFields('reason'), kycController.reject);

export default router;
