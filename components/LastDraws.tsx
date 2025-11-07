"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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
      console.log("✅ History loaded:", data.events?.length || 0, "events");
    } catch (err: any) {
      console.error("❌ Error fetching history:", err);
      toast.error("Ошибка при загрузке истории");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (addr: string) => {
    if (!addr) return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
            {[1, 2, 3].map((i) => (
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
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getEventIcon(event.type)}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {event.type === "BUY" && `${formatAddress(event.from)} купил билет`}
                          {event.type === "DRAW" && "Розыгрыш проведён"}
                          {event.type === "CLAIM" && `${formatAddress(event.from)} забрал приз`}
                        </p>
                        <p className="text-xs text-gray-400">{formatTime(event.unixtime)}</p>
                      </div>
                    </div>
                    {event.valueTon > 0 && (
                      <span className="text-sm font-bold text-cyan-300">
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

