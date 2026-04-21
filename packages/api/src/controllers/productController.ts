import { NextFunction, Request, Response } from 'express';
import { productService } from '../services/productService';
import { AuthRequest, ProductFilters } from '../types';

export const productController = {
  create: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const product = await productService.create(req.user.userId, req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },
  update: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const product = await productService.update(req.user.userId, req.params.id, req.body);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await productService.delete(req.user.userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  getMyProducts: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const products = await productService.getMyProducts(req.user.userId);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ProductFilters = {
        vendorId: req.query.vendorId as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        sortBy: req.query.sortBy as ProductFilters['sortBy'],
        query: req.query.query as string | undefined,
      };

      const products = await productService.list(filters);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await productService.getById(req.params.id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },
  search: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req.query.q as string) || '';
      const results = await productService.search(query);
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  },
};
