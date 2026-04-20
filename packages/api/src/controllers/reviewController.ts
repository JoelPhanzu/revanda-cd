import { Request, Response } from 'express';
import { AuthRequest } from '../types';

type ReviewRecord = {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

const reviews: ReviewRecord[] = [];

export const reviewController = {
  create: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const review: ReviewRecord = {
      id: `rev_${Date.now()}`,
      productId: req.body.productId,
      customerId: req.user.userId,
      rating: Number(req.body.rating),
      comment: req.body.comment,
      createdAt: new Date().toISOString(),
    };

    reviews.push(review);
    res.status(201).json(review);
  },
  getByProduct: (req: Request, res: Response): void => {
    res.status(200).json(reviews.filter((review) => review.productId === req.params.productId));
  },
};
