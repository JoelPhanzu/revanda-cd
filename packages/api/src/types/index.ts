import { Request } from 'express';

// Frontend maps roles for display: CUSTOMER -> customer, VENDOR -> vendor, ADMIN -> admin, SUPER_ADMIN -> super_admin
export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  auditAction?: {
    action: string;
    entityType: string;
    entityId: string;
  };
}

export interface RegisterVendorInput {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
}

export interface RegisterCustomerInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  colors?: string[];
  sizes?: string[];
}

export interface ProductFilters {
  vendorId?: string;
  categoryId?: string;
  sortBy?: 'arrival' | 'best_selling' | 'top_rated';
  query?: string;
}

export interface OrderItemInput {
  productId: string;
  vendorId: string;
  quantity: number;
  unitPrice: number;
}

export * from './kyc';
