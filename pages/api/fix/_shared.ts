import type { NextApiRequest, NextApiResponse } from "next";

export async function tonFetch(method: string, params: any[] = []) {
  const endpoint = process.env.NEXT_PUBLIC_TONCENTER || process.env.NEXT_PUBLIC_TONCENTER_RPC || "https://toncenter.com/api/v2/jsonRPC";
  
  // Убеждаемся, что endpoint заканчивается на /jsonRPC
  const rpcUrl = endpoint.includes('/jsonRPC') ? endpoint : `${endpoint}/jsonRPC`;

  const body = { jsonrpc: "2.0", id: 1, method, params };

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NEXT_PUBLIC_TONCENTER_API_KEY && {
          "X-API-Key": process.env.NEXT_PUBLIC_TONCENTER_API_KEY,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`TON RPC error ${res.status}`);

    const data = await res.json();
    
    // Проверяем на ошибки в ответе
    if (data.error) {
      throw new Error(data.error.message || "TON RPC error");
    }
    
    return data;
  } catch (err: any) {
    console.error("[TonFetchError]", err.message);
    return { ok: false, error: err.message };
  }
}

export function respond(res: NextApiResponse, data: any, status = 200) {
  res.status(status).json(data);
}

