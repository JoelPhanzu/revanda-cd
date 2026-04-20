import { Request, Response } from 'express';
import { AuthRequest } from '../types';

type PaymentRecord = {
  id: string;
  vendorId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
};

const payments: PaymentRecord[] = [];

export const paymentController = {
  getMyPayments: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = payments.filter((payment) => payment.vendorId === req.user?.userId);
    res.status(200).json(result);
  },
  webhook: (req: Request, res: Response): void => {
    const payload = req.body;
    if (payload?.paymentId) {
      const payment = payments.find((item) => item.id === payload.paymentId);
      if (payment) {
        payment.status = payload.status || payment.status;
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  },
};
