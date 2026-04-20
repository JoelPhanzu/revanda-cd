import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../types';

export const authController = {
  registerVendor: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.registerVendor(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  registerCustomer: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.registerCustomer(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  logout: (_req: Request, res: Response): void => {
    res.status(200).json({ message: 'Logged out successfully' });
  },
  refreshToken: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const token = authService.refreshToken(req.user.userId, req.user.role);
    res.status(200).json({ token });
  },
};
