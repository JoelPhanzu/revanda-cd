import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';

interface ReviewRecord {
  id: string;
  userId: string;
  productId?: string;
  vendorId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const reviewsRouter = Router();
const reviews: ReviewRecord[] = [];

reviewsRouter.use(authMiddleware);

reviewsRouter.post('/', requireRole(['USER', 'ADMIN']), (req, res) => {
  const { productId, vendorId, rating, comment } = req.body as {
    productId?: string;
    vendorId?: string;
    rating?: number;
    comment?: string;
  };

  const hasProduct = Boolean(productId);
  const hasVendor = Boolean(vendorId);

  if (typeof rating !== 'number') {
    res.status(400).json({ message: 'rating is required' });
    return;
  }

  if (hasProduct === hasVendor) {
    res.status(400).json({ message: 'exactly one of productId or vendorId is required' });
    return;
  }

  const review: ReviewRecord = {
    id: `rev_${reviews.length + 1}`,
    userId: req.authUser?.id ?? 'unknown',
    productId,
    vendorId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  reviews.push(review);
  res.status(201).json(review);
});

reviewsRouter.get('/product/:productId', (req, res) => {
  const { productId } = req.params;
  res.json(reviews.filter((review) => review.productId === productId));
});

reviewsRouter.get('/vendor/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  res.json(reviews.filter((review) => review.vendorId === vendorId));
});

export default reviewsRouter;
