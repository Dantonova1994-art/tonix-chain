import type { NextApiRequest, NextApiResponse } from "next";
import { fetchRecentTx, parseLotteryEvents } from "../../../lib/ton-read";
import { rateLimit } from "../../../lib/api-middleware/rate-limit";
import { getClientIP } from "../../../lib/api-middleware/validation";
import { LotteryMyTicketsSchema } from "../../../lib/api-middleware/validation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  // Validation
  try {
    LotteryMyTicketsSchema.parse({
      method: req.method,
      query: req.query,
    });
  } catch (err: any) {
    return res.status(400).json({ error: "Invalid request", details: err.errors });
  }

  // Rate limiting
  const ip = getClientIP(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfter?.toString() || "10");
    return res.status(429).json({ error: "Too many requests", retryAfter: limit.retryAfter });
  }

  const { address } = req.query;
  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "Address parameter required" });
  }

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    return res.status(500).json({ error: "Contract address not configured" });
  }

  try {
    const txs = await fetchRecentTx(contractAddress, 30);
    const allEvents = parseLotteryEvents(txs);
    const myTickets = allEvents.filter(
      (event) => event.type === "BUY" && event.from.toLowerCase() === address.toLowerCase()
    );
    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");
    return res.status(200).json({ tickets: myTickets, total: myTickets.length });
  } catch (err: any) {
    console.error("❌ Error in my-tickets API:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch tickets" });
  }
}
