import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit, getClientIdentifier } from "../../../lib/api-middleware/rate-limit";
import { verifySignature } from "../../../lib/verify";

// In-memory rate limit для голосований (1 голос в 10 секунд)
const voteRateLimit = new Map<string, number>();

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

  const { proposalId, option, walletAddress, signature } = req.body;

  if (!proposalId || !option || !walletAddress || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Проверка HMAC подписи
  try {
    const payload = JSON.stringify({ proposalId, option, walletAddress });
    const secretKey = process.env.TONIX_SECRET_KEY || "dev-secret-key-change-in-production";
    const isValid = verifySignature(payload, signature, secretKey);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch (err) {
    return res.status(401).json({ error: "Signature verification failed" });
  }

  // Rate limit: 1 голос в 10 секунд
  const now = Date.now();
  const lastVote = voteRateLimit.get(walletAddress);
  if (lastVote && now - lastVote < 10000) {
    return res.status(429).json({ error: "Please wait 10 seconds between votes" });
  }
  voteRateLimit.set(walletAddress, now);

  const daoAddress = process.env.NEXT_PUBLIC_DAO_ADDRESS;
  if (!daoAddress) {
    return res.status(500).json({ error: "DAO address not configured" });
  }

  try {
    // Здесь должна быть отправка транзакции в контракт DAO
    // Для демо просто возвращаем успех
    console.log("🗳️ Vote cast:", { proposalId, option, walletAddress });

    return res.status(200).json({
      success: true,
      proposalId,
      option,
      message: "Vote cast successfully",
    });
  } catch (err: any) {
    console.error("❌ Error casting vote:", err);
    return res.status(500).json({ error: err.message || "Failed to cast vote" });
  }
}

