import type { NextApiRequest, NextApiResponse } from "next";
import { fetchContractBalance } from "../../../lib/ton-read";
import { CONTRACT_ADDRESS } from "../../../lib/env";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Получение баланса контракта
    const contractBalance = await fetchContractBalance(CONTRACT_ADDRESS);

    // Mock данные для демо (в продакшене получать из БД или on-chain)
    const metrics = {
      contractBalance: contractBalance,
      daoMembers: Math.floor(Math.random() * 500) + 200,
      totalRounds: Math.floor(Math.random() * 100) + 50,
      nftProfiles: Math.floor(Math.random() * 1000) + 500,
      timestamp: Date.now(),
    };

    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");
    return res.status(200).json(metrics);
  } catch (err: any) {
    console.error("❌ Error fetching live metrics:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch live metrics" });
  }
}

