import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../../lib/api-middleware/rate-limit";
import { getClientIP } from "../../../lib/api-middleware/validation";
import { z } from "zod";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

const trackSchema = z.object({
  referrer: z.string().min(1),
  buyer: z.string().min(1),
  txHash: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = getClientIP(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", limit.retryAfter?.toString() || "10");
    return res.status(429).json({ error: "Too many requests", retryAfter: limit.retryAfter });
  }

  try {
    const body = trackSchema.parse(req.body);
    const { referrer, buyer, txHash } = body;

    // Проверка: нельзя быть рефералом самому себе
    if (referrer.toLowerCase() === buyer.toLowerCase()) {
      return res.status(400).json({ error: "Cannot refer yourself" });
    }

    // Сохраняем в файл (в продакшене - в БД)
    const logDir = join(process.cwd(), "logs");
    try {
      await mkdir(logDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const referralEntry = {
      referrer,
      buyer,
      txHash: txHash || null,
      timestamp: Date.now(),
    };

    const logEntry = `${new Date().toISOString()} | Referrer: ${referrer} | Buyer: ${buyer} | TX: ${txHash || "N/A"}\n`;
    await writeFile(join(logDir, "referrals.log"), logEntry, { flag: "a" });

    console.log("📊 Referral tracked:", referralEntry);

    return res.status(200).json({
      ok: true,
      tracked: true,
      referral: referralEntry,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: err.errors });
    }

    console.error("❌ Error tracking referral:", err);
    return res.status(500).json({ error: err.message || "Failed to track referral" });
  }
}

