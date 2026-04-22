import { Router } from 'express';
import { kycController } from '../controllers/kycController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();
router.use(apiRateLimiter);

router.post('/submit', authenticateJWT, requireRole('VENDOR'), kycController.submit);
router.post(
  '/documents/upload',
  authenticateJWT,
  requireRole('VENDOR'),
  requireFields('type', 'fileUrl', 'fileName', 'fileSize', 'mimeType'),
  kycController.uploadDocument,
);
router.get('/status', authenticateJWT, requireRole('VENDOR'), kycController.getStatus);

router.get('/pending', authenticateJWT, requireRole('ADMIN'), kycController.listPending);
router.get('/:vendorId', authenticateJWT, requireRole('ADMIN'), kycController.getByVendorId);
router.patch('/:kycId/approve', authenticateJWT, requireRole('ADMIN'), kycController.approve);
router.patch('/:kycId/reject', authenticateJWT, requireRole('ADMIN'), requireFields('reason'), kycController.reject);

export default router;
