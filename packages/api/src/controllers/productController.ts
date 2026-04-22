import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { productService } from '../services/productService';
import { auditLogService } from '../services/auditLogService';
import { deletionRequestService } from '../services/deletionRequestService';
import { modificationRequestService } from '../services/modificationRequestService';
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
  requestDeletion: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
      if (!reason) {
        res.status(400).json({ message: 'Missing required fields: reason' });
        return;
      }

      const request = await deletionRequestService.submitDeletionRequest('Product', req.params.id, req.user.userId, reason);
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  },
  requestModification: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { fieldName, newValue } = req.body as { fieldName?: string; newValue?: string };
      if (!fieldName || newValue === undefined) {
        res.status(400).json({ message: 'Missing required fields: fieldName, newValue' });
        return;
      }

      const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!existingProduct) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      if (!(fieldName in existingProduct)) {
        res.status(400).json({ message: `Field ${fieldName} does not exist on Product` });
        return;
      }

      const currentValue = existingProduct[fieldName as keyof typeof existingProduct];
      const request = await modificationRequestService.submitModificationRequest(
        'Product',
        req.params.id,
        fieldName,
        JSON.stringify(currentValue ?? null),
        String(newValue),
        req.user.userId,
      );

      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  },
  hardDelete: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!existingProduct) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      await prisma.product.delete({ where: { id: req.params.id } });
      await auditLogService.log('HARD_DELETE', 'Product', req.params.id, req.user.userId, existingProduct as Record<string, unknown>);

      res.status(200).json({ message: 'Product permanently deleted' });
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
