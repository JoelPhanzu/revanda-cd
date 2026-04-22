import { NextFunction, Response } from 'express';
import { kycService } from '../services/kycService';
import { AuthRequest } from '../types';

export const kycController = {
  submit: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const kyc = await kycService.submitKYC(req.user.userId, req.body);
      res.status(201).json(kyc);
    } catch (error) {
      next(error);
    }
  },

  uploadDocument: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const document = await kycService.uploadDocument(req.user.userId, req.body);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  },

  getStatus: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const kyc = await kycService.getVendorKYC(req.user.userId);
      if (!kyc) {
        res.status(200).json({ status: 'PENDING', kyc: null });
        return;
      }

      res.status(200).json({ status: kyc.status, kyc });
    } catch (error) {
      next(error);
    }
  },

  getByVendorId: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vendorId } = req.params;
      if (!vendorId) {
        res.status(400).json({ message: 'Missing vendor id' });
        return;
      }

      const kyc = await kycService.getKYCByVendorId(vendorId);
      if (!kyc) {
        res.status(404).json({ message: 'KYC profile not found' });
        return;
      }

      res.status(200).json(kyc);
    } catch (error) {
      next(error);
    }
  },

  approve: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { kycId } = req.params;
      if (!kycId) {
        res.status(400).json({ message: 'Missing kyc id' });
        return;
      }

      const kyc = await kycService.verifyKYC(kycId, 'APPROVED', req.user.userId);
      res.status(200).json({ message: 'KYC approved', kyc });
    } catch (error) {
      next(error);
    }
  },

  reject: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { kycId } = req.params;
      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
      if (!kycId) {
        res.status(400).json({ message: 'Missing kyc id' });
        return;
      }

      if (!reason) {
        res.status(400).json({ message: 'Missing rejection reason' });
        return;
      }

      const kyc = await kycService.verifyKYC(kycId, 'REJECTED', req.user.userId, reason);
      res.status(200).json({ message: 'KYC rejected', kyc });
    } catch (error) {
      next(error);
    }
  },

  listPending: async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const kycs = await kycService.getPendingKYCs();
      res.status(200).json(kycs);
    } catch (error) {
      next(error);
    }
  },
};
