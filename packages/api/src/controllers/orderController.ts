import { NextFunction, Response } from 'express';
import { orderService } from '../services/orderService';
import { AuthRequest } from '../types';

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
    const order = orderService.getById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (req.user && order.customerId !== req.user.userId && req.user.role !== 'ADMIN') {
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
      const status = req.body.status;
      const updated = orderService.updateStatus(req.params.id, status);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },
};
