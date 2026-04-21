import { prisma } from '../config/prisma';
import { orderService } from './orderService';

const resolveVendorId = async (vendorIdentifier: string): Promise<string> => {
  const byUserId = await prisma.vendor.findUnique({ where: { userId: vendorIdentifier } });
  if (byUserId) {
    return byUserId.id;
  }

  const byId = await prisma.vendor.findUnique({ where: { id: vendorIdentifier } });
  if (byId) {
    return byId.id;
  }

  throw new Error('Vendor not found');
};

export const vendorService = {
  getDashboardStats: async (vendorIdentifier: string) => {
    const vendorId = await resolveVendorId(vendorIdentifier);

    const [totalProducts, pendingValidation, totalSalesResult] = await Promise.all([
      prisma.product.count({ where: { vendorId } }),
      prisma.product.count({ where: { vendorId, validationStatus: 'PENDING_APPROVAL' } }),
      prisma.payment.aggregate({
        where: { vendorId },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalProducts,
      pendingValidation,
      totalSales: Number(totalSalesResult._sum.amount ?? 0),
    };
  },
  getSales: async (vendorIdentifier: string) => {
    return orderService.listByVendor(vendorIdentifier);
  },
};
