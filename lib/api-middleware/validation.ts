/**
 * Валидация API запросов с помощью zod
 */

import { z } from "zod";

export const LotteryBalanceSchema = z.object({
  method: z.literal("GET"),
});

export const LotteryHistorySchema = z.object({
  method: z.literal("GET"),
});

export const LotteryMyTicketsSchema = z.object({
  method: z.literal("GET"),
  query: z.object({
    address: z.string().min(1),
  }),
});

export const LotteryMyWinsSchema = z.object({
  method: z.literal("GET"),
  query: z.object({
    address: z.string().min(1),
  }),
});

export const LotteryRoundsSchema = z.object({
  method: z.literal("GET"),
});

export const LotteryRoundSchema = z.object({
  method: z.literal("GET"),
  query: z.object({
    id: z.string(),
  }),
});

export const NFTMintSchema = z.object({
  method: z.literal("POST"),
  body: z.object({
    address: z.string().min(1),
    roundId: z.number().int().positive(),
    txHash: z.string().min(1),
    secretKey: z.string().min(1),
  }),
});

export function getClientIP(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

