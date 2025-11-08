import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "../../../lib/api-middleware/rate-limit";
import { verifySignature, getSecretKey } from "../../../lib/verify";
import { ENV } from "../../../lib/env";

const mintTicketSchema = z.object({
  address: z.string().min(1),
  roundId: z.number().int().positive(),
  txHash: z.string().min(1),
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
    const body = mintTicketSchema.parse(req.body);
    const { address, roundId, txHash, signature } = body;

    // Verify signature
    const secretKey = getSecretKey();
    const payload = `${address}-${roundId}-${txHash}`;
    if (!verifySignature(payload, signature, secretKey)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const collectionAddress = ENV.TICKET_COLLECTION_ADDRESS;
    if (!collectionAddress) {
      return res.status(500).json({ error: "Ticket collection address not configured" });
    }

    // TODO: В реальной реализации здесь будет вызов Toncenter API для минта NFT
    // Пока возвращаем mock данные
    const itemId = Math.floor(Math.random() * 1000000);
    const nftAddress = `${collectionAddress.slice(0, 6)}...${collectionAddress.slice(-4)}-${itemId}`;

    return res.status(200).json({
      ok: true,
      nftAddress,
      itemId,
      roundId,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: err.errors });
    }

    console.error("❌ Error minting ticket NFT:", err);
    return res.status(500).json({ error: err.message || "Failed to mint ticket NFT" });
  }
}

