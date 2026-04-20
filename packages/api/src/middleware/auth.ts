import jwt from 'jsonwebtoken';
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

interface TokenPayload {
  sub?: string;
  role?: string;
  vendorId?: string;
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }

  return 'dev-only-jwt-secret';
};

const parseRole = (value: string | undefined): AuthRole | null => {
  const normalized = value?.toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'VENDOR' || normalized === 'USER') {
    return normalized;
  }
  return null;
};

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authorization = req.header('authorization');
  if (!authorization) {
    res.status(401).json({ message: 'Authorization header is required' });
    return;
  }

  if (!authorization.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization header must use Bearer token format' });
    return;
  }

  const token = authorization.slice(7);

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
    const role = parseRole(decoded.role);
    const userId = decoded.sub;

    if (!role || !userId) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    req.authUser = {
      id: userId,
      role,
      vendorId: decoded.vendorId,
    };

    next();
  } catch (_error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: AuthRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.authUser?.role;
    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({ message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}` });
      return;
    }

    next();
  };
};
