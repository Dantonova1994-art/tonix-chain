import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../../lib/api-middleware/rate-limit";
import { getClientIP } from "../../../lib/api-middleware/validation";
import { readFile } from "fs/promises";
import { join } from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = getClientIP(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfter?.toString() || "10");
    return res.status(429).json({ error: "Too many requests", retryAfter: limit.retryAfter });
  }

  const { referrer } = req.query;
  if (!referrer || typeof referrer !== "string") {
    return res.status(400).json({ error: "referrer parameter required" });
  }

  try {
    // Читаем логи рефералов (в продакшене - из БД)
    const logFile = join(process.cwd(), "logs", "referrals.log");
    let referrals: Array<{ referrer: string; buyer: string; timestamp: number }> = [];

    try {
      const content = await readFile(logFile, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());
      
      referrals = lines
        .map((line) => {
          const match = line.match(/Referrer: (\w+).*Buyer: (\w+)/);
          if (match) {
            return {
              referrer: match[1],
              buyer: match[2],
              timestamp: Date.now(), // Упрощённо
            };
          }
          return null;
        })
        .filter((r): r is { referrer: string; buyer: string; timestamp: number } => r !== null)
        .filter((r) => r.referrer.toLowerCase() === referrer.toLowerCase());
    } catch (e) {
      // Файл не существует или пуст
      console.log("ℹ️ No referrals log found, returning empty stats");
    }

    const stats = {
      referrer,
      totalReferrals: referrals.length,
      uniqueBuyers: new Set(referrals.map((r) => r.buyer)).size,
      totalTickets: referrals.length, // Упрощённо: 1 реферал = 1 билет
      totalVolume: referrals.length * 0.5, // 0.5 TON per ticket
      lastReferral: referrals.length > 0 ? referrals[referrals.length - 1].timestamp : null,
    };

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(stats);
  } catch (err: any) {
    console.error("❌ Error fetching referral stats:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch stats" });
  }
}

