"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { getXPProgress } from "../constants/game";

export default function XPPanel() {
  const { xp, level, levelName, bonusAvailable, claimDailyBonus } = useGame();
  const progress = getXPProgress(xp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-cyan-400">Уровень {level}</h3>
            <p className="text-sm text-gray-400">{levelName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{xp}</p>
            <p className="text-xs text-gray-400">XP</p>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{progress.current} / {progress.next}</span>
            <span>{progress.percentage.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]"
            />
          </div>
        </div>

        {/* Ежедневный бонус */}
        {bonusAvailable && (
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={claimDailyBonus}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow-[0_0_20px_rgba(255,193,7,0.5)] hover:shadow-[0_0_30px_rgba(255,193,7,0.8)] transition-all duration-300"
          >
            🎁 Получить ежедневный бонус
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

