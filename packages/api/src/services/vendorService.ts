import { orderService } from './orderService';
import { productService } from './productService';

export const vendorService = {
  getDashboardStats: (vendorId: string) => {
    const products = productService.getMyProducts(vendorId);
    const sales = orderService
      .listByCustomer(vendorId)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalProducts: products.length,
      pendingValidation: products.filter((product) => product.validationStatus === 'PENDING_APPROVAL').length,
      totalSales: sales,
    };
  },
  getSales: (vendorId: string) => {
    const orders = orderService
      .listByCustomer(vendorId)
      .map((order) => ({
        orderId: order.id,
        amount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      }));

    return orders;
  },
};
