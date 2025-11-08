/**
 * In-memory rate limiter для API маршрутов
 */

import { NextApiRequest } from "next";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

const RATE_LIMIT = {
  windowMs: 10000, // 10 секунд
  maxRequests: 5,
};

export function getClientIdentifier(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return forwarded || req.socket.remoteAddress || "unknown";
}

export function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = ip;
  
  if (!store[key] || now > store[key].resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + RATE_LIMIT.windowMs,
    };
    return { allowed: true };
  }

  if (store[key].count >= RATE_LIMIT.maxRequests) {
    const retryAfter = Math.ceil((store[key].resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  store[key].count++;
  return { allowed: true };
}

// Очистка старых записей каждые 60 секунд
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (now > store[key].resetAt) {
        delete store[key];
      }
    });
  }, 60000);
}
