"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { GAME_REWARDS } from "../constants/game";
import toast from "react-hot-toast";
import { getOrFetchSeed, getRandomInt } from "../lib/fair-rng";
import { useHapticFeedback } from "../lib/hooks";
import { captureEvent } from "../lib/analytics";

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
  const haptic = useHapticFeedback();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof SPIN_OPTIONS[0] | null>(null);
  const [rotation, setRotation] = useState(0);
  const [seedSynced, setSeedSynced] = useState(false);
  const canSpinRef = useRef(true);

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

  const handleSpin = async () => {
    if (isSpinning || !canSpinRef.current || !seedSynced) return;

    setIsSpinning(true);
    canSpinRef.current = false;
    setResult(null);

    try {
      const fairSeed = await getOrFetchSeed();
      const randomIndex = getRandomInt(fairSeed.seed + Date.now().toString(), SPIN_OPTIONS.length);
      const selected = SPIN_OPTIONS[randomIndex];
      
      const baseRotation = 360 * 5;
      const segmentAngle = 360 / SPIN_OPTIONS.length;
      const targetRotation = baseRotation + (360 - randomIndex * segmentAngle - segmentAngle / 2);

      setRotation(targetRotation);

      setTimeout(() => {
        setResult(selected);
        setIsSpinning(false);

        if (selected.xp > 0) {
          addXP(selected.xp, selected.label);
          toast.success(`🎉 ${selected.label}! +${selected.xp} XP`);
          haptic("medium");
          captureEvent("game_spin_play", { result: selected.value, xp: selected.xp });
        } else {
          toast("Попробуйте ещё раз!", { icon: "🔄" });
          captureEvent("game_spin_play", { result: selected.value, xp: 0 });
        }

        setTimeout(() => {
          canSpinRef.current = true;
          setResult(null);
        }, 2000);
      }, 3000);
    } catch (err) {
      console.error("❌ Error in GameSpin:", err);
      setIsSpinning(false);
      canSpinRef.current = true;
      toast.error("Ошибка при игре");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-center space-y-6"
      role="region"
      aria-label="Spin the Galaxy game"
    >
      <h3 className="text-2xl font-bold text-cyan-400">Spin the Galaxy</h3>
      <p className="text-gray-400">Вращайте колесо и выигрывайте призы!</p>

      {!seedSynced && (
        <div className="text-sm text-yellow-400">🌀 Синхронизация Fair-Seed...</div>
      )}

      <div className="relative mx-auto w-[300px] h-[300px]">
        <motion.div
          className="relative w-full h-full rounded-full border-4 border-cyan-500 overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          {SPIN_OPTIONS.map((option, index) => {
            const angle = (360 / SPIN_OPTIONS.length) * index;
            return (
              <div
                key={option.value}
                className="absolute inset-0"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((Math.PI * 2) / SPIN_OPTIONS.length)}% ${50 + 50 * Math.sin((Math.PI * 2) / SPIN_OPTIONS.length)}%)`,
                }}
              >
                <div className={`h-full bg-gradient-to-br ${option.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {option.label}
                </div>
              </div>
            );
          })}
        </motion.div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-500" />
      </div>

      <motion.button
        onClick={handleSpin}
        disabled={isSpinning || !seedSynced}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Spin wheel"
      >
        {isSpinning ? "Вращаем..." : "SPIN"}
      </motion.button>
    </motion.div>
  );
}
