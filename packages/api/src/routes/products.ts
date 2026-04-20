import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';

interface ProductRecord {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
}

const productsRouter = Router();
const products: ProductRecord[] = [];

productsRouter.use(authMiddleware);

productsRouter.post('/', requireRole(['VENDOR']), (req, res) => {
  const { categoryId, name, description, basePrice, currency = 'USD' } = req.body as {
    categoryId?: string;
    name?: string;
    description?: string;
    basePrice?: number;
    currency?: string;
  };

  if (!name || !categoryId || typeof basePrice !== 'number') {
    res.status(400).json({ message: 'name, categoryId and basePrice are required' });
    return;
  }

  const vendorId = req.authUser?.vendorId ?? req.authUser?.id;
  if (!vendorId) {
    res.status(400).json({ message: 'vendor context missing' });
    return;
  }

  const product: ProductRecord = {
    id: `prd_${products.length + 1}`,
    vendorId,
    categoryId,
    name,
    description,
    basePrice,
    currency,
    isActive: true,
  };

  products.push(product);
  res.status(201).json(product);
});

productsRouter.get('/', (req, res) => {
  const { vendorId, categoryId, minPrice, maxPrice, search } = req.query as {
    vendorId?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };

  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;
  const searchTerm = search?.toLowerCase();

  const filtered = products.filter((product) => {
    if (vendorId && product.vendorId !== vendorId) return false;
    if (categoryId && product.categoryId !== categoryId) return false;
    if (typeof min === 'number' && !Number.isNaN(min) && product.basePrice < min) return false;
    if (typeof max === 'number' && !Number.isNaN(max) && product.basePrice > max) return false;
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  res.json(filtered);
});

productsRouter.get('/vendor/:vendorId', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const { vendorId } = req.params;
  res.json(products.filter((product) => product.vendorId === vendorId));
});

productsRouter.get('/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    res.status(404).json({ message: 'product not found' });
    return;
  }

  res.json(product);
});

productsRouter.patch('/:id', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    res.status(404).json({ message: 'product not found' });
    return;
  }

  if (req.authUser?.role === 'VENDOR' && req.authUser.vendorId !== product.vendorId) {
    res.status(403).json({ message: 'cannot modify another vendor product' });
    return;
  }

  const { name, description, basePrice, isActive } = req.body as {
    name?: string;
    description?: string;
    basePrice?: number;
    isActive?: boolean;
  };

  if (typeof name === 'string') product.name = name;
  if (typeof description === 'string') product.description = description;
  if (typeof basePrice === 'number') product.basePrice = basePrice;
  if (typeof isActive === 'boolean') product.isActive = isActive;

  res.json(product);
});

productsRouter.delete('/:id', requireRole(['VENDOR', 'ADMIN']), (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index < 0) {
    res.status(404).json({ message: 'product not found' });
    return;
  }

  const product = products[index];
  if (req.authUser?.role === 'VENDOR' && req.authUser.vendorId !== product.vendorId) {
    res.status(403).json({ message: 'cannot delete another vendor product' });
    return;
  }

  products.splice(index, 1);
  res.status(204).send();
});

export default productsRouter;
