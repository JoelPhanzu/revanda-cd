import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../types';
import { prisma } from '../config/prisma';

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
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role, companyName } = req.body;
      const fullName = req.body.fullName || req.body.name;

      if (!fullName) {
        res.status(400).json({ message: 'Missing required fields: fullName' });
        return;
      }

      if (role === 'VENDOR') {
        if (!companyName) {
          res.status(400).json({ message: 'Missing required fields: companyName' });
          return;
        }

        const result = await authService.registerVendor({ email, password, fullName, companyName });
        res.status(201).json(result);
        return;
      }

      const result = await authService.registerCustomer({ email, password, fullName });
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
  getCurrentUser: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { vendorProfile: true },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const { passwordHash: _passwordHash, vendorProfile, ...safeUser } = user;
      res.status(200).json({
        ...safeUser,
        name: safeUser.fullName,
        companyName: vendorProfile?.companyName,
      });
    } catch (error) {
      next(error);
    }
  },
};
