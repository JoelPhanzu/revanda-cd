import { prisma } from '../config/prisma';
import { OrderItemInput, Role } from '../types';

type VendorOrderSummary = {
  orderId: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  createdAt: Date;
};

const resolveVendorId = async (vendorIdentifier: string): Promise<string> => {
  const byUserId = await prisma.vendor.findUnique({ where: { userId: vendorIdentifier } });
  if (byUserId) {
    return byUserId.id;
  }

  const byId = await prisma.vendor.findUnique({ where: { id: vendorIdentifier } });
  if (byId) {
    return byId.id;
  }

  throw new Error('Vendor not found');
};

export const orderService = {
  create: async (customerId: string, items: OrderItemInput[]) => {
    const preparedItems = await Promise.all(
      items.map(async (item) => {
        const vendorId = await resolveVendorId(item.vendorId);
        return {
          productId: item.productId,
          vendorId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        };
      }),
    );

    const totalAmount = preparedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return prisma.order.create({
      data: {
        customerId,
        totalAmount,
        items: {
          create: preparedItems,
        },
      },
      include: {
        items: true,
      },
    });
  },
  getById: async (id: string) => {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            vendor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  },
  listByCustomer: async (customerId: string) =>
    prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
  listByVendor: async (vendorIdentifier: string): Promise<VendorOrderSummary[]> => {
    const vendorId = await resolveVendorId(vendorIdentifier);

    const vendorOrderItems = await prisma.orderItem.findMany({
      where: { vendorId },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const orderMap = new Map<string, VendorOrderSummary>();

    for (const item of vendorOrderItems) {
      const existing = orderMap.get(item.orderId);
      const lineAmount = Number(item.unitPrice) * item.quantity;

      if (!existing) {
        orderMap.set(item.orderId, {
          orderId: item.orderId,
          amount: lineAmount,
          status: item.order.status,
          createdAt: item.order.createdAt,
        });
      } else {
        existing.amount += lineAmount;
      }
    }

    return Array.from(orderMap.values());
  },
  hasVendorInOrder: async (orderId: string, vendorIdentifier: string): Promise<boolean> => {
    const vendorId = await resolveVendorId(vendorIdentifier);

    const count = await prisma.orderItem.count({
      where: {
        orderId,
        vendorId,
      },
    });

    return count > 0;
  },
  canViewOrder: async (orderId: string, userId: string, role: Role): Promise<boolean> => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return true;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return false;
    }

    if (role === 'CUSTOMER') {
      return order.customerId === userId;
    }

    if (role === 'VENDOR') {
      return orderService.hasVendorInOrder(orderId, userId);
    }

    return false;
  },
  updateStatus: async (orderId: string, status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  },
};
