import { Response } from 'express';
import { vendorService } from '../services/vendorService';
import { AuthRequest } from '../types';

export const vendorController = {
  getDashboard: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json(vendorService.getDashboardStats(req.user.userId));
  },
  getSales: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json(vendorService.getSales(req.user.userId));
  },
};
