"use client";

import { useEffect, useState } from "react";
import { useTonWallet } from "@tonconnect/ui-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { formatAddressShort } from "../lib/address";

interface Ticket {
  type: "BUY";
  from: string;
  valueTon: number;
  hash: string;
  lt: string;
  unixtime: number;
}

export default function MyTickets({ refreshKey }: { refreshKey?: number }) {
  const wallet = useTonWallet();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyTickets = async () => {
    if (!wallet?.account?.address) {
      setTickets([]);
      return;
    }

    try {
      setLoading(true);
      console.log("🎫 Fetching my tickets for:", wallet.account.address);
      const response = await fetch(
        `/api/lottery/my-tickets?address=${wallet.account.address}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      setTickets(data.tickets || []);
      console.log("✅ My tickets loaded:", data.total || 0, "tickets");
    } catch (err: any) {
      console.error("❌ Error fetching my tickets:", err);
      toast.error("Ошибка при загрузке билетов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [wallet?.account?.address, refreshKey]);

  const formatTime = (unixtime: number) => {
    const date = new Date(unixtime * 1000);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      toast.success("Скопировано");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!wallet?.account?.address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-md mx-auto mt-6"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-center">
          <p className="text-gray-400">Подключите кошелёк, чтобы увидеть свои билеты</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Мои билеты</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Всего: {tickets.length}</span>
            <button
              onClick={fetchMyTickets}
              disabled={loading}
              className="text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
            >
              {loading ? "⏳" : "🔄"}
            </button>
          </div>
        </div>

        {loading && tickets.length === 0 ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-400 py-8">У вас пока нет билетов</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {tickets.map((ticket, index) => (
                <motion.div
                  key={`${ticket.hash}-${ticket.lt}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        🎟 Билет куплен
                      </p>
                      <p className="text-xs text-gray-400">{formatTime(ticket.unixtime)}</p>
                    </div>
                    <span className="text-sm font-bold text-cyan-300">
                      {ticket.valueTon.toFixed(2)} TON
                    </span>
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
