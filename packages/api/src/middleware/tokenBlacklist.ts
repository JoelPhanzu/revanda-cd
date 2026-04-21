import { NextFunction, Request, Response } from 'express';

const tokenBlacklist = new Map<string, number>();

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (now > expiry) {
      tokenBlacklist.delete(token);
    }
  }
}, 10 * 60 * 1000);

cleanupInterval.unref?.();

export const revokeToken = (token: string, expiryTime: number): void => {
  tokenBlacklist.set(token, expiryTime);
};

export const isTokenBlacklisted = (token: string): boolean => {
  const expiry = tokenBlacklist.get(token);
  if (!expiry) {
    return false;
  }

  if (Date.now() > expiry) {
    tokenBlacklist.delete(token);
    return false;
  }

  return true;
};

export const checkTokenBlacklist = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  if (isTokenBlacklisted(token)) {
    res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
    return;
  }

  next();
};
