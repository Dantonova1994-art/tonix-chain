import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit, getClientIdentifier } from "../lib/api-middleware/rate-limit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "GET") {
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
    // Получение метрик DAO (mock для демо)
    const metrics = {
      activeUsers: Math.floor(Math.random() * 1000) + 500,
      totalVotes: Math.floor(Math.random() * 5000) + 1000,
      activeProposals: Math.floor(Math.random() * 10) + 3,
      tixTransfers: Math.floor(Math.random() * 2000) + 500,
      totalTIXSupply: 10000000,
      timestamp: Date.now(),
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(metrics);
  } catch (err: any) {
    console.error("❌ Error fetching metrics:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch metrics" });
  }
}

