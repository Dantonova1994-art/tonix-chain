import type { NextApiRequest, NextApiResponse } from "next";
import { fetchContractBalance } from "../../../lib/ton-read";
import { rateLimit } from "../../../lib/api-middleware/rate-limit";
import { getClientIP } from "../../../lib/api-middleware/validation";

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

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    return res.status(500).json({ error: "Contract address not configured" });
  }

  try {
    const balanceTon = await fetchContractBalance(contractAddress);
    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");
    return res.status(200).json({ balanceTon });
  } catch (err: any) {
    console.error("❌ Error in balance API:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch balance" });
  }
}
