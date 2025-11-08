import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit, getClientIdentifier } from "../../../lib/api-middleware/rate-limit";

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

  const tokenAddress = process.env.NEXT_PUBLIC_TONIX_TOKEN_ADDRESS;
  if (!tokenAddress) {
    return res.status(500).json({ error: "Token address not configured" });
  }

  try {
    // Получение данных токена через Toncenter
    const response = await fetch(
      `https://toncenter.com/api/v2/runGetMethod?address=${tokenAddress}&method=getTotalSupply&api_key=${process.env.NEXT_PUBLIC_TONCENTER_KEY || ""}`
    );
    const data = await response.json();

    const totalSupply = data.result?.stack?.[0]?.[1] || "0";
    const totalSupplyTon = parseInt(totalSupply, 16) / 1e9;

    // Кэширование на 60 секунд
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    
    return res.status(200).json({
      address: tokenAddress,
      totalSupply: totalSupplyTon,
      decimals: 9,
      symbol: "TIX",
      name: "TONIX Token",
    });
  } catch (err: any) {
    console.error("❌ Error fetching token data:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch token data" });
  }
}

