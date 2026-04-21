import Stripe from 'stripe';
import { prisma } from '../config/prisma';

const getStripeClient = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(secretKey, {
    apiVersion: '2024-06-20',
  });
};

type OrderItemForPayment = {
  vendorId: string;
  quantity: number;
  unitPrice: number;
};

const computeVendorAmounts = (items: OrderItemForPayment[]): Map<string, number> => {
  const vendorAmounts = new Map<string, number>();

  for (const item of items) {
    const current = vendorAmounts.get(item.vendorId) ?? 0;
    const unitPrice = Number(item.unitPrice);
    vendorAmounts.set(item.vendorId, current + unitPrice * item.quantity);
  }

  return vendorAmounts;
};

export const stripeService = {
  createPaymentIntent: async (
    orderId: string,
    amount: number,
    customerId: string,
    currency = 'usd',
  ): Promise<{ clientSecret: string; paymentIntentId: string }> => {
    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        orderId,
        customerId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe did not return a client secret');
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      select: {
        vendorId: true,
        quantity: true,
        unitPrice: true,
      },
    });

    const vendorAmounts = computeVendorAmounts(
      orderItems.map((item: { vendorId: string; quantity: number; unitPrice: unknown }) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    );

    if (vendorAmounts.size === 0) {
      throw new Error('Order has no payable items');
    }

    await prisma.payment.createMany({
      data: Array.from(vendorAmounts.entries()).map(([vendorId, vendorAmount]) => ({
        orderId,
        vendorId,
        amount: vendorAmount,
        // Commission will be computed in a dedicated payout/settlement workflow.
        commissionAmount: 0,
        status: 'PENDING',
        providerRef: paymentIntent.id,
      })),
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },

  confirmPayment: async (paymentIntentId: string): Promise<boolean> => {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return false;
    }

    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      return false;
    }

    await Promise.all([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      }),
      prisma.payment.updateMany({
        where: { providerRef: paymentIntentId },
        data: { status: 'COMPLETED' },
      }),
    ]);

    return true;
  },

  getPaymentIntent: async (paymentIntentId: string) => {
    const stripe = getStripeClient();
    return stripe.paymentIntents.retrieve(paymentIntentId);
  },

  getChargesForVendor: async (vendorId: string) => {
    return prisma.payment.findMany({
      where: { vendorId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  verifyWebhookEvent: (payload: Buffer, signature: string): Stripe.Event => {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  },

  handleWebhookEvent: async (event: Stripe.Event): Promise<void> => {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await stripeService.confirmPayment(paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await Promise.all([
            prisma.order.update({
              where: { id: orderId },
              data: { status: 'CANCELLED' },
            }),
            prisma.payment.updateMany({
              where: { providerRef: paymentIntent.id },
              data: { status: 'FAILED' },
            }),
          ]);
        }
        break;
      }
      default:
        break;
    }
  },
};
