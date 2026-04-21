import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { apiRateLimiter, authLoginLimiter, authRegisterLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();
router.use(apiRateLimiter);

router.post('/register/vendor', authRegisterLimiter, requireFields('email', 'password', 'fullName', 'companyName'), authController.registerVendor);
router.post('/register/customer', authRegisterLimiter, requireFields('email', 'password', 'fullName'), authController.registerCustomer);
router.post('/register', authRegisterLimiter, requireFields('email', 'password'), authController.register);
router.post('/login', authLoginLimiter, requireFields('email', 'password'), authController.login);
router.post('/logout', authenticateJWT, authController.logout);
router.post('/refresh-token', authenticateJWT, authController.refreshToken);
router.post('/refresh', authenticateJWT, authController.refreshToken);
router.get('/me', apiRateLimiter, authenticateJWT, authController.getCurrentUser);

export default router;
