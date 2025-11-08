import type { NextApiRequest, NextApiResponse } from "next";
import { ENV } from "../../../../../lib/env";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (type !== "ticket" && type !== "winner") {
    return res.status(400).json({ error: "Invalid type. Use 'ticket' or 'winner'" });
  }

  const baseUrl = ENV.ASSETS_BASE || "https://tonix-chain.vercel.app/api/nft/metadata";
  const imageUrl = `${baseUrl}/image/${type}.png`;

  const metadata = {
    name: type === "ticket" ? `TONIX Ticket #${id}` : `TONIX Winner #${id}`,
    description:
      type === "ticket"
        ? `NFT Ticket for TONIX Chain Lottery Round #${id}`
        : `NFT Winner Trophy for TONIX Battle Match #${id}`,
    image: imageUrl,
    attributes: [
      {
        trait_type: "Type",
        value: type === "ticket" ? "Lottery Ticket" : "Battle Winner",
      },
      {
        trait_type: "ID",
        value: id,
      },
      {
        trait_type: "Network",
        value: ENV.NETWORK || "mainnet",
      },
    ],
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return res.status(200).json(metadata);
}

