"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import toast from "react-hot-toast";
import { getOrFetchSeed, getRandomFloat } from "../lib/fair-rng";
import { useHapticFeedback } from "../lib/hooks";
import { useSoundContext } from "./SoundProvider";

export default function GalaxyFlip() {
  const [tonConnectUI] = useTonConnectUI();
  const haptic = useHapticFeedback();
  const { play } = useSoundContext();
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"TON" | "X" | null>(null);
  const [canPlay, setCanPlay] = useState(true);
  const [seedSynced, setSeedSynced] = useState(false);
  const [betAmount] = useState(0.1); // Ставка 0.1 TON
  const [winAmount] = useState(0.2); // Выигрыш x2 = 0.2 TON

  useEffect(() => {
    getOrFetchSeed()
      .then(() => {
        setSeedSynced(true);
        toast("🌀 Fair-Seed synced", { icon: "✅", duration: 2000 });
      })
      .catch((err) => {
        console.warn("⚠️ Failed to sync fair seed:", err);
        setSeedSynced(true);
      });
  }, []);

  const handleFlip = async () => {
    if (isFlipping || !canPlay || !tonConnectUI.connected) {
      if (!tonConnectUI.connected) {
        toast.error("⚠️ Подключите кошелёк для игры");
      }
      return;
    }

    setIsFlipping(true);
    setCanPlay(false);
    setResult(null);
    play("click");

    try {
      // Отправка ставки 0.1 TON
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
            amount: toNano(betAmount).toString(),
          },
        ],
      };

      await tonConnectUI.sendTransaction(tx);
      play("success");

      // Получаем результат через Fair RNG
      const fairSeed = await getOrFetchSeed();
      const randomValue = getRandomFloat(fairSeed.seed + Date.now().toString());
      const win = randomValue > 0.5; // 50% шанс

      // Анимация flip
      setTimeout(() => {
        setResult(win ? "TON" : "X");
        setIsFlipping(false);

        if (win) {
          toast.success(`🎉 Победа! Выигрыш: ${winAmount} TON (x2)`);
          haptic("medium");
          play("success");
        } else {
          toast("💔 Проигрыш. Попробуйте ещё раз!", { icon: "🔄" });
          haptic("light");
          play("alert");
        }

        setTimeout(() => {
          setCanPlay(true);
          setResult(null);
        }, 3000);
      }, 1500);
    } catch (err: any) {
      console.error("❌ Error in GalaxyFlip:", err);
      setIsFlipping(false);
      setCanPlay(true);
      toast.error(err?.message || "Ошибка при транзакции");
      play("alert");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(123,63,251,0.3)] text-center space-y-6"
      role="region"
      aria-label="Galaxy Flip game"
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl">💫</span>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Galaxy Flip
        </h3>
      </div>
      <p className="text-gray-400">Ставка: {betAmount} TON | Выигрыш: {winAmount} TON (x2)</p>

      {!seedSynced && (
        <div className="text-sm text-yellow-400">🌀 Синхронизация Fair-Seed...</div>
      )}

      <div className="relative w-40 h-40 mx-auto">
        <AnimatePresence mode="wait">
          {isFlipping ? (
            <motion.div
              key="flipping"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full flex items-center justify-center text-6xl font-bold bg-gradient-to-br from-purple-500 to-cyan-500"
            >
              💫
            </motion.div>
          ) : result ? (
            <motion.div
              key={result}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: 180 }}
              className={`absolute inset-0 rounded-full flex items-center justify-center text-6xl font-bold ${
                result === "TON"
                  ? "bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                  : "bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
              }`}
            >
              {result === "TON" ? "💎" : "❌"}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-purple-500/50 to-cyan-500/50 border-2 border-purple-400/30"
            >
              💫
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={handleFlip}
        disabled={isFlipping || !canPlay || !seedSynced || !tonConnectUI.connected}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-500 to-cyan-600 shadow-[0_0_20px_rgba(123,63,251,0.5)] hover:shadow-[0_0_40px_rgba(123,63,251,0.8)] transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
        aria-label="Flip card"
      >
        {isFlipping ? "Переворачиваем..." : !tonConnectUI.connected ? "Подключите кошелёк" : `Играть за ${betAmount} TON`}
      </motion.button>

      {result && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xl font-bold ${result === "TON" ? "text-green-400" : "text-red-400"}`}
        >
          {result === "TON" ? "🎉 Победа!" : "💔 Проигрыш"}
        </motion.p>
      )}
    </motion.div>
  );
}

