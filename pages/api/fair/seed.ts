import type { NextApiRequest, NextApiResponse } from "next";
import { generateSeed, signSeed } from "../../../lib/fair-rng";
import { getSecretKey } from "../../../lib/verify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  try {
    const seed = generateSeed();
    const secretKey = getSecretKey();
    const signature = signSeed(seed, secretKey);

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({
      seed,
      signature,
      expiresIn: 60, // seconds
    });
  } catch (err: any) {
    console.error("❌ Error generating fair seed:", err);
    return res.status(500).json({ error: err.message || "Failed to generate seed" });
  }
}

