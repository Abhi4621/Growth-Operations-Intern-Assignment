import { Request, Response, NextFunction } from 'express';

const ipRequests = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(limit = 100, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const entry = ipRequests.get(ip);

    if (!entry || now > entry.resetTime) {
      ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down and try again later.',
      });
      return;
    }

    entry.count++;
    next();
  };
}
