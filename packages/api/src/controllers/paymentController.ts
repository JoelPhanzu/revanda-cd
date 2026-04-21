import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { stripeService } from '../services/stripeService';
import { AuthRequest } from '../types';

export const paymentController = {
  createPaymentIntent: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { orderId } = req.body as { orderId?: string };
      if (!orderId) {
        res.status(400).json({ message: 'Missing orderId' });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      if (order.customerId !== req.user.userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
        orderId,
        Number(order.totalAmount),
        req.user.userId,
        (order.currency?.trim() || 'USD').toLowerCase(),
      );

      res.status(200).json({ clientSecret, paymentIntentId });
    } catch (error) {
      next(error);
    }
  },

  handleWebhook: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'];
      if (!signature || typeof signature !== 'string') {
        res.status(400).json({ message: 'Missing stripe-signature header' });
        return;
      }

      const payload = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

      const event = stripeService.verifyWebhookEvent(payload, signature);
      await stripeService.handleWebhookEvent(event);

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  },

  getPayment: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { paymentIntentId } = req.params;
      if (!paymentIntentId) {
        res.status(400).json({ message: 'Missing paymentIntentId' });
        return;
      }

      const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

      const relatedPayment = await prisma.payment.findFirst({
        where: { providerRef: paymentIntentId },
        include: {
          order: {
            select: {
              customerId: true,
            },
          },
        },
      });

      if (!relatedPayment) {
        res.status(404).json({ message: 'Payment not found' });
        return;
      }

      const isOwner = relatedPayment.order.customerId === req.user.userId;
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
      const isVendor = vendor?.id === relatedPayment.vendorId;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwner && !isVendor && !isAdmin) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      res.status(200).json(paymentIntent);
    } catch (error) {
      next(error);
    }
  },

  listPayments: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
      if (!vendor) {
        res.status(403).json({ message: 'Vendor not found' });
        return;
      }

      const payments = await stripeService.getChargesForVendor(vendor.id);
      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  },
};
