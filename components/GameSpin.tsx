"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { GAME_REWARDS } from "../constants/game";
import toast from "react-hot-toast";

const SPIN_OPTIONS = [
  { label: "TON Bonus", value: "bonus", color: "from-yellow-500 to-orange-600", xp: GAME_REWARDS.SPIN_BONUS },
  { label: "NFT Ticket", value: "nft", color: "from-purple-500 to-pink-600", xp: 0 },
  { label: "Try again", value: "again", color: "from-gray-500 to-gray-700", xp: 0 },
  { label: "TON Bonus", value: "bonus2", color: "from-yellow-500 to-orange-600", xp: GAME_REWARDS.SPIN_BONUS },
  { label: "XP Boost", value: "xp", color: "from-green-500 to-emerald-600", xp: 10 },
  { label: "Try again", value: "again2", color: "from-gray-500 to-gray-700", xp: 0 },
];

export default function GameSpin() {
  const { addXP } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof SPIN_OPTIONS[0] | null>(null);
  const [rotation, setRotation] = useState(0);
  const canSpinRef = useRef(true);

  const handleSpin = () => {
    if (isSpinning || !canSpinRef.current) return;

    setIsSpinning(true);
    canSpinRef.current = false;
    setResult(null);

    // Случайный результат
    const randomIndex = Math.floor(Math.random() * SPIN_OPTIONS.length);
    const selected = SPIN_OPTIONS[randomIndex];
    
    // Вращение: базовое + несколько полных оборотов + позиция результата
    const baseRotation = 360 * 5; // 5 полных оборотов
    const segmentAngle = 360 / SPIN_OPTIONS.length;
    const targetRotation = baseRotation + (360 - randomIndex * segmentAngle - segmentAngle / 2);

    setRotation(targetRotation);

    setTimeout(() => {
      setResult(selected);
      setIsSpinning(false);

      if (selected.xp > 0) {
        addXP(selected.xp, selected.label);
        toast.success(`🎉 ${selected.label}! +${selected.xp} XP`);
        
        // Вибрация
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([50, 30, 50]);
        }
      } else if (selected.value === "nft") {
        toast.success("🎫 NFT Ticket разблокирован!");
      } else {
        toast("Попробуйте ещё раз!", { icon: "🔄" });
      }

      setTimeout(() => {
        canSpinRef.current = true;
        setResult(null);
      }, 3000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Spin the Galaxy</h3>
      
      <div className="flex flex-col items-center space-y-6">
        {/* Колесо */}
        <div className="relative w-64 h-64">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="w-full h-full rounded-full relative overflow-hidden border-4 border-cyan-500/50"
            style={{ transformOrigin: "center" }}
          >
            {SPIN_OPTIONS.map((option, index) => {
              const angle = (360 / SPIN_OPTIONS.length) * index;
              return (
                <div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI / SPIN_OPTIONS.length)}% ${50 - 50 * Math.sin(Math.PI / SPIN_OPTIONS.length)}%)`,
                  }}
                >
                  <div
                    className={`w-full h-full bg-gradient-to-br ${option.color} flex items-center justify-center text-xs font-bold text-white p-2`}
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {option.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
          
          {/* Указатель */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-cyan-400" />
        </div>

        {/* Результат */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border ${
              result.xp > 0
                ? "bg-green-500/20 border-green-500/50 text-green-300"
                : "bg-gray-500/20 border-gray-500/50 text-gray-300"
            }`}
          >
            <p className="text-center font-semibold">{result.label}</p>
          </motion.div>
        )}

        {/* Кнопка */}
        <motion.button
          onClick={handleSpin}
          disabled={isSpinning || !canSpinRef.current}
          whileHover={{ scale: canSpinRef.current ? 1.05 : 1 }}
          whileTap={{ scale: canSpinRef.current ? 0.95 : 1 }}
          className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? "⏳ Вращается..." : canSpinRef.current ? "🎰 SPIN" : "⏳ Ожидание..."}
        </motion.button>
      </div>
    </motion.div>
  );
}

