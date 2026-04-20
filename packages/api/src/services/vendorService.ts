import { orderService } from './orderService';
import { productService } from './productService';

export const vendorService = {
  getDashboardStats: (vendorId: string) => {
    const products = productService.getMyProducts(vendorId);
    const sales = orderService.listByVendor(vendorId).reduce((sum, order) => sum + order.amount, 0);

    return {
      totalProducts: products.length,
      pendingValidation: products.filter((product) => product.validationStatus === 'PENDING_APPROVAL').length,
      totalSales: sales,
    };
  },
  getSales: (vendorId: string) => {
    return orderService.listByVendor(vendorId);
  },
};
