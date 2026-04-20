import { NextFunction, Response } from 'express';
import { vendorService } from '../services/vendorService';
import { AuthRequest } from '../types';

export const vendorController = {
  getDashboard: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const stats = await vendorService.getDashboardStats(req.user.userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },
  getSales: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const sales = await vendorService.getSales(req.user.userId);
      res.status(200).json(sales);
    } catch (error) {
      next(error);
    }
  },
};
