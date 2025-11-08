import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit, getClientIdentifier } from "../../../lib/api-middleware/rate-limit";
import { verifySignature } from "../../../lib/verify";

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

  const { address, username, xp, level, badges, signature } = req.body;

  if (!address || !username || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Проверка HMAC подписи
  try {
    const payload = JSON.stringify({ address, username, xp, level, badges });
    const secretKey = process.env.TONIX_SECRET_KEY || "dev-secret-key-change-in-production";
    const isValid = verifySignature(payload, signature, secretKey);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch (err) {
    return res.status(401).json({ error: "Signature verification failed" });
  }

  const profileCollectionAddress = process.env.NEXT_PUBLIC_PROFILE_COLLECTION_ADDRESS;
  if (!profileCollectionAddress) {
    return res.status(500).json({ error: "Profile collection address not configured" });
  }

  try {
    // Здесь должна быть отправка транзакции в контракт NFT коллекции
    // Для демо просто возвращаем успех с mock NFT ID
    const nftId = Math.floor(Math.random() * 10000) + 1;
    
    console.log("🎨 Profile NFT mint:", { address, username, xp, level, nftId });

    return res.status(200).json({
      success: true,
      nftId,
      message: "Profile NFT minted successfully",
    });
  } catch (err: any) {
    console.error("❌ Error minting profile:", err);
    return res.status(500).json({ error: err.message || "Failed to mint profile" });
  }
}

