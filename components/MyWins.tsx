"use client";

import { useEffect, useState } from "react";
import { useTonWallet } from "@tonconnect/ui-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Win {
  roundId: number;
  amountTon: number;
  hash: string;
  time: number;
}

export default function MyWins({ refreshKey }: { refreshKey?: number }) {
  const wallet = useTonWallet();
  const [wins, setWins] = useState<Win[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyWins = async () => {
    if (!wallet?.account?.address) {
      setWins([]);
      return;
    }

    try {
      setLoading(true);
      console.log("🏆 Fetching my wins for:", wallet.account.address);
      const response = await fetch(
        `/api/lottery/my-wins?address=${wallet.account.address}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch wins");
      }
      const data = await response.json();
      setWins(data.wins || []);
      console.log("✅ My wins loaded:", data.total || 0, "wins");
    } catch (err: any) {
      console.error("❌ Error fetching my wins:", err);
      toast.error("Ошибка при загрузке выигрышей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWins();
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

  if (!wallet?.account?.address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="w-full max-w-md mx-auto mt-6"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-center">
          <p className="text-gray-400">Подключите кошелёк, чтобы увидеть свои выигрыши</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Мои выигрыши</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Всего: {wins.length}</span>
            <button
              onClick={fetchMyWins}
              disabled={loading}
              className="text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
            >
              {loading ? "⏳" : "🔄"}
            </button>
          </div>
        </div>

        {loading && wins.length === 0 ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : wins.length === 0 ? (
          <p className="text-center text-gray-400 py-8">У вас пока нет выигрышей</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {wins.map((win, index) => (
                <motion.div
                  key={`${win.hash}-${win.roundId}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg border border-green-500/50 bg-green-500/10 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        🏆 Выигрыш в раунде #{win.roundId}
                      </p>
                      <p className="text-xs text-gray-400">{formatTime(win.time)}</p>
                    </div>
                    <span className="text-sm font-bold text-green-300">
                      {win.amountTon.toFixed(2)} TON
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

