"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { GAME_REWARDS } from "../constants/game";
import toast from "react-hot-toast";
import { getOrFetchSeed, getRandomFloat } from "../lib/fair-rng";
import { useHapticFeedback } from "../lib/hooks";
import { captureEvent } from "../lib/analytics";

export default function GameFlip() {
  const { addXP } = useGame();
  const haptic = useHapticFeedback();
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [canPlay, setCanPlay] = useState(true);
  const [seedSynced, setSeedSynced] = useState(false);

  useEffect(() => {
    // Синхронизация seed при монтировании
    getOrFetchSeed()
      .then(() => {
        setSeedSynced(true);
        toast("🌀 Fair-Seed synced", { icon: "✅", duration: 2000 });
      })
      .catch((err) => {
        console.warn("⚠️ Failed to sync fair seed:", err);
        setSeedSynced(true); // Разрешаем игру даже при ошибке
      });
  }, []);

  const handleFlip = async () => {
    if (isFlipping || !canPlay) return;

    setIsFlipping(true);
    setCanPlay(false);
    setResult(null);

    try {
      // Получаем новый seed для честного результата
      const fairSeed = await getOrFetchSeed();
      const randomValue = getRandomFloat(fairSeed.seed + Date.now().toString());
      const win = randomValue > 0.5; // 50% шанс

      // Анимация вращения (1.5 секунды)
      setTimeout(() => {
        setResult(win ? "heads" : "tails");
        setIsFlipping(false);

        if (win) {
          addXP(GAME_REWARDS.FLIP_WIN, "Flip & Win");
          toast.success("💎 Победа! +1 XP");
          haptic("light");
          captureEvent("game_flip_play", { result: "win" });
        } else {
          toast("Попробуйте ещё раз!", { icon: "🔄" });
          captureEvent("game_flip_play", { result: "lose" });
        }

        setTimeout(() => {
          setCanPlay(true);
          setResult(null);
        }, 2000);
      }, 1500);
    } catch (err) {
      console.error("❌ Error in GameFlip:", err);
      setIsFlipping(false);
      setCanPlay(true);
      toast.error("Ошибка при игре");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-center space-y-6"
      role="region"
      aria-label="Flip & Win game"
    >
      <h3 className="text-2xl font-bold text-cyan-400">Flip & Win</h3>
      <p className="text-gray-400">Испытайте удачу! 50% шанс на победу.</p>

      {!seedSynced && (
        <div className="text-sm text-yellow-400">🌀 Синхронизация Fair-Seed...</div>
      )}

      <div className="relative w-32 h-32 mx-auto">
        <motion.div
          className={`absolute inset-0 rounded-full flex items-center justify-center text-5xl font-bold ${
            result === "heads"
              ? "bg-gradient-to-br from-green-400 to-green-600"
              : result === "tails"
              ? "bg-gradient-to-br from-red-400 to-red-600"
              : "bg-gradient-to-br from-cyan-400 to-blue-600"
          }`}
          animate={isFlipping ? { rotateY: 360 } : { rotateY: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {result === "heads" ? "💎" : result === "tails" ? "❌" : "TON"}
        </motion.div>
      </div>

      <motion.button
        onClick={handleFlip}
        disabled={isFlipping || !canPlay || !seedSynced}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Flip coin"
      >
        {isFlipping ? "Переворачиваем..." : "Перевернуть монету"}
      </motion.button>
    </motion.div>
  );
}
