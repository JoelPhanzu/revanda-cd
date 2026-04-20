import { NextFunction, Request, Response } from 'express';
import { productService } from '../services/productService';
import { AuthRequest, ProductFilters } from '../types';

export const productController = {
  create: (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const product = productService.create(req.user.userId, req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },
  update: (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const product = productService.update(req.user.userId, req.params.id, req.body);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },
  remove: (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      productService.delete(req.user.userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  getMyProducts: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const products = productService.getMyProducts(req.user.userId);
    res.status(200).json(products);
  },
  list: (req: Request, res: Response): void => {
    const filters: ProductFilters = {
      vendorId: req.query.vendorId as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      sortBy: req.query.sortBy as ProductFilters['sortBy'],
      query: req.query.query as string | undefined,
    };

    res.status(200).json(productService.list(filters));
  },
  getById: (req: Request, res: Response): void => {
    const product = productService.getById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  },
  search: (req: Request, res: Response): void => {
    const query = (req.query.q as string) || '';
    res.status(200).json(productService.search(query));
  },
};
