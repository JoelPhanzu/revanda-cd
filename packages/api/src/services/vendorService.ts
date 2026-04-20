import { prisma } from '../config/prisma';

export const vendorService = {
  getDashboardStats: async (vendorUserId: string) => {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: vendorUserId },
      select: { id: true },
    });

    if (!vendor) {
      throw new Error('Vendor profile not found');
    }

    const [totalProducts, pendingValidation, salesAggregate] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id } }),
      prisma.product.count({ where: { vendorId: vendor.id, validationStatus: 'PENDING_APPROVAL' } }),
      prisma.payment.aggregate({
        where: { vendorId: vendor.id, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalProducts,
      pendingValidation,
      totalSales: Number(salesAggregate._sum.amount || 0),
    };
  },
  getSales: async (vendorUserId: string) => {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: vendorUserId },
      select: { id: true },
    });

    if (!vendor) {
      throw new Error('Vendor profile not found');
    }

    return prisma.payment.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
  },
};
