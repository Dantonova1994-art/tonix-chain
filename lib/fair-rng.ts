/**
 * Fair PRNG - честный генератор случайных чисел с серверным seed
 */

import { createHmac } from "crypto";

export interface FairSeed {
  seed: string;
  signature: string;
  expiresAt: number;
}

const STORAGE_KEY_SEED = "tonix_fair_seed";
const SEED_TTL = 60000; // 60 секунд

export function generateSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function signSeed(seed: string, secretKey: string): string {
  if (typeof window !== "undefined") {
    // В браузере используем Web Crypto API
    return btoa(seed + secretKey); // Упрощённая версия для браузера
  }
  // На сервере используем crypto
  const hmac = createHmac("sha256", secretKey);
  hmac.update(seed);
  return hmac.digest("hex");
}

export function verifySignature(seed: string, signature: string, secretKey: string): boolean {
  const expected = signSeed(seed, secretKey);
  return expected === signature;
}

export function getRandomInt(seed: string, max: number): number {
  // Простой хэш-функция для генерации числа из seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
}

export function getRandomFloat(seed: string): number {
  const int = getRandomInt(seed, 1000000);
  return int / 1000000;
}

export function getStoredSeed(): FairSeed | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_SEED);
  if (!stored) return null;
  
  try {
    const parsed = JSON.parse(stored);
    if (parsed.expiresAt > Date.now()) {
      return parsed;
    }
  } catch (e) {
    // Invalid seed
  }
  
  return null;
}

export function storeSeed(seed: FairSeed): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_SEED, JSON.stringify(seed));
}

export async function fetchNewSeed(): Promise<FairSeed> {
  const response = await fetch("/api/fair/seed");
  if (!response.ok) {
    throw new Error("Failed to fetch fair seed");
  }
  const data = await response.json();
  
  const fairSeed: FairSeed = {
    seed: data.seed,
    signature: data.signature,
    expiresAt: Date.now() + SEED_TTL,
  };
  
  storeSeed(fairSeed);
  return fairSeed;
}

export async function getOrFetchSeed(): Promise<FairSeed> {
  const stored = getStoredSeed();
  if (stored) {
    return stored;
  }
  return await fetchNewSeed();
}

