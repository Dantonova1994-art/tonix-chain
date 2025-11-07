"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { formatAddressShort } from "../lib/address";

interface ParsedEvent {
  type: "BUY" | "DRAW" | "CLAIM";
  from: string;
  valueTon: number;
  hash: string;
  lt: string;
  unixtime: number;
}

export default function LastDraws() {
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const lastErrorToastRef = useRef<number>(0);

  const showErrorToast = (message: string) => {
    const now = Date.now();
    if (now - lastErrorToastRef.current > 60000) {
      toast.error(message);
      lastErrorToastRef.current = now;
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      console.log("📜 Fetching lottery history...");
      const response = await fetch("/api/lottery/history");
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = await response.json();
      setEvents(data.events || []);
      setErrorCount(0);
      setRefreshInterval(30000); // Сбрасываем интервал при успехе
      console.log("✅ History loaded:", data.events?.length || 0, "events");
    } catch (err: any) {
      console.error("❌ Error fetching history:", err);
      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);
      
      // Backoff: если 2 ошибки подряд, увеличиваем интервал до 60с
      if (newErrorCount >= 2) {
        setRefreshInterval(60000);
        console.log("⚠️ Backoff: increasing refresh interval to 60s");
      }
      
      showErrorToast("Ошибка при загрузке истории");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatTime = (unixtime: number) => {
    const date = new Date(unixtime * 1000);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "BUY":
        return "🎟";
      case "DRAW":
        return "🎲";
      case "CLAIM":
        return "🏆";
      default:
        return "•";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "BUY":
        return "border-cyan-500/50 bg-cyan-500/10";
      case "DRAW":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "CLAIM":
        return "border-green-500/50 bg-green-500/10";
      default:
        return "border-gray-500/50 bg-gray-500/10";
    }
  };

  const copyAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      toast.success("Скопировано");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">История событий</h2>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
          >
            {loading ? "⏳" : "🔄"}
          </button>
        </div>

        {loading && events.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-400 py-8">История пуста</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {events.slice(0, 10).map((event, index) => (
                <motion.div
                  key={`${event.hash}-${event.lt}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${getEventColor(event.type)} backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{getEventIcon(event.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {event.type === "BUY" && (
                            <span
                              onClick={() => copyAddress(event.from)}
                              className="cursor-pointer hover:text-cyan-300"
                              title={event.from}
                            >
                              {formatAddressShort(event.from)} купил билет
                            </span>
                          )}
                          {event.type === "DRAW" && "Розыгрыш проведён"}
                          {event.type === "CLAIM" && (
                            <span
                              onClick={() => copyAddress(event.from)}
                              className="cursor-pointer hover:text-cyan-300"
                              title={event.from}
                            >
                              {formatAddressShort(event.from)} забрал приз
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{formatTime(event.unixtime)}</p>
                      </div>
                    </div>
                    {event.valueTon > 0 && (
                      <span className="text-sm font-bold text-cyan-300 ml-2">
                        {event.valueTon.toFixed(2)} TON
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
