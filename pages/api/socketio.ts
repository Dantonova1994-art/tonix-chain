// pages/api/socketio.ts
// API route для Socket.IO upgrade соединений

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Socket.IO будет обрабатывать upgrade через server/socket.ts
  // Этот route нужен для Next.js routing
  res.status(200).json({ ok: true, message: "Socket.IO endpoint" });
}

