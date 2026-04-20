import { ProductFilters, ProductInput } from '../types';
import { prisma } from '../config/prisma';

type ProductRecord = ProductInput & {
  id: string;
  vendorId: string;
  validationStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

const toProductRecord = (product: {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string;
  price: { toNumber: () => number } | number;
  stock: number;
  validationStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DRAFT' | 'ARCHIVED';
  createdAt: Date;
}): ProductRecord => ({
  id: product.id,
  vendorId: product.vendorId,
  categoryId: product.categoryId,
  name: product.name,
  description: product.description,
  price: typeof product.price === 'number' ? product.price : product.price.toNumber(),
  stock: product.stock,
  validationStatus: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(product.validationStatus)
    ? (product.validationStatus as ProductRecord['validationStatus'])
    : 'PENDING_APPROVAL',
  createdAt: product.createdAt.toISOString(),
});

const getVendorProfileId = async (userId: string): Promise<string> => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!vendor) {
    throw new Error('Vendor profile not found');
  }

  return vendor.id;
};

export const productService = {
  create: async (vendorUserId: string, payload: ProductInput): Promise<ProductRecord> => {
    const vendorId = await getVendorProfileId(vendorUserId);
    const newProduct = await prisma.product.create({
      data: {
        vendorId,
        categoryId: payload.categoryId,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        stock: payload.stock,
        validationStatus: 'PENDING_APPROVAL',
      },
    });

    return toProductRecord(newProduct);
  },
  update: async (vendorUserId: string, productId: string, payload: Partial<ProductInput>): Promise<ProductRecord> => {
    const vendorId = await getVendorProfileId(vendorUserId);
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorId,
      },
      select: { id: true },
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...payload,
        validationStatus: 'PENDING_APPROVAL',
      },
    });

    return toProductRecord(updatedProduct);
  },
  delete: async (vendorUserId: string, productId: string): Promise<void> => {
    const vendorId = await getVendorProfileId(vendorUserId);
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorId,
      },
      select: { id: true },
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    await prisma.product.delete({
      where: { id: productId },
    });
  },
  getMyProducts: async (vendorUserId: string): Promise<ProductRecord[]> => {
    const vendorId = await getVendorProfileId(vendorUserId);
    const products = await prisma.product.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });
    return products.map(toProductRecord);
  },
  list: async (filters: ProductFilters): Promise<ProductRecord[]> => {
    let vendorFilterId = filters.vendorId;
    if (filters.vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: filters.vendorId },
        select: { id: true },
      });
      vendorFilterId = vendor?.id || filters.vendorId;
    }

    const products = await prisma.product.findMany({
      where: {
        validationStatus: 'APPROVED',
        ...(vendorFilterId ? { vendorId: vendorFilterId } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.query
          ? {
              OR: [
                { name: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: filters.sortBy === 'arrival' ? { createdAt: 'desc' } : undefined,
    });

    return products.map(toProductRecord);
  },
  getById: async (id: string): Promise<ProductRecord | undefined> => {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product ? toProductRecord(product) : undefined;
  },
  search: async (query: string): Promise<ProductRecord[]> => productService.list({ query }),
};
