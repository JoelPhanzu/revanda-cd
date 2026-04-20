import { Router } from 'express';
import { vendorController } from '../controllers/vendorController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();
router.use(apiRateLimiter);

router.get('/dashboard', authenticateJWT, requireRole('VENDOR', 'ADMIN'), vendorController.getDashboard);
router.get('/sales', authenticateJWT, requireRole('VENDOR', 'ADMIN'), vendorController.getSales);

export default router;
