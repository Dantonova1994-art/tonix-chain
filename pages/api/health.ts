import type { NextApiRequest, NextApiResponse } from "next";
import { ENV } from "../../lib/env";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");
  
  return res.status(200).json({
    ok: true,
    network: ENV.NETWORK || "unknown",
    contract: !!ENV.CONTRACT,
    owner: !!ENV.OWNER,
    toncenter: !!ENV.TONCENTER,
    timestamp: Date.now(),
  });
}

