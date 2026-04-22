import { NextFunction, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import { auditLogService } from '../services/auditLogService';
import { deletionRequestService } from '../services/deletionRequestService';
import { modificationRequestService } from '../services/modificationRequestService';

export const adminController = {
  getDashboardStats: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const [totalUsers, totalVendors, totalProducts, pendingProducts, totalOrders, revenueAggregate] = await Promise.all([
        prisma.user.count(),
        prisma.vendor.count(),
        prisma.product.count(),
        prisma.product.count({ where: { validationStatus: 'PENDING_APPROVAL' } }),
        prisma.order.count(),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'COMPLETED' },
        }),
      ]);

      res.status(200).json({
        totalUsers,
        totalVendors,
        totalProducts,
        pendingProducts,
        totalOrders,
        totalRevenue: Number(revenueAggregate._sum.amount || 0),
      });
    } catch (error) {
      next(error);
    }
  },

  getPendingProducts: async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await prisma.product.findMany({
        where: { validationStatus: 'PENDING_APPROVAL' },
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  email: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  approveProduct: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: 'Missing product id' });
        return;
      }

      const product = await prisma.product.update({
        where: { id },
        data: { validationStatus: 'APPROVED' },
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  email: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json({ message: 'Product approved', product });
    } catch (error) {
      next(error);
    }
  },

  rejectProduct: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
      if (!id) {
        res.status(400).json({ message: 'Missing product id' });
        return;
      }

      const product = await prisma.product.update({
        where: { id },
        data: { validationStatus: 'REJECTED' },
      });

      res.status(200).json({
        message: reason ? `Product rejected: ${reason}` : 'Product rejected',
        product,
      });
    } catch (error) {
      next(error);
    }
  },

  getAllVendors: async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vendors = await prisma.vendor.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(vendors);
    } catch (error) {
      next(error);
    }
  },

  getVendorDetails: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vendorId } = req.params;
      if (!vendorId) {
        res.status(400).json({ message: 'Missing vendor id' });
        return;
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          products: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!vendor) {
        res.status(404).json({ message: 'Vendor not found' });
        return;
      }

      const [revenueAggregate, distinctVendorOrders] = await Promise.all([
        prisma.payment.aggregate({
          _sum: { amount: true },
          _count: { _all: true },
          where: {
            vendorId,
            status: 'COMPLETED',
          },
        }),
        prisma.order.findMany({
          where: {
            items: {
              some: { vendorId },
            },
          },
          select: { id: true },
          distinct: ['id'],
        }),
      ]);

      res.status(200).json({
        ...vendor,
        totalSales: Number(revenueAggregate._sum.amount || 0),
        totalOrders: distinctVendorOrders.length,
        completedPayments: revenueAggregate._count._all,
      });
    } catch (error) {
      next(error);
    }
  },

  getPendingDeletionRequests: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const requests = await deletionRequestService.getPendingDeletionRequests(req.user.userId);
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  },

  approveDeletionRequest: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { requestId } = req.params;
      if (!requestId) {
        res.status(400).json({ message: 'Missing request id' });
        return;
      }

      const request = await deletionRequestService.approveDeletionRequest(requestId, req.user.userId);
      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  },

  rejectDeletionRequest: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { requestId } = req.params;
      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
      if (!requestId) {
        res.status(400).json({ message: 'Missing request id' });
        return;
      }

      if (!reason) {
        res.status(400).json({ message: 'Missing rejection reason' });
        return;
      }

      const request = await deletionRequestService.rejectDeletionRequest(requestId, req.user.userId, reason);
      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  },

  getPendingModificationRequests: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const requests = await modificationRequestService.getPendingModifications(req.user.userId);
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  },

  approveModificationRequest: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { requestId } = req.params;
      if (!requestId) {
        res.status(400).json({ message: 'Missing request id' });
        return;
      }

      const request = await modificationRequestService.approveModificationRequest(requestId, req.user.userId);
      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  },

  rejectModificationRequest: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { requestId } = req.params;
      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
      if (!requestId) {
        res.status(400).json({ message: 'Missing request id' });
        return;
      }

      if (!reason) {
        res.status(400).json({ message: 'Missing rejection reason' });
        return;
      }

      const request = await modificationRequestService.rejectModificationRequest(requestId, req.user.userId, reason);
      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  },

  getAuditLogs: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityType, entityId, performedBy, limit } = req.query as Record<string, string | undefined>;
      const take = Number(limit || 50);

      if (entityType && entityId) {
        const logs = await auditLogService.getEntityHistory(entityType, entityId, take);
        res.status(200).json(logs);
        return;
      }

      if (performedBy) {
        const logs = await auditLogService.getUserActions(performedBy, take);
        res.status(200).json(logs);
        return;
      }

      const logs = await auditLogService.exportAuditTrail({
        entityType,
        performedBy,
      });
      res.status(200).json(logs.slice(0, take));
    } catch (error) {
      next(error);
    }
  },

  exportAuditLogs: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { startDate, endDate, entityType, performedBy } = req.query as Record<string, string | undefined>;
      const logs = await auditLogService.exportAuditTrail({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        entityType,
        performedBy,
      });

      await auditLogService.log(
        'EXPORT',
        entityType || 'AuditLog',
        'bulk',
        req.user.userId,
        undefined,
        undefined,
        { startDate, endDate, performedBy, count: logs.length },
      );

      res.status(200).json({ count: logs.length, logs });
    } catch (error) {
      next(error);
    }
  },
};
