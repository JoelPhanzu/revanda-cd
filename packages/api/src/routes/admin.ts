import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();
router.use(authenticateJWT, requireRole('ADMIN'));

router.get('/dashboard', apiRateLimiter, adminController.getDashboardStats);
router.get('/vendors', apiRateLimiter, adminController.getAllVendors);
router.get('/vendors/:vendorId', apiRateLimiter, adminController.getVendorDetails);
router.get('/products/pending', apiRateLimiter, adminController.getPendingProducts);

export default router;
