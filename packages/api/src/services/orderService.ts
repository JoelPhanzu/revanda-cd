import { OrderItemInput } from '../types';

type OrderRecord = {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
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

const orders: OrderRecord[] = [];

export const orderService = {
  create: (customerId: string, items: OrderItemInput[]): OrderRecord => {
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const order: OrderRecord = {
      id: `ord_${Date.now()}`,
      customerId,
      status: 'PENDING',
      items,
      totalAmount,
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    return order;
  },
  getById: (id: string): OrderRecord | undefined => orders.find((order) => order.id === id),
  listByCustomer: (customerId: string): OrderRecord[] => orders.filter((order) => order.customerId === customerId),
  listByVendor: (vendorId: string): VendorOrderSummary[] =>
    orders
      .map((order) => {
        const amount = order.items
          .filter((item) => item.vendorId === vendorId)
          .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

        if (amount <= 0) {
          return null;
        }

        return {
          orderId: order.id,
          amount,
          status: order.status,
          createdAt: order.createdAt,
        };
      })
      .filter((entry): entry is VendorOrderSummary => entry !== null),
  hasVendorInOrder: (orderId: string, vendorId: string): boolean =>
    orders.some((order) => order.id === orderId && order.items.some((item) => item.vendorId === vendorId)),
  canViewOrder: (orderId: string, userId: string, role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'): boolean => {
    if (role === 'ADMIN') {
      return true;
    }

    const order = orders.find((entry) => entry.id === orderId);
    if (!order) {
      return false;
    }

    if (role === 'CUSTOMER') {
      return order.customerId === userId;
    }

    return order.items.some((item) => item.vendorId === userId);
  },
  updateStatus: (orderId: string, status: OrderRecord['status']): OrderRecord => {
    const index = orders.findIndex((order) => order.id === orderId);
    if (index < 0) {
      throw new Error('Order not found');
    }
    orders[index].status = status;
    return orders[index];
  },
};
