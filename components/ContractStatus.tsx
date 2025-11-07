"use client";

import { useEffect, useState } from "react";
import { getContractBalance } from "../lib/ton";
import { motion } from "framer-motion";

export default function ContractStatus({ refreshKey }: { refreshKey?: number }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"Приём ставок" | "Розыгрыш" | "Выплата">("Приём ставок");
  const [participants, setParticipants] = useState(42); // Заглушка

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log("💰 Fetching contract balance...");
        const bal = await getContractBalance(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!);
        setBalance(bal);
        
        // Определяем статус на основе баланса (заглушка логики)
        if (bal > 0 && bal < 10) {
          setStatus("Приём ставок");
        } else if (bal >= 10) {
          setStatus("Розыгрыш");
        } else {
          setStatus("Выплата");
        }
        
        console.log("✅ Contract balance updated:", bal, "TON");
      } catch (e) {
        console.error("❌ Error fetching contract balance:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
        <h2 className="text-xl font-bold mb-4 text-cyan-400 text-center">Статус контракта</h2>
        
        <div className="space-y-4">
          {/* Баланс */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Призовой фонд</p>
            {loading ? (
              <p className="text-2xl font-bold text-cyan-300 animate-pulse">Загрузка...</p>
            ) : (
              <motion.p
                key={balance}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-white"
              >
                {balance?.toFixed(2) || "0.00"} TON
              </motion.p>
            )}
          </div>

          {/* Статус */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Статус</p>
            <motion.span
              key={status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/50"
            >
              {status}
            </motion.span>
          </div>

          {/* Участники */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Участников</p>
            <p className="text-xl font-bold text-white">{participants}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
