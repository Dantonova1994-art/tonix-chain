import { getHttpEndpoint } from "@orbs-network/ton-access";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    res.status(200).json({ endpoint });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

