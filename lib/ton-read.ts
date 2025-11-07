const TONCENTER_API = process.env.NEXT_PUBLIC_TONCENTER_API || "https://toncenter.com/api/v2/jsonRPC";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "mainnet";

export interface ParsedEvent {
  type: "BUY" | "DRAW" | "CLAIM";
  from: string;
  valueTon: number;
  hash: string;
  lt: string;
  unixtime: number;
}

export async function fetchContractBalance(address: string): Promise<number> {
  if (!TONCENTER_API || !address) {
    throw new Error("TONCENTER_API or address not configured");
  }

  try {
    const response = await fetch(
      `${TONCENTER_API}/getAddressBalance?address=${address}&network=${NETWORK}`,
      {
        method: "GET",
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const balanceNano = parseInt(data.result || "0", 10);
    return balanceNano / 1e9;
  } catch (err) {
    console.error("❌ Error fetching contract balance:", err);
    throw err;
  }
}

export async function fetchRecentTx(address: string, limit: number = 30): Promise<any[]> {
  if (!TONCENTER_API || !address) {
    throw new Error("TONCENTER_API or address not configured");
  }

  try {
    const response = await fetch(TONCENTER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "getTransactions",
        params: {
          address: address,
          limit: limit,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result || [];
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    throw err;
  }
}

export function parseLotteryEvents(txs: any[]): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  
  if (!txs || txs.length === 0) {
    return events;
  }

  // Проходим по транзакциям и классифицируем их
  txs.forEach((tx) => {
    const txTime = tx.utime || 0;
    
    // Исходящие транзакции (out_msgs) - потенциально DRAW или CLAIM
    if (tx.out_msgs && tx.out_msgs.length > 0) {
      tx.out_msgs.forEach((msg: any) => {
        const valueNano = parseInt(msg.value || "0", 10);
        const valueTon = valueNano / 1e9;
        
        // Если значение 0 или очень маленькое - это DRAW
        if (valueTon === 0 || valueTon < 0.01) {
          events.push({
            type: "DRAW",
            from: tx.in_msg?.source || "",
            valueTon: 0,
            hash: tx.transaction_id.hash,
            lt: tx.transaction_id.lt,
            unixtime: txTime,
          });
        } else {
          // Иначе это CLAIM (выплата приза)
          events.push({
            type: "CLAIM",
            from: msg.destination || "",
            valueTon: parseFloat(valueTon.toFixed(2)),
            hash: tx.transaction_id.hash,
            lt: tx.transaction_id.lt,
            unixtime: txTime,
          });
        }
      });
    }
    
    // Входящие транзакции (in_msg) - это BUY
    if (tx.in_msg && tx.in_msg.source) {
      const valueNano = parseInt(tx.in_msg.value || "0", 10);
      const valueTon = valueNano / 1e9;
      
      if (valueTon > 0) {
        events.push({
          type: "BUY",
          from: tx.in_msg.source,
          valueTon: parseFloat(valueTon.toFixed(2)),
          hash: tx.transaction_id.hash,
          lt: tx.transaction_id.lt,
          unixtime: txTime,
        });
      }
    }
  });

  // Сортируем по времени (новые сначала) и убираем дубликаты
  const uniqueEvents = events.filter((event, index, self) =>
    index === self.findIndex((e) => e.hash === event.hash && e.lt === event.lt)
  );

  return uniqueEvents.sort((a, b) => b.unixtime - a.unixtime).slice(0, 10);
}
