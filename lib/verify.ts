/**
 * Безопасность: HMAC-SHA256 подписи для API запросов
 */

import { createHmac } from "crypto";

export function generateSignature(payload: string, secretKey: string): string {
  if (typeof window !== "undefined") {
    // В браузере используем упрощённую версию (для демо)
    return btoa(payload + secretKey);
  }
  const hmac = createHmac("sha256", secretKey);
  hmac.update(payload);
  return hmac.digest("hex");
}

export function verifySignature(payload: string, signature: string, secretKey: string): boolean {
  const expected = generateSignature(payload, secretKey);
  return expected === signature;
}

export function getSecretKey(): string {
  return process.env.TONIX_SECRET_KEY || "dev-secret-key-change-in-production";
}

