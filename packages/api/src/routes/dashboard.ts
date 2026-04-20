import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';

const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get('/vendor', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const vendorId = req.authUser?.vendorId ?? 'unknown';

  res.json({
    vendorId,
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    currency: 'USD',
    generatedAt: new Date().toISOString(),
  });
});

dashboardRouter.get('/vendor/analytics', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const vendorId = req.authUser?.vendorId ?? 'unknown';

  res.json({
    vendorId,
    revenueTrend: [],
    topProducts: [],
    orderStatusBreakdown: [],
    generatedAt: new Date().toISOString(),
  });
});

export default dashboardRouter;
