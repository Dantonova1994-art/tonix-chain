import type { NextApiRequest, NextApiResponse } from "next";
import { tonFetch } from "../../../utils/core/tonFetch";

const RPC = process.env.NEXT_PUBLIC_TONCENTER || "https://toncenter.com/api/v2/jsonRPC";
const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!CONTRACT) {
    return res.status(500).json({ ok: false, message: "No contract address" });
  }

  try {
    const response = await tonFetch(`${RPC}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "getAddressBalance",
        params: [CONTRACT],
        id: 1,
        jsonrpc: "2.0"
      }),
    });

    const nano = Number(response.result || 0);
    const ton = nano / 1e9;
    return res.status(200).json({ ok: true, balance: ton.toFixed(3) });
  } catch (err) {
    console.error("Jackpot fetch error:", err);
    return res.status(200).json({ ok: false, balance: 0 });
  }
}
