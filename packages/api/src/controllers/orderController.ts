import { NextFunction, Response } from 'express';
import { orderService } from '../services/orderService';
import { AuthRequest } from '../types';

const allowedStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export const orderController = {
  create: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const order = await orderService.create(req.user.userId, req.body.items || []);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const order = await orderService.getById(req.params.id);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      const canView = await orderService.canViewOrder(req.params.id, req.user.userId, req.user.role);
      if (!canView) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },
  getMyOrders: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const orders = await orderService.listByCustomer(req.user.userId);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  },
  updateStatus: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const canUpdate =
        req.user.role === 'ADMIN' ||
        req.user.role === 'SUPER_ADMIN' ||
        (req.user.role === 'VENDOR' && (await orderService.hasVendorInOrder(req.params.id, req.user.userId)));

      if (!canUpdate) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const status = req.body.status as (typeof allowedStatuses)[number];
      if (!allowedStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid order status' });
        return;
      }
      const updated = await orderService.updateStatus(req.params.id, status);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },
};
