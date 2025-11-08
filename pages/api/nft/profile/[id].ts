import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid profile ID" });
  }

  // Получение данных профиля (mock для демо)
  const level = parseInt(id) % 5 || 1;
  const levelColors: Record<number, { gradient: string; glow: string }> = {
    1: { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.6)" },
    2: { gradient: "from-purple-500 to-pink-500", glow: "rgba(168, 85, 247, 0.6)" },
    3: { gradient: "from-yellow-500 to-orange-500", glow: "rgba(234, 179, 8, 0.6)" },
    4: { gradient: "from-red-500 to-pink-500", glow: "rgba(239, 68, 68, 0.6)" },
    5: { gradient: "from-cyan-500 via-blue-500 to-purple-500", glow: "rgba(0, 255, 255, 0.8)" },
  };

  const colors = levelColors[level] || levelColors[1];

  const metadata = {
    name: `TONIX Profile #${id}`,
    description: `TONIX Chain Profile NFT - Level ${level}`,
    image: `https://tonix-chain.vercel.app/api/nft/profile-image/${id}`,
    attributes: [
      { trait_type: "Level", value: level },
      { trait_type: "Gradient", value: colors.gradient },
      { trait_type: "Glow", value: colors.glow },
    ],
    background: {
      gradient: colors.gradient,
      glow: colors.glow,
    },
  };

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json(metadata);
}

