import { Request } from 'express';

export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
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
