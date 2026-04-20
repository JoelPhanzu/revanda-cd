import { NextFunction, Response } from 'express';
import { orderService } from '../services/orderService';
import { AuthRequest } from '../types';

const allowedStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export const orderController = {
  create: (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const order = orderService.create(req.user.userId, req.body.items || []);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },
  getById: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const order = orderService.getById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const canView = orderService.canViewOrder(req.params.id, req.user.userId, req.user.role);
    if (!canView) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.status(200).json(order);
  },
  getMyOrders: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json(orderService.listByCustomer(req.user.userId));
  },
  updateStatus: (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const canUpdate =
        req.user.role === 'ADMIN' ||
        (req.user.role === 'VENDOR' && orderService.hasVendorInOrder(req.params.id, req.user.userId));

      if (!canUpdate) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const status = req.body.status;
      if (!allowedStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid order status' });
        return;
      }
      const updated = orderService.updateStatus(req.params.id, status);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },
};
