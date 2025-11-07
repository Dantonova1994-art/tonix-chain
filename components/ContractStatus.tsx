"use client";

import { useEffect, useState } from "react";
import { getContractBalance } from "../lib/ton";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ContractStatus({ refreshKey }: { refreshKey?: number }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<"Приём ставок" | "Розыгрыш" | "Выплата">("Приём ставок");
  const [participants, setParticipants] = useState(42); // Заглушка
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses: Array<"Приём ставок" | "Розыгрыш" | "Выплата"> = ["Приём ставок", "Розыгрыш", "Выплата"];
  const statusColors = {
    "Приём ставок": "bg-green-500/20 text-green-300 border-green-500/50",
    "Розыгрыш": "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    "Выплата": "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
  };

  const fetchBalance = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
        console.log("🔁 Обновление данных контракта...");
      }
      
      const bal = await getContractBalance(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!);
      setBalance(bal);
      
      // Определяем статус на основе баланса (заглушка логики)
      if (bal > 0 && bal < 10) {
        setStatus("Приём ставок");
        setStatusIndex(0);
      } else if (bal >= 10) {
        setStatus("Розыгрыш");
        setStatusIndex(1);
      } else {
        setStatus("Выплата");
        setStatusIndex(2);
      }
      
      console.log("✅ Contract balance updated:", bal, "TON");
    } catch (e) {
      console.error("❌ Error fetching contract balance:", e);
      if (showToast) {
        toast.error("Ошибка при получении данных контракта");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    fetchBalance();
  }, [refreshKey]);

  // Автообновление каждые 15 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBalance(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Эмуляция смены статуса каждые 30 секунд
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => {
        const next = (prev + 1) % statuses.length;
        setStatus(statuses[next]);
        console.log("🔄 Status changed to:", statuses[next]);
        return next;
      });
    }, 30000);

    return () => clearInterval(statusInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Статус контракта</h2>
          <button
            onClick={() => fetchBalance(true)}
            disabled={loading || refreshing}
            className="text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
            title="Обновить"
          >
            {refreshing ? "⏳" : "🔄"}
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Баланс */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">💰 Призовой фонд</p>
            {loading ? (
              <p className="text-2xl font-bold text-cyan-300 animate-pulse">Загрузка...</p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.p
                  key={balance}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-bold text-white"
                >
                  {balance?.toFixed(2) || "0.00"} TON
                </motion.p>
              </AnimatePresence>
            )}
            {refreshing && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-cyan-400 mt-1"
              >
                Обновление...
              </motion.p>
            )}
          </div>

          {/* Статус */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">🎯 Статус</p>
            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`inline-block px-4 py-2 rounded-full font-semibold border ${statusColors[status]}`}
              >
                {status}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Участники */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">👥 Участников</p>
            <motion.p
              key={participants}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold text-white"
            >
              {participants}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
