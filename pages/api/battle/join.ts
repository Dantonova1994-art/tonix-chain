import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "../../../lib/api-middleware/rate-limit";
import { verifySignature, getSecretKey } from "../../../lib/verify";
import { ENV } from "../../../lib/env";
import { toNano } from "@ton/core";

const joinSchema = z.object({
  wallet: z.string().min(1),
  matchId: z.string().uuid(),
  signature: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = getClientIdentifier(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfter?.toString() || "10");
    return res.status(429).json({ error: "Too many requests", retryAfter: limit.retryAfter });
  }

  try {
    const body = joinSchema.parse(req.body);
    const { wallet, matchId, signature } = body;

    // Verify signature
    const secretKey = getSecretKey();
    const payload = `${wallet}-${matchId}`;
    if (!verifySignature(payload, signature, secretKey)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const battlePoolAddress = ENV.BATTLEPOOL_ADDRESS;
    if (!battlePoolAddress) {
      return res.status(500).json({ error: "BattlePool address not configured" });
    }

    const entryValueTon = parseFloat(ENV.BATTLE_ENTRY_TON || "0.1");
    const entryValueNano = toNano(entryValueTon).toString();

    // Формируем транзакцию для TonConnect
    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: battlePoolAddress,
          amount: entryValueNano,
        },
      ],
    };

    return res.status(200).json({
      ok: true,
      matchId,
      tx,
      entryValue: entryValueTon,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: err.errors });
    }

    console.error("❌ Error in battle join:", err);
    return res.status(500).json({ error: err.message || "Failed to join battle" });
  }
}

