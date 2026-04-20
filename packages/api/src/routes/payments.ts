import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';

type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';

interface PaymentRecord {
  id: string;
  orderId: string;
  vendorId: string;
  amount: number;
  status: PaymentStatus;
  method: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CARD';
}

const paymentsRouter = Router();
const payments: PaymentRecord[] = [];

paymentsRouter.use(authMiddleware);

paymentsRouter.post('/', requireRole(['USER', 'ADMIN']), (req, res) => {
  const { orderId, vendorId, amount, method = 'BANK_TRANSFER' } = req.body as {
    orderId?: string;
    vendorId?: string;
    amount?: number;
    method?: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CARD';
  };

  if (!orderId || !vendorId || typeof amount !== 'number') {
    res.status(400).json({ message: 'orderId, vendorId and amount are required' });
    return;
  }

  const payment: PaymentRecord = {
    id: `pay_${payments.length + 1}`,
    orderId,
    vendorId,
    amount,
    status: 'PENDING',
    method,
  };

  payments.push(payment);
  res.status(201).json(payment);
});

paymentsRouter.get('/vendor/:vendorId', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const { vendorId } = req.params;
  if (req.authUser?.role === 'VENDOR' && req.authUser.vendorId !== vendorId) {
    res.status(403).json({ message: 'cannot list another vendor payments' });
    return;
  }

  res.json(payments.filter((payment) => payment.vendorId === vendorId));
});

paymentsRouter.get('/:id', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const payment = payments.find((item) => item.id === req.params.id);
  if (!payment) {
    res.status(404).json({ message: 'payment not found' });
    return;
  }

  const isAdmin = req.authUser?.role === 'ADMIN';
  const isVendorOwner = req.authUser?.vendorId === payment.vendorId;
  if (!isAdmin && !isVendorOwner) {
    res.status(403).json({ message: 'access denied to this payment' });
    return;
  }

  res.json(payment);
});

paymentsRouter.patch('/:id', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const payment = payments.find((item) => item.id === req.params.id);
  if (!payment) {
    res.status(404).json({ message: 'payment not found' });
    return;
  }

  const { status } = req.body as { status?: PaymentStatus };
  if (!status) {
    res.status(400).json({ message: 'status is required' });
    return;
  }

  payment.status = status;
  res.json(payment);
});

export default paymentsRouter;
