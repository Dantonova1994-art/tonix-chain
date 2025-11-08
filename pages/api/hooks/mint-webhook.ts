import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignature, getSecretKey } from "../../../lib/verify";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signature = req.headers["x-tonix-signature"] as string;
    if (!signature) {
      return res.status(401).json({ error: "Missing signature" });
    }

    const payload = JSON.stringify(req.body);
    const secretKey = getSecretKey();
    
    if (!verifySignature(payload, signature, secretKey)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { walletAddress, level, nftType, timestamp } = req.body;

    // Логируем в файл
    const logDir = join(process.cwd(), "logs");
    try {
      await mkdir(logDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const logEntry = `${new Date().toISOString()} | ${nftType} | Level ${level} | Wallet: ${walletAddress}\n`;
    await writeFile(join(logDir, "pass-mint.log"), logEntry, { flag: "a" });

    console.log("📝 NFT Mint logged:", { walletAddress, level, nftType, timestamp });

    return res.status(200).json({ ok: true, logged: true });
  } catch (err: any) {
    console.error("❌ Error in mint webhook:", err);
    return res.status(500).json({ error: err.message || "Webhook processing failed" });
  }
}

