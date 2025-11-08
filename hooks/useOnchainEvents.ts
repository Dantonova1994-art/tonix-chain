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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    try {
      // Toncenter WebSocket endpoint (fallback на REST если недоступен)
      const wsUrl = `wss://toncenter.com/api/v2/websocket`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔄 WebSocket connected");
        
        // Подписка на аккаунт
        ws.send(JSON.stringify({
          method: "subscribe_account",
          params: { address: CONTRACT_ADDRESS },
        }));

        // Пинг каждые 30 секунд
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "ping" }));
            console.log("🔄 WebSocket alive");
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.result && data.result.transactions) {
            data.result.transactions.forEach((tx: any) => {
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

                const onchainEvent: OnchainEvent = {
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

                onEvent?.(onchainEvent);
              }
            });
          }
        } catch (err) {
          console.error("❌ Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        toast.error("TON Network unreachable, retrying…", { duration: 3000 });
      };

      ws.onclose = () => {
        console.log("🔄 WebSocket closed, reconnecting in 10s...");
        
        // Авто-реконнект через 10 секунд
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 10000);
      };
    } catch (err) {
      console.error("❌ WebSocket connection failed, falling back to REST:", err);
      // Fallback на REST API polling будет вызван в useEffect
    }
  };

  const fallbackToREST = () => {
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

              const emoji = eventType === "buy" ? "💎" : eventType === "draw" ? "🎉" : "🔥";
              toast.success(`${emoji} Новое событие: ${eventType}`, { duration: 3000 });

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

    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    
    return () => clearInterval(interval);
  };

  useEffect(() => {
    let restCleanup: (() => void) | null = null;
    
    // Попытка подключения через WebSocket
    try {
      connectWebSocket();
    } catch (err) {
      // Если WebSocket недоступен, используем REST fallback
      restCleanup = fallbackToREST();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (restCleanup) {
        restCleanup();
      }
    };
  }, [onEvent]);

  return null;
}

