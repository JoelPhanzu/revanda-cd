import { OrderItemInput } from '../types';
import { prisma } from '../config/prisma';

type OrderRecord = {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  items: OrderItemInput[];
  totalAmount: number;
  createdAt: string;
};

type VendorOrderSummary = {
  orderId: string;
  amount: number;
  status: OrderRecord['status'];
  createdAt: string;
};

type DecimalLike = number | string | { toNumber: () => number };

const toNumber = (value: DecimalLike): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return Number(value);
  }
  return value.toNumber();
};

const getVendorProfileId = async (userId: string): Promise<string> => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!vendor) {
    throw new Error('Vendor profile not found');
  }

  return vendor.id;
};

const toOrderRecord = (order: {
  id: string;
  customerId: string;
  status: string;
  totalAmount: DecimalLike;
  createdAt: Date;
  items: Array<{
    productId: string;
    vendorId: string;
    quantity: number;
    unitPrice: DecimalLike;
  }>;
}): OrderRecord => ({
  id: order.id,
  customerId: order.customerId,
  status: order.status as OrderRecord['status'],
  totalAmount: toNumber(order.totalAmount),
  createdAt: order.createdAt.toISOString(),
  items: order.items.map((item) => ({
    productId: item.productId,
    vendorId: item.vendorId,
    quantity: item.quantity,
    unitPrice: toNumber(item.unitPrice),
  })),
});

export const orderService = {
  create: async (customerId: string, items: OrderItemInput[]): Promise<OrderRecord> => {
    const preparedItems = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, vendorId: true, price: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const unitPrice = item.unitPrice > 0 ? item.unitPrice : toNumber(product.price);
        return {
          productId: product.id,
          vendorId: product.vendorId,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      }),
    );

    const totalAmount = preparedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await prisma.order.create({
      data: {
        customerId,
        status: 'PENDING',
        totalAmount,
        items: {
          create: preparedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return toOrderRecord(order);
  },
  getById: async (id: string): Promise<OrderRecord | undefined> => {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
    return order ? toOrderRecord(order) : undefined;
  },
  listByCustomer: async (customerId: string): Promise<OrderRecord[]> => {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toOrderRecord);
  },
  listByVendor: async (vendorUserId: string): Promise<VendorOrderSummary[]> => {
    const vendorId = await getVendorProfileId(vendorUserId);
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { vendorId },
        },
      },
      include: {
        items: {
          where: { vendorId },
          select: {
            subtotal: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders
      .map((order: any) => {
        const amount = order.items.reduce((sum: number, item: any) => sum + toNumber(item.subtotal), 0);
        if (amount <= 0) {
          return null;
        }
        return {
          orderId: order.id,
          amount,
          status: order.status as VendorOrderSummary['status'],
          createdAt: order.createdAt.toISOString(),
        };
      })
      .filter((entry: VendorOrderSummary | null): entry is VendorOrderSummary => entry !== null);
  },
  hasVendorInOrder: async (orderId: string, vendorUserId: string): Promise<boolean> => {
    const vendorId = await getVendorProfileId(vendorUserId);
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            vendorId,
          },
        },
      },
      select: { id: true },
    });
    return Boolean(order);
  },
  canViewOrder: async (orderId: string, userId: string, role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'): Promise<boolean> => {
    if (role === 'ADMIN') {
      return true;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        customerId: true,
        items: {
          select: { vendorId: true },
        },
      },
    });

    if (!order) {
      return false;
    }

    if (role === 'CUSTOMER') {
      return order.customerId === userId;
    }

    const vendorId = await getVendorProfileId(userId);
    return order.items.some((item: { vendorId: string }) => item.vendorId === vendorId);
  },
  updateStatus: async (orderId: string, status: OrderRecord['status']): Promise<OrderRecord> => {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
      },
    });
    return toOrderRecord(updated);
  },
};
