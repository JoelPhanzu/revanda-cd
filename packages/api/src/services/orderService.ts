import { OrderItemInput } from '../types';

type OrderRecord = {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItemInput[];
  totalAmount: number;
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
  updateStatus: (orderId: string, status: OrderRecord['status']): OrderRecord => {
    const index = orders.findIndex((order) => order.id === orderId);
    if (index < 0) {
      throw new Error('Order not found');
    }
    orders[index].status = status;
    return orders[index];
  },
};
