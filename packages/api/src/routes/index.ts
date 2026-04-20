import { Router } from 'express';
import authRouter from './auth';
import productsRouter from './products';
import ordersRouter from './orders';
import paymentsRouter from './payments';
import messagesRouter from './messages';
import dashboardRouter from './dashboard';
import reviewsRouter from './reviews';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/payments', paymentsRouter);
router.use('/messages', messagesRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reviews', reviewsRouter);

export default router;
