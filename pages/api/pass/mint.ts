import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignature, getSecretKey } from "../../../lib/verify";
import { rateLimit } from "../../../lib/api-middleware/rate-limit";
import { getClientIP } from "../../../lib/api-middleware/validation";
import { z } from "zod";

const mintSchema = z.object({
  walletAddress: z.string().min(1),
  level: z.number().int().min(1).max(5),
  signature: z.string().min(1),
});

function generateSignature(payload: string, secretKey: string): string {
  return Buffer.from(payload + secretKey).toString("base64");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = getClientIP(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfter?.toString() || "10");
    return res.status(429).json({ error: "Too many requests", retryAfter: limit.retryAfter });
  }

  // Validation
  try {
    const body = mintSchema.parse(req.body);
    const { walletAddress, level, signature } = body;

    // Verify signature
    const secretKey = getSecretKey();
    const payload = `${walletAddress}-${level}`;
    if (!verifySignature(payload, signature, secretKey)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Формируем payload для webhook
    const webhookPayload = {
      walletAddress,
      level,
      nftType: "TONIX_PASS",
      timestamp: Date.now(),
    };

    // Вызов webhook (в фоне)
    const webhookUrl = process.env.NFT_MINTER_WEBHOOK_URL || "http://localhost:3000/api/hooks/mint-webhook";
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-TONIX-SIGNATURE": generateSignature(JSON.stringify(webhookPayload), secretKey),
        },
        body: JSON.stringify(webhookPayload),
      });
      console.log("✅ Webhook called for NFT mint:", webhookPayload);
    } catch (webhookErr) {
      console.warn("⚠️ Webhook call failed (non-critical):", webhookErr);
    }

    // Генерируем mock txHash для демо
    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return res.status(200).json({
      ok: true,
      txHash,
      nftId: `TONIX_PASS_L${level}_${walletAddress.slice(0, 8)}`,
      level,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: err.errors });
    }

    console.error("❌ Error minting TONIX PASS:", err);
    return res.status(500).json({ error: err.message || "Failed to mint NFT" });
  }
}
