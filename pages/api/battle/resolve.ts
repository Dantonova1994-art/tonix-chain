import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "../../../lib/api-middleware/rate-limit";
import { verifySignature, getSecretKey } from "../../../lib/verify";
import { ENV } from "../../../lib/env";
import { getSocketIO } from "../../../server/socket";
import { resolveMatch } from "../../../lib/battle/matchmaker";
import { sameWallet } from "../../../lib/address";

const resolveSchema = z.object({
  matchId: z.string().uuid(),
  winner: z.string().min(1),
  wallet: z.string().min(1), // owner wallet
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
    const body = resolveSchema.parse(req.body);
    const { matchId, winner, wallet, signature } = body;

    // Проверка: только owner может resolve
    const ownerAddress = ENV.OWNER;
    if (!ownerAddress || !sameWallet(wallet, ownerAddress)) {
      return res.status(403).json({ error: "Only owner can resolve" });
    }

    // Verify signature
    const secretKey = getSecretKey();
    const payload = `${wallet}-${matchId}-${winner}`;
    if (!verifySignature(payload, signature, secretKey)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Обновляем матч в matchmaker
    const match = resolveMatch(matchId, winner);
    if (!match) {
      return res.status(400).json({ error: "Match not found or invalid" });
    }

    // Бродкастим через Socket.IO
    const io = getSocketIO();
    if (io) {
      io.emit("battle:resolved", {
        matchId,
        winner,
        match,
      });
    }

    const battlePoolAddress = ENV.BATTLEPOOL_ADDRESS;
    if (!battlePoolAddress) {
      return res.status(500).json({ error: "BattlePool address not configured" });
    }

    // Формируем транзакцию resolve (0 TON с payload)
    // TODO: В реальной реализации здесь будет формирование Cell с данными resolve
    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: battlePoolAddress,
          amount: "0",
          payload: "te6ccgEBAQEAAgAAAEysCg==", // Placeholder для resolve payload
        },
      ],
    };

    return res.status(200).json({
      ok: true,
      matchId,
      winner,
      tx,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: err.errors });
    }

    console.error("❌ Error in battle resolve:", err);
    return res.status(500).json({ error: err.message || "Failed to resolve battle" });
  }
}

