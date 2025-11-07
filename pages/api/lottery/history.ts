import type { NextApiRequest, NextApiResponse } from "next";
import { fetchRecentTx, parseLotteryEvents } from "../../../lib/ton-read";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    return res.status(500).json({ error: "Contract address not configured" });
  }

  try {
    const txs = await fetchRecentTx(contractAddress, 30);
    const events = parseLotteryEvents(txs);
    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");
    return res.status(200).json({ events });
  } catch (err: any) {
    console.error("❌ Error in history API:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch history" });
  }
}

