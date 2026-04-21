import { NextFunction, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';

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
      if (!id) {
        res.status(400).json({ message: 'Missing product id' });
        return;
      }

      const product = await prisma.product.update({
        where: { id },
        data: { validationStatus: 'REJECTED' },
      });

      res.status(200).json({ message: 'Product rejected', product });
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
};
