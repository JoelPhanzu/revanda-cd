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

    const userId = req.user.userId;
    const result = payments.filter((payment) => payment.vendorId === userId);
    res.status(200).json(result);
  },
  webhook: (req: Request, res: Response): void => {
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const signature = req.header('x-webhook-secret');

    if (!webhookSecret) {
      res.status(503).json({ message: 'Webhook secret is not configured' });
      return;
    }

    if (signature !== webhookSecret) {
      res.status(401).json({ message: 'Invalid webhook signature' });
      return;
    }

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
