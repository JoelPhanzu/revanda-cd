import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, Role } from '../types';
import { isTokenBlacklisted } from './tokenBlacklist';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (isTokenBlacklisted(token)) {
    res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !hasRequiredRole(req.user.role, roles)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
};

const rolePriority: Record<Role, number> = {
  CUSTOMER: 1,
  VENDOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

const hasRequiredRole = (currentRole: Role, requiredRoles: Role[]): boolean => {
  // Intentional hierarchy: SUPER_ADMIN inherits ADMIN/VENDOR/CUSTOMER permissions.
  const currentPriority = rolePriority[currentRole] || 0;
  return requiredRoles.some((role) => currentPriority >= rolePriority[role]);
};

export const requireSuperAdminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Only SUPER_ADMIN can perform this action' });
    return;
  }
  next();
};

export const canDeleteResource = (entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (req.user.role === 'SUPER_ADMIN') {
        next();
        return;
      }

      res.status(403).json({
        message: `${entityType} deletion must be requested. Use POST /${entityType.toLowerCase()}/:id/request-deletion`,
      });
    } catch (error) {
      next(error);
    }
  };
};

export const auditLog = (action: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const routeSegment = req.baseUrl.split('/').filter(Boolean).pop() || 'entity';
    const entityTypeMap: Record<string, string> = {
      products: 'Product',
      orders: 'Order',
      users: 'User',
      vendors: 'Vendor',
      categories: 'Category',
      reviews: 'Review',
      messages: 'Message',
      payments: 'Payment',
      admin: 'Admin',
    };
    const entityType =
      entityTypeMap[routeSegment] || routeSegment.replace(/^\w/, (value) => value.toUpperCase());
    const entityId = typeof req.params?.id === 'string' ? req.params.id : '';

    req.auditAction = { action, entityType, entityId };
    next();
  };
};
