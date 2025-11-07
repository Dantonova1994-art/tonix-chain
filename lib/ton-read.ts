import { sameWallet, formatAddressShort } from "./address";

const TONCENTER_API = process.env.NEXT_PUBLIC_TONCENTER_API || "https://toncenter.com/api/v2/jsonRPC";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "mainnet";
const TONCENTER_KEY = process.env.NEXT_PUBLIC_TONCENTER_KEY || "";

export interface ParsedEvent {
  type: "BUY" | "DRAW" | "CLAIM";
  from: string;
  valueTon: number;
  hash: string;
  lt: string;
  unixtime: number;
}

export interface RoundInfo {
  currentRound: number;
  startedAt: number;
  finishedAt?: number;
}

export interface Round {
  id: number;
  start: number;
  end?: number;
  events: ParsedEvent[];
  buyCount?: number;
  claimCount?: number;
  drawCount?: number;
}

export interface RoundsData {
  rounds: Round[];
  currentRoundId: number;
}

export interface Win {
  roundId: number;
  amountTon: number;
  hash: string;
  time: number;
}

function getApiUrl(endpoint: string): string {
  const url = `${TONCENTER_API}${endpoint}`;
  if (TONCENTER_KEY) {
    const separator = endpoint.includes("?") ? "&" : "?";
    return `${url}${separator}api_key=${TONCENTER_KEY}`;
  }
  return url;
}

export async function fetchContractBalance(address: string): Promise<number> {
  if (!TONCENTER_API || !address) {
    throw new Error("TONCENTER_API or address not configured");
  }

  try {
    const url = getApiUrl(`/getAddressBalance?address=${address}&network=${NETWORK}`);
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(15000),
    });

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
    const body: any = {
      id: 1,
      jsonrpc: "2.0",
      method: "getTransactions",
      params: {
        address: address,
        limit: limit,
      },
    };

    const headers: any = { "Content-Type": "application/json" };
    if (TONCENTER_KEY) {
      body.api_key = TONCENTER_KEY;
    }

    const response = await fetch(TONCENTER_API, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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

  return uniqueEvents.sort((a, b) => b.unixtime - a.unixtime);
}

export function fetchRoundInfo(events: ParsedEvent[]): RoundInfo {
  const draws = events.filter((e) => e.type === "DRAW");
  
  if (draws.length === 0) {
    return {
      currentRound: 1,
      startedAt: events.length > 0 ? events[events.length - 1].unixtime : Math.floor(Date.now() / 1000),
    };
  }

  const lastDraw = draws[0]; // Самый свежий DRAW
  return {
    currentRound: draws.length + 1, // Следующий раунд после последнего DRAW
    startedAt: lastDraw.unixtime,
    finishedAt: lastDraw.unixtime,
  };
}

export function splitEventsByRounds(events: ParsedEvent[]): RoundsData {
  const rounds: Round[] = [];
  const draws = events.filter((e) => e.type === "DRAW").sort((a, b) => b.unixtime - a.unixtime);
  
  if (draws.length === 0) {
    // Нет DRAW - все события в текущем раунде
    const buyCount = events.filter((e) => e.type === "BUY").length;
    const claimCount = events.filter((e) => e.type === "CLAIM").length;
    
    rounds.push({
      id: 1,
      start: events.length > 0 ? events[events.length - 1].unixtime : Math.floor(Date.now() / 1000),
      events: events,
      buyCount,
      claimCount,
      drawCount: 0,
    });
    
    return {
      rounds,
      currentRoundId: 1,
    };
  }

  // Разбиваем события по раундам (от DRAW до следующего DRAW)
  let roundId = 1;
  let currentRoundStart = draws[0].unixtime;
  let currentRoundEvents: ParsedEvent[] = [];

  // События после последнего DRAW - текущий раунд
  events.forEach((event) => {
    if (event.unixtime >= currentRoundStart) {
      currentRoundEvents.push(event);
    }
  });

  const buyCount = currentRoundEvents.filter((e) => e.type === "BUY").length;
  const claimCount = currentRoundEvents.filter((e) => e.type === "CLAIM").length;
  const drawCount = currentRoundEvents.filter((e) => e.type === "DRAW").length;

  rounds.push({
    id: roundId,
    start: currentRoundStart,
    events: currentRoundEvents,
    buyCount,
    claimCount,
    drawCount,
  });

  // Предыдущие раунды (от DRAW до DRAW)
  for (let i = 0; i < draws.length - 1; i++) {
    roundId++;
    const roundStart = draws[i + 1].unixtime;
    const roundEnd = draws[i].unixtime;
    
    const roundEvents = events.filter(
      (e) => e.unixtime >= roundStart && e.unixtime < roundEnd
    );

    const rBuyCount = roundEvents.filter((e) => e.type === "BUY").length;
    const rClaimCount = roundEvents.filter((e) => e.type === "CLAIM").length;
    const rDrawCount = roundEvents.filter((e) => e.type === "DRAW").length;

    rounds.push({
      id: roundId,
      start: roundStart,
      end: roundEnd,
      events: roundEvents,
      buyCount: rBuyCount,
      claimCount: rClaimCount,
      drawCount: rDrawCount,
    });
  }

  return {
    rounds: rounds.reverse(), // Старые раунды первыми
    currentRoundId: 1,
  };
}

export function getMyWins(events: ParsedEvent[], userAddr: string): Win[] {
  if (!userAddr) return [];
  
  const wins: Win[] = [];
  const rounds = splitEventsByRounds(events);
  
  rounds.rounds.forEach((round) => {
    round.events
      .filter((e) => e.type === "CLAIM" && sameWallet(e.from, userAddr))
      .forEach((claim) => {
        wins.push({
          roundId: round.id,
          amountTon: claim.valueTon,
          hash: claim.hash,
          time: claim.unixtime,
        });
      });
  });

  return wins.sort((a, b) => b.time - a.time);
}
