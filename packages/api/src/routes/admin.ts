import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimiter);
router.use(authenticateJWT, requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/vendors', adminController.getAllVendors);
router.get('/vendors/:vendorId', adminController.getVendorDetails);
router.get('/products/pending', adminController.getPendingProducts);

export default router;
