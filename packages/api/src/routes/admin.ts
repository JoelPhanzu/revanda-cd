import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireRole, requireSuperAdminOnly } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();
router.use(authenticateJWT, requireRole('ADMIN'));

router.get('/dashboard', apiRateLimiter, adminController.getDashboardStats);
router.get('/vendors', apiRateLimiter, adminController.getAllVendors);
router.get('/vendors/:vendorId', apiRateLimiter, adminController.getVendorDetails);
router.get('/products/pending', apiRateLimiter, adminController.getPendingProducts);
router.get('/deletion-requests/pending', apiRateLimiter, requireSuperAdminOnly, adminController.getPendingDeletionRequests);
router.post(
  '/deletion-requests/:requestId/approve',
  apiRateLimiter,
  requireSuperAdminOnly,
  adminController.approveDeletionRequest,
);
router.post(
  '/deletion-requests/:requestId/reject',
  apiRateLimiter,
  requireSuperAdminOnly,
  requireFields('reason'),
  adminController.rejectDeletionRequest,
);
router.get(
  '/modification-requests/pending',
  apiRateLimiter,
  requireSuperAdminOnly,
  adminController.getPendingModificationRequests,
);
router.post(
  '/modification-requests/:requestId/approve',
  apiRateLimiter,
  requireSuperAdminOnly,
  adminController.approveModificationRequest,
);
router.post(
  '/modification-requests/:requestId/reject',
  apiRateLimiter,
  requireSuperAdminOnly,
  requireFields('reason'),
  adminController.rejectModificationRequest,
);
router.get('/audit-logs', apiRateLimiter, requireRole('ADMIN', 'SUPER_ADMIN'), adminController.getAuditLogs);
router.get('/audit-logs/export', apiRateLimiter, requireSuperAdminOnly, adminController.exportAuditLogs);

export default router;
