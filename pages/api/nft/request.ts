import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address, roundId } = req.body;

  if (!address || !roundId) {
    return res.status(400).json({ error: "address and roundId required" });
  }

  // TODO: В будущем интегрировать минтер (контракт/сервис)
  // - Проверить право на минт (есть ли билет в раунде)
  // - Вызвать контракт минта NFT
  // - Вернуть tx hash или статус

  console.log("🎫 NFT mint request (stub):", { address, roundId });

  return res.status(200).json({
    ok: true,
    message: "queued",
    note: "NFT mint functionality coming soon",
  });
}

