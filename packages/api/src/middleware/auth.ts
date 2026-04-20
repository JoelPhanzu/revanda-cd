import { NextFunction, Request, Response } from 'express';

export type AuthRole = 'USER' | 'VENDOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  role: AuthRole;
  vendorId?: string;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

const parseRole = (value: string | undefined): AuthRole => {
  const normalized = value?.toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'VENDOR' || normalized === 'USER') {
    return normalized;
  }
  return 'USER';
};

export const authMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const role = parseRole(req.header('x-user-role') ?? undefined);
  const id = req.header('x-user-id') ?? 'demo-user';
  const vendorId = req.header('x-vendor-id') ?? undefined;

  req.authUser = {
    id,
    role,
    vendorId: role === 'VENDOR' ? vendorId ?? id : vendorId,
  };

  next();
};

export const requireRole = (allowedRoles: AuthRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.authUser?.role;
    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({ message: 'Access denied for this role' });
      return;
    }

    next();
  };
};
