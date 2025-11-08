import type { NextApiRequest, NextApiResponse } from "next";
import { requireEnv } from "../../../lib/env";
import { fetchJSON } from "../../../lib/fetch-helper";
import { rateLimit } from "../../../lib/api-middleware/rate-limit";
import { getClientIP } from "../../../lib/api-middleware/validation";
import { NFTMintSchema } from "../../../lib/api-middleware/validation";

// Sentry для логирования (если доступен)
let Sentry: any = null;
if (typeof window === "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    Sentry = require("@sentry/nextjs");
  } catch (e) {
    // Sentry не установлен
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validation
  try {
    NFTMintSchema.parse({
      method: req.method,
      body: req.body,
    });
  } catch (err: any) {
    return res.status(400).json({ error: "Invalid request", details: err.errors });
  }

  // Rate limiting
  const ip = getClientIP(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfter?.toString() || "10");
    return res.status(429).json({ error: "Too many requests", retryAfter: limit.retryAfter });
  }

  const { address, roundId, txHash, secretKey } = req.body;

  // Проверка секретного ключа
  const requiredSecret = process.env.PRIVATE_NFT_SECRET_KEY;
  if (!requiredSecret || secretKey !== requiredSecret) {
    console.error("❌ Invalid secret key for NFT mint");
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!address || !roundId || !txHash) {
    return res.status(400).json({ error: "address, roundId, and txHash required" });
  }

  try {
    const nftMinterAddress = requireEnv("CONTRACT");
    const toncenterApi = requireEnv("TONCENTER");
    const toncenterKey = process.env.NEXT_PUBLIC_TONCENTER_KEY || "";

    console.log("🎫 Minting NFT ticket...", { address, roundId, txHash });

    // TODO: Отправка internal message к NFT minter контракту через Toncenter
    const nftAddress = `${nftMinterAddress.slice(0, 6)}...${nftMinterAddress.slice(-4)}-${roundId}`;
    const timestamp = Date.now();

    // Логирование в Sentry
    if (Sentry) {
      Sentry.captureMessage("NFT mint requested", {
        level: "info",
        tags: { "nft-mint": "success" },
        extra: { address, roundId, txHash, nftAddress },
      });
    }

    console.log("✅ NFT mint request processed:", { nftAddress, roundId, timestamp });

    return res.status(200).json({
      ok: true,
      nftAddress,
      roundId,
      timestamp,
      message: "NFT mint queued (stub - requires real contract)",
    });
  } catch (err: any) {
    console.error("❌ Error minting NFT:", err);

    // Логирование ошибки в Sentry
    if (Sentry) {
      Sentry.captureException(err, {
        tags: { "nft-mint": "error" },
        extra: { address, roundId, txHash },
      });
    }

    return res.status(500).json({ error: err.message || "Failed to mint NFT" });
  }
}
