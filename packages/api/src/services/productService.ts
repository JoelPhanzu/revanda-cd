import { prisma } from '../config/prisma';
import { ProductFilters, ProductInput } from '../types';

const getVendorIdByUserId = async (userId: string): Promise<string> => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    throw new Error('Vendor profile not found');
  }

  return vendor.id;
};

export const productService = {
  create: async (vendorUserId: string, payload: ProductInput) => {
    const vendorId = await getVendorIdByUserId(vendorUserId);

    return prisma.product.create({
      data: {
        vendorId,
        categoryId: payload.categoryId,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        stock: payload.stock,
      },
    });
  },
  update: async (vendorUserId: string, productId: string, payload: Partial<ProductInput>) => {
    const vendorId = await getVendorIdByUserId(vendorUserId);

    const existing = await prisma.product.findFirst({ where: { id: productId, vendorId } });
    if (!existing) {
      throw new Error('Product not found');
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        ...payload,
        validationStatus: 'PENDING_APPROVAL',
      },
    });
  },
  delete: async (vendorUserId: string, productId: string): Promise<void> => {
    const vendorId = await getVendorIdByUserId(vendorUserId);
    const existing = await prisma.product.findFirst({ where: { id: productId, vendorId } });
    if (!existing) {
      throw new Error('Product not found');
    }

    await prisma.product.delete({ where: { id: productId } });
  },
  getMyProducts: async (vendorUserId: string) => {
    const vendorId = await getVendorIdByUserId(vendorUserId);
    return prisma.product.findMany({ where: { vendorId }, orderBy: { createdAt: 'desc' } });
  },
  list: async (filters: ProductFilters) => {
    const where: any = {
      validationStatus: 'APPROVED',
    };

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      orderBy: filters.sortBy === 'arrival' ? { createdAt: 'desc' } : undefined,
    });
  },
  getById: async (id: string) => prisma.product.findUnique({ where: { id } }),
  search: async (query: string) => {
    return prisma.product.findMany({
      where: {
        validationStatus: 'APPROVED',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
