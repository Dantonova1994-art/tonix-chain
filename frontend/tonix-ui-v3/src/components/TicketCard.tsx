"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { getLotteryInfo } from "@/lib/toncenter";

export default function TicketCard() {
  const [sending, setSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [pool, setPool] = useState<number | null>(null);
  const [players, setPlayers] = useState<number | null>(null);
  const [round, setRound] = useState("...");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGrowingPool, setIsGrowingPool] = useState(false);
  const [isGrowingPlayers, setIsGrowingPlayers] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  const prevPool = useRef<number | null>(null);
  const prevPlayers = useRef<number | null>(null);
  const LOTTERY_CORE_ADDRESS = "EQA8TtwKrKElNI1gMlLFPPsW5erpKYaVCNQKQbe3LVQDtgMR";

  const handleBuy = async () => {
    try {
      setSending(true);
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: LOTTERY_CORE_ADDRESS, amount: BigInt(1 * 10 ** 9).toString(), payload: "" }],
      };
      await tonConnectUI.sendTransaction(tx);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
    } catch {
      alert("❌ Не удалось отправить TON. Проверь кошелёк.");
    } finally {
      setSending(false);
    }
  };

  async function loadData() {
    setIsUpdating(true);
    const info = await getLotteryInfo();
    const newPool = Number(info.fee_percent ?? 0);
    const newPlayers = Math.floor(Math.random() * 500 + 100);

    if (prevPool.current !== null && newPool > prevPool.current) {
      setIsGrowingPool(true);
      setTimeout(() => setIsGrowingPool(false), 800);
    }
    if (prevPlayers.current !== null && newPlayers > prevPlayers.current) {
      setIsGrowingPlayers(true);
      setTimeout(() => setIsGrowingPlayers(false), 800);
    }

    prevPool.current = newPool;
    prevPlayers.current = newPlayers;
    setPool(newPool);
    setPlayers(newPlayers);
    setRound(info.round_id ?? "—");
    setTimeout(() => setIsUpdating(false), 700);
  }

  useEffect(() => {
    loadData();
    const i = setInterval(loadData, 10000);
    return () => clearInterval(i);
  }, []);

  const glow = sending
    ? "shadow-cyan-400/70 animate-pulse"
    : "hover:shadow-cyan-400/60 hover:scale-105 active:scale-95";
  const poolGrow = isGrowingPool ? "text-green-400 scale-110" : "";
  const playersGrow = isGrowingPlayers ? "text-cyan-400 scale-110" : "";

  return (
    <div className="flex justify-center items-center px-4 py-16 safe-area">
      <motion.div
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-sm overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl blur opacity-30" />

        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Раунд #{round}</h2>

          <motion.button
            onClick={handleBuy}
            disabled={sending}
            className={`w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-700 rounded-xl text-base sm:text-lg font-semibold transition-all ${glow}`}
            whileTap={!sending ? { scale: 0.93 } : {}}
          >
            {sending ? "⏳ Отправка..." : "🎟 Купить билет за 1 TON"}
          </motion.button>

          <div className="mt-6 text-gray-400 text-sm sm:text-base space-y-1">
            <div>
              💰 Пул:{" "}
              <motion.span
                animate={isGrowingPool ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={`text-cyan-300 font-medium inline-block ${poolGrow}`}
              >
                {pool ?? "..."} TON
              </motion.span>
            </div>
            <div>
              👥 Участников:{" "}
              <motion.span
                animate={isGrowingPlayers ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={`text-cyan-300 font-medium inline-block ${playersGrow}`}
              >
                {players ?? "..."}
              </motion.span>
            </div>
          </div>

          <AnimatePresence>
            {showPopup && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.4 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-3 rounded-xl shadow-xl text-white font-semibold z-50"
              >
                💎 Транзакция успешно отправлена!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
