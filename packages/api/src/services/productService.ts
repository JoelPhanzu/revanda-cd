import { ProductFilters, ProductInput } from '../types';

type ProductRecord = ProductInput & {
  id: string;
  vendorId: string;
  validationStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

const products: ProductRecord[] = [];

export const productService = {
  create: (vendorId: string, payload: ProductInput): ProductRecord => {
    const newProduct: ProductRecord = {
      id: `prd_${Date.now()}`,
      vendorId,
      validationStatus: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      ...payload,
    };

    products.push(newProduct);
    return newProduct;
  },
  update: (vendorId: string, productId: string, payload: Partial<ProductInput>): ProductRecord => {
    const index = products.findIndex((product) => product.id === productId && product.vendorId === vendorId);
    if (index < 0) {
      throw new Error('Product not found');
    }

    products[index] = {
      ...products[index],
      ...payload,
      validationStatus: 'PENDING_APPROVAL',
    };

    return products[index];
  },
  delete: (vendorId: string, productId: string): void => {
    const index = products.findIndex((product) => product.id === productId && product.vendorId === vendorId);
    if (index < 0) {
      throw new Error('Product not found');
    }

    products.splice(index, 1);
  },
  getMyProducts: (vendorId: string): ProductRecord[] => products.filter((product) => product.vendorId === vendorId),
  list: (filters: ProductFilters): ProductRecord[] => {
    let result = [...products].filter((product) => product.validationStatus === 'APPROVED' || !filters.query);

    if (filters.vendorId) {
      result = result.filter((product) => product.vendorId === filters.vendorId);
    }

    if (filters.categoryId) {
      result = result.filter((product) => product.categoryId === filters.categoryId);
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter((product) => product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q));
    }

    if (filters.sortBy === 'arrival') {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return result;
  },
  getById: (id: string): ProductRecord | undefined => products.find((product) => product.id === id),
  search: (query: string): ProductRecord[] => productService.list({ query }),
};
