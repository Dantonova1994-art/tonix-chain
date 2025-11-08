/**
 * Централизованное управление переменными окружения с фолбэками
 */

export const ENV = {
  NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  CONTRACT: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  OWNER: process.env.NEXT_PUBLIC_OWNER_ADDRESS,
  TONCENTER: process.env.NEXT_PUBLIC_TONCENTER_API,
  TONCENTER_KEY: process.env.NEXT_PUBLIC_TONCENTER_KEY,
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NFT_MINTER: process.env.NEXT_PUBLIC_NFT_MINTER_ADDRESS,
  NFT_COLLECTION_URL: process.env.NEXT_PUBLIC_NFT_COLLECTION_URL || "https://tonviewer.com/",
} as const;

export function requireEnv<K extends keyof typeof ENV>(key: K): string {
  const v = ENV[key];
  if (!v) {
    throw new Error(`Missing env: ${key}`);
  }
  return v;
}

export function getEnv<K extends keyof typeof ENV>(key: K): string | undefined {
  return ENV[key];
}

export function hasRequiredEnv(): { missing: string[]; allPresent: boolean } {
  const required = ["NETWORK", "CONTRACT", "TONCENTER"] as const;
  const missing = required.filter((key) => !ENV[key]);
  return {
    missing,
    allPresent: missing.length === 0,
  };
}
