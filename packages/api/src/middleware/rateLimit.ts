import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60_000;

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();
let requestsSinceCleanup = 0;

const cleanupExpiredBuckets = (now: number): void => {
  requestsSinceCleanup += 1;
  if (requestsSinceCleanup < 100) {
    return;
  }

  requestsSinceCleanup = 0;
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
};

const createRateLimiter = (maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    cleanupExpiredBuckets(now);
    const source = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${source}:${req.method}:${req.path}`;
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      next();
      return;
    }

    if (existing.count >= maxRequests) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.status(429).json({
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        retryAfter,
      });
      return;
    }

    existing.count += 1;
    next();
  };
};

export const apiRateLimiter = createRateLimiter(50);
export const authLoginLimiter = createRateLimiter(5);
export const authRegisterLimiter = createRateLimiter(3);
export const ordersLimiter = createRateLimiter(10);
export const paymentsLimiter = createRateLimiter(20);
export const browseLimiter = createRateLimiter(100);
