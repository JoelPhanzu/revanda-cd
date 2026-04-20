import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';

interface OrderItemInput {
  vendorId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface OrderRecord {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemInput[];
  totalAmount: number;
}

const ordersRouter = Router();
const orders: OrderRecord[] = [];

ordersRouter.use(authMiddleware);

ordersRouter.post('/', requireRole(['USER', 'ADMIN']), (req, res) => {
  const { items } = req.body as { items?: OrderItemInput[] };

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'items are required' });
    return;
  }

  const totalCents = items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice * 100), 0);
  const totalAmount = totalCents / 100;

  const order: OrderRecord = {
    id: `ord_${orders.length + 1}`,
    userId: req.authUser?.id ?? 'unknown',
    status: 'PENDING',
    items,
    totalAmount,
  };

  orders.push(order);
  res.status(201).json(order);
});

ordersRouter.get('/', (req, res) => {
  if (req.authUser?.role === 'ADMIN') {
    res.json(orders);
    return;
  }

  const ownOrders = orders.filter((order) => order.userId === req.authUser?.id);
  res.json(ownOrders);
});

ordersRouter.get('/vendor/:vendorId', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const { vendorId } = req.params;
  if (req.authUser?.role === 'VENDOR' && req.authUser.vendorId !== vendorId) {
    res.status(403).json({ message: "Cannot list another vendor's orders" });
    return;
  }

  const vendorOrders = orders.filter((order) => order.items.some((item) => item.vendorId === vendorId));
  res.json(vendorOrders);
});

ordersRouter.get('/:id', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    res.status(404).json({ message: 'order not found' });
    return;
  }

  const isOwner = order.userId === req.authUser?.id;
  const isAdmin = req.authUser?.role === 'ADMIN';
  const vendorId = req.authUser?.vendorId;
  const isVendorParticipant = req.authUser?.role === 'VENDOR' && order.items.some((item) => item.vendorId === vendorId);

  if (!isOwner && !isAdmin && !isVendorParticipant) {
    res.status(403).json({ message: 'access denied to this order' });
    return;
  }

  res.json(order);
});

ordersRouter.patch('/:id', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    res.status(404).json({ message: 'order not found' });
    return;
  }

  if (req.authUser?.role === 'VENDOR') {
    const vendorId = req.authUser.vendorId;
    const isVendorParticipant = order.items.some((item) => item.vendorId === vendorId);
    if (!isVendorParticipant) {
      res.status(403).json({ message: 'access denied to this order' });
      return;
    }
  }

  const { status } = req.body as { status?: OrderStatus };
  if (!status) {
    res.status(400).json({ message: 'status is required' });
    return;
  }

  order.status = status;
  res.json(order);
});

export default ordersRouter;
