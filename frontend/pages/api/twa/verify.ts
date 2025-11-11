import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { initData } = req.query;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

  if (!initData) return res.status(400).json({ error: "Missing initData" });

  try {
    const params = new URLSearchParams(initData as string);
    const hash = params.get("hash");
    params.delete("hash");

    const dataCheckString = Array.from(params.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(BOT_TOKEN)
      .digest();
    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computedHash !== hash) throw new Error("Invalid initData");
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(403).json({ error: e.message });
  }
}

