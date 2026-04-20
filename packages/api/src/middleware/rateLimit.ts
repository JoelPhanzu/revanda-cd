import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

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

export const apiRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const now = Date.now();
  cleanupExpiredBuckets(now);
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({ message: 'Too many requests' });
    return;
  }

  existing.count += 1;
  next();
};
