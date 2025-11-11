import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const version = process.env.NEXT_PUBLIC_APP_VERSION || "5.5.0";
  
  res.status(200).json({
    version,
    build: process.env.NEXT_PUBLIC_BUILD_ID || "dev",
    timestamp: Date.now(),
  });
}

