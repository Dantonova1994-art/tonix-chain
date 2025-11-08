"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { LEVELS, DAILY_BONUS_XP } from "../constants/game";

export default function XPPanel() {
  const { xp, levelInfo, bonusAvailable, claimDailyBonus } = useGame();

  const currentLevelData = LEVELS.find((l) => l.level === levelInfo.level) || LEVELS[0];
  const nextLevelData = LEVELS.find((l) => l.level === levelInfo.level + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(168,85,247,0.3)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent blur-xl -z-10" />

      <h2 className="text-xl font-bold text-purple-400 mb-4 text-center">Мой Прогресс</h2>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">
          Уровень: <span className="font-semibold text-white" style={{ color: currentLevelData.color }}>
            {currentLevelData.name} ({levelInfo.level})
          </span>
        </p>
        <p className="text-sm text-gray-400">
          XP: <span className="font-semibold text-white">{xp}</span>
        </p>
      </div>

      {levelInfo.nextLevelXP !== null ? (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 relative">
          <motion.div
            className="h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -mt-5 text-xs text-gray-300">
            {levelInfo.xp - currentLevelData.xp} / {levelInfo.nextLevelXP - currentLevelData.xp} XP до {nextLevelData?.name}
          </span>
        </div>
      ) : (
        <p className="text-center text-green-400 text-sm mb-4">Максимальный уровень достигнут!</p>
      )}

      <motion.button
        onClick={claimDailyBonus}
        disabled={!bonusAvailable}
        whileHover={{ scale: bonusAvailable ? 1.02 : 1 }}
        whileTap={{ scale: bonusAvailable ? 0.98 : 1 }}
        className="w-full px-6 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-400"
        aria-label={bonusAvailable ? "Claim daily bonus" : "Daily bonus already claimed"}
      >
        {bonusAvailable ? "🎁 Получить ежедневный бонус" : "✅ Бонус получен сегодня"}
      </motion.button>
    </motion.div>
  );
}
