/**
 * Централизованное управление переменными окружения с фолбэками
 */

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT";
export const TONCENTER_RPC = process.env.NEXT_PUBLIC_TONCENTER_RPC || "https://toncenter.com/api/v2/jsonRPC";

export const ENV = {
  NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  CONTRACT: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || CONTRACT_ADDRESS,
  OWNER: process.env.NEXT_PUBLIC_OWNER_ADDRESS,
  TONCENTER: process.env.NEXT_PUBLIC_TONCENTER_API || TONCENTER_RPC,
  TONCENTER_KEY: process.env.NEXT_PUBLIC_TONCENTER_KEY,
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NFT_MINTER: process.env.NEXT_PUBLIC_NFT_MINTER_ADDRESS,
  NFT_COLLECTION_URL: process.env.NEXT_PUBLIC_NFT_COLLECTION_URL || "https://tonviewer.com/",
  GAMING_MODE: process.env.NEXT_PUBLIC_GAMING_MODE || "true",
  // TON Battle
  BATTLE_ENABLED: process.env.NEXT_PUBLIC_BATTLE_ENABLED,
  BATTLE_ENTRY_TON: process.env.NEXT_PUBLIC_BATTLE_ENTRY_TON || "0.1",
  BATTLEPOOL_ADDRESS: process.env.NEXT_PUBLIC_BATTLEPOOL_ADDRESS,
  // NFT Collections
  NFT_ENABLED: process.env.NEXT_PUBLIC_NFT_ENABLED,
  TICKET_COLLECTION_ADDRESS: process.env.NEXT_PUBLIC_TICKET_COLLECTION_ADDRESS,
  WINNER_COLLECTION_ADDRESS: process.env.NEXT_PUBLIC_WINNER_COLLECTION_ADDRESS,
  ASSETS_BASE: process.env.NEXT_PUBLIC_ASSETS_BASE || "https://tonix-chain.vercel.app/api/nft/metadata",
  // Server-side secrets
  PRIVATE_NFT_MINTER_KEY: process.env.PRIVATE_NFT_MINTER_KEY,
  TONIX_SECRET_KEY: process.env.TONIX_SECRET_KEY || "dev-secret-key-change-in-production",
} as const;

// Telegram Mini App (TWA) конфигурация
export const TWA = {
  BOT: process.env.NEXT_PUBLIC_TWA_BOT_USERNAME || "tonixchain_lottery_bot",
  URL: process.env.NEXT_PUBLIC_TWA_APP_URL || "https://tonix-chain.vercel.app",
  MODE: process.env.NEXT_PUBLIC_TWA_MODE || "production",
} as const;

export function requireEnv<K extends keyof typeof ENV>(key: K): string {
  const v = ENV[key];
  if (!v) {
    const error = new Error(`Missing env: ${key}`);
    // В браузере показываем toast, на сервере логируем
    if (typeof window !== "undefined") {
      console.error("❌ Missing ENV:", key);
      // Можно добавить toast, но не крашим UI
    }
    throw error;
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

// Безопасные require для Battle (не крашат UI, возвращают fallback)
export function requireBattleEnv(): {
  enabled: boolean;
  entryTon: string;
  poolAddress: string | null;
} {
  return {
    enabled: ENV.BATTLE_ENABLED === "true",
    entryTon: ENV.BATTLE_ENTRY_TON || "0.1",
    poolAddress: ENV.BATTLEPOOL_ADDRESS || null,
  };
}
