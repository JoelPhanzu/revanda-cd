import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';
import { requireFields } from '../middleware/validation';

const router = Router();

router.post('/register', apiRateLimiter, requireFields('email', 'password', 'fullName'), authController.register);
router.post('/register/vendor', apiRateLimiter, requireFields('email', 'password', 'fullName', 'companyName'), authController.registerVendor);
router.post('/register/customer', apiRateLimiter, requireFields('email', 'password', 'fullName'), authController.registerCustomer);
router.post('/login', apiRateLimiter, requireFields('email', 'password'), authController.login);
router.post('/logout', apiRateLimiter, authController.logout);
router.post('/refresh-token', apiRateLimiter, authenticateJWT, authController.refreshToken);
router.post('/refresh', apiRateLimiter, authenticateJWT, authController.refreshToken);
router.get('/me', apiRateLimiter, authenticateJWT, authController.getCurrentUser);

export default router;
