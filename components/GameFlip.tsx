"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { GAME_REWARDS } from "../constants/game";
import toast from "react-hot-toast";

export default function GameFlip() {
  const { addXP } = useGame();
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [canPlay, setCanPlay] = useState(true);

  const handleFlip = () => {
    if (isFlipping || !canPlay) return;

    setIsFlipping(true);
    setCanPlay(false);
    setResult(null);

    // Анимация вращения (1.5 секунды)
    setTimeout(() => {
      const win = Math.random() > 0.5; // 50% шанс выигрыша
      setResult(win ? "heads" : "tails");
      setIsFlipping(false);

      if (win) {
        addXP(GAME_REWARDS.FLIP_WIN, "Flip & Win");
        toast.success("💎 Победа! +1 XP");
        
        // Вибрация
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(50);
        }
      } else {
        toast("Попробуйте ещё раз!", { icon: "🔄" });
      }

      setTimeout(() => {
        setCanPlay(true);
        setResult(null);
      }, 2000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Flip & Win</h3>
      
      <div className="flex flex-col items-center space-y-6">
        {/* Монета */}
        <div className="relative w-32 h-32 perspective-1000">
          <motion.div
            animate={{
              rotateY: isFlipping ? 1800 : result === "heads" ? 0 : result === "tails" ? 180 : 0,
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full relative preserve-3d"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Лицевая сторона (💎) */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(0,255,255,0.6)] backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              💎
            </div>
            {/* Обратная сторона (TON) */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-4xl font-bold text-white backface-hidden"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              TON
            </div>
          </motion.div>
        </div>

        {/* Кнопка */}
        <motion.button
          onClick={handleFlip}
          disabled={!canPlay || isFlipping}
          whileHover={{ scale: canPlay ? 1.05 : 1 }}
          whileTap={{ scale: canPlay ? 0.95 : 1 }}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFlipping ? "⏳ Вращается..." : canPlay ? "🎲 Подбросить" : "⏳ Ожидание..."}
        </motion.button>

        {/* Результат */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`text-center p-4 rounded-lg ${
                result === "heads"
                  ? "bg-green-500/20 border border-green-500/50 text-green-300"
                  : "bg-gray-500/20 border border-gray-500/50 text-gray-300"
              }`}
            >
              {result === "heads" ? "💎 Победа!" : "Попробуйте ещё раз"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

