import { Router } from 'express';
import { productController } from '../controllers/productController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, requireRole('VENDOR'), productController.create);
router.put('/:id', authenticateJWT, requireRole('VENDOR'), productController.update);
router.get('/my-products', authenticateJWT, requireRole('VENDOR'), productController.getMyProducts);
router.delete('/:id', authenticateJWT, requireRole('VENDOR'), productController.remove);
router.get('/search', productController.search);
router.get('/:id', productController.getById);
router.get('/', productController.list);

export default router;
