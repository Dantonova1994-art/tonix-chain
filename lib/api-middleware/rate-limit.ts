/**
 * In-memory rate limiting для API endpoints
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 10000, // 10 seconds
};

export function getClientIdentifier(req: any): string {
  // Получение IP адреса клиента
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0])
    : req.socket?.remoteAddress || "unknown";
  return ip;
}

export function rateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Создаём новую запись
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    // Превышен лимит
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Увеличиваем счётчик
  record.count++;
  return { allowed: true };
}

// Очистка старых записей (вызывается при каждом запросе)
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}
