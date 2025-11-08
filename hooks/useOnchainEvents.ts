/**
 * Хук для подписки на ончейн-события через WebSocket
 */

import { useEffect, useRef } from "react";
import { CONTRACT_ADDRESS } from "../lib/env";
import toast from "react-hot-toast";

type EventType = "buy" | "draw" | "claim";

interface OnchainEvent {
  type: EventType;
  hash: string;
  from: string;
  value?: number;
  timestamp: number;
}

export function useOnchainEvents(onEvent?: (event: OnchainEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const lastEventHashRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Используем Toncenter REST API для получения событий (WebSocket может быть недоступен)
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `https://toncenter.com/api/v2/getTransactions?address=${CONTRACT_ADDRESS}&limit=5&api_key=${process.env.NEXT_PUBLIC_TONCENTER_KEY || ""}`
        );
        const data = await response.json();
        
        if (data.ok && data.result) {
          data.result.forEach((tx: any) => {
            const hash = tx.transaction_id?.hash;
            if (hash && !lastEventHashRef.current.has(hash)) {
              lastEventHashRef.current.add(hash);
              
              // Определяем тип события
              let eventType: EventType = "buy";
              if (tx.in_msg && parseInt(tx.in_msg.value || "0", 10) > 0) {
                eventType = "buy";
              } else if (tx.out_msgs && tx.out_msgs.length > 0) {
                const outValue = parseInt(tx.out_msgs[0].value || "0", 10);
                eventType = outValue > 0 ? "claim" : "draw";
              }

              const event: OnchainEvent = {
                type: eventType,
                hash,
                from: tx.in_msg?.source || "",
                value: parseInt(tx.in_msg?.value || "0", 10) / 1e9,
                timestamp: tx.utime || Date.now() / 1000,
              };

              // Визуальный алерт
              const emoji = eventType === "buy" ? "💎" : eventType === "draw" ? "🎉" : "🔥";
              toast.success(`${emoji} Новое событие: ${eventType}`, {
                duration: 3000,
              });

              // Вибрация
              if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate(100);
              }

              onEvent?.(event);
            }
          });
        }
      } catch (err) {
        console.error("❌ Error fetching onchain events:", err);
      }
    };

    // Первая загрузка
    fetchEvents();

    // Обновление каждые 10 секунд
    const interval = setInterval(fetchEvents, 10000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onEvent]);

  return null;
}

