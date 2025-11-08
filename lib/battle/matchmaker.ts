/**
 * TON Battle Matchmaker - in-memory очередь ожидания игроков
 */

import { v4 as uuidv4 } from "uuid";

export type MatchStatus = "WAITING" | "FULL" | "RESOLVED";

export interface Match {
  matchId: string;
  p1: string; // wallet address
  p2?: string; // wallet address
  entryValue: number; // в TON
  status: MatchStatus;
  winner?: string;
  createdAt: number;
  resolvedAt?: number;
}

const matches = new Map<string, Match>();
const waitingQueues = new Map<number, string[]>(); // entryValue => [matchId, ...]

export function createMatch(p1: string, entryValue: number): Match {
  const matchId = uuidv4();
  const match: Match = {
    matchId,
    p1,
    entryValue,
    status: "WAITING",
    createdAt: Date.now(),
  };
  
  matches.set(matchId, match);
  
  // Добавляем в очередь ожидания
  if (!waitingQueues.has(entryValue)) {
    waitingQueues.set(entryValue, []);
  }
  waitingQueues.get(entryValue)!.push(matchId);
  
  return match;
}

export function joinMatch(matchId: string, p2: string): Match | null {
  const match = matches.get(matchId);
  if (!match || match.status !== "WAITING" || match.p2) {
    return null;
  }
  
  match.p2 = p2;
  match.status = "FULL";
  
  // Удаляем из очереди
  const queue = waitingQueues.get(match.entryValue);
  if (queue) {
    const index = queue.indexOf(matchId);
    if (index > -1) {
      queue.splice(index, 1);
    }
  }
  
  matches.set(matchId, match);
  return match;
}

export function resolveMatch(matchId: string, winner: string): Match | null {
  const match = matches.get(matchId);
  if (!match || match.status !== "FULL") {
    return null;
  }
  
  if (match.p1 !== winner && match.p2 !== winner) {
    return null; // Победитель должен быть одним из игроков
  }
  
  match.winner = winner;
  match.status = "RESOLVED";
  match.resolvedAt = Date.now();
  
  matches.set(matchId, match);
  return match;
}

export function getMatch(matchId: string): Match | null {
  return matches.get(matchId) || null;
}

export function findWaitingMatch(entryValue: number): Match | null {
  const queue = waitingQueues.get(entryValue);
  if (!queue || queue.length === 0) {
    return null;
  }
  
  // Ищем первый матч в статусе WAITING
  for (const matchId of queue) {
    const match = matches.get(matchId);
    if (match && match.status === "WAITING" && !match.p2) {
      return match;
    }
  }
  
  return null;
}

// Очистка старых матчей (старше 1 часа)
export function cleanupOldMatches() {
  const oneHourAgo = Date.now() - 3600000;
  matches.forEach((match, matchId) => {
    if (match.createdAt < oneHourAgo && match.status === "RESOLVED") {
      matches.delete(matchId);
    }
  });
}

// Запускаем очистку каждые 10 минут
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldMatches, 600000);
}

