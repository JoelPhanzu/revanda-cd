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

      res.status(200).json(await vendorService.getDashboardStats(req.user.userId));
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

      res.status(200).json(await vendorService.getSales(req.user.userId));
    } catch (error) {
      next(error);
    }
  },
};
