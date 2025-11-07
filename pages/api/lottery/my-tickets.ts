import type { NextApiRequest, NextApiResponse } from "next";
import { fetchRecentTx, parseLotteryEvents } from "../../../lib/ton-read";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
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

