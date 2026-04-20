import { Router } from 'express';
import { vendorController } from '../controllers/vendorController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateJWT, requireRole('VENDOR', 'ADMIN'), vendorController.getDashboard);
router.get('/sales', authenticateJWT, requireRole('VENDOR', 'ADMIN'), vendorController.getSales);

export default router;
