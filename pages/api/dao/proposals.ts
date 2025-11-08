import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit, getClientIdentifier } from "../../../lib/api-middleware/rate-limit";

interface Proposal {
  id: number;
  title: string;
  description: string;
  options: string[];
  votes: Record<string, number>;
  creator: string;
  deadline: number;
  totalVotes: number;
}

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

  const daoAddress = process.env.NEXT_PUBLIC_DAO_ADDRESS;
  if (!daoAddress) {
    return res.status(500).json({ error: "DAO address not configured" });
  }

  try {
    // Получение активных предложений через Toncenter
    const response = await fetch(
      `https://toncenter.com/api/v2/runGetMethod?address=${daoAddress}&method=getActiveProposals&api_key=${process.env.NEXT_PUBLIC_TONCENTER_KEY || ""}`
    );
    const data = await response.json();

    // Парсинг результатов (упрощенная версия)
    const proposals: Proposal[] = [];
    
    // Если контракт еще не задеплоен, возвращаем mock данные для демо
    if (!data.result || data.result.stack?.length === 0) {
      proposals.push({
        id: 1,
        title: "Genesis Proposal: TONIX DAO Launch",
        description: "Should we launch TONIX DAO with initial token distribution?",
        options: ["Yes", "No", "Abstain"],
        votes: { Yes: 0, No: 0, Abstain: 0 },
        creator: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
        deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        totalVotes: 0,
      });
    }

    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");
    return res.status(200).json({ proposals });
  } catch (err: any) {
    console.error("❌ Error fetching proposals:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch proposals" });
  }
}

