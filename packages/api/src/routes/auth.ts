import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();
router.use(apiRateLimiter);

router.post('/register/vendor', requireFields('email', 'password', 'fullName', 'companyName'), authController.registerVendor);
router.post('/register/customer', requireFields('email', 'password', 'fullName'), authController.registerCustomer);
router.post('/login', requireFields('email', 'password'), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authenticateJWT, authController.refreshToken);

export default router;
