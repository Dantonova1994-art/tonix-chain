"use client";

import React from "react";
import { motion } from "framer-motion";
import { useBattle } from "./hooks/useBattle";
import { useConfetti, useHapticFeedback } from "../../lib/hooks";
import { ENV } from "../../lib/env";

interface BattleResultProps {
  onPlayAgain: () => void;
}

export default function BattleResult({ onPlayAgain }: BattleResultProps) {
  const { winner, playerHP, enemyHP, rounds } = useBattle();
  const confetti = useConfetti();
  const haptic = useHapticFeedback();
  const entryValue = parseFloat(ENV.BATTLE_ENTRY_TON || "0.1");
  const payout = winner === "player" ? entryValue * 2 * 0.95 : 0; // 95% от банка (5% на fees)

  React.useEffect(() => {
    if (winner === "player") {
      confetti();
      haptic("heavy");
    } else if (winner === "enemy") {
      haptic("medium");
    }
  }, [winner, confetti, haptic]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-6 shadow-[0_0_20px_rgba(234,179,8,0.3)] text-center space-y-4"
    >
      <div className="text-6xl mb-4">{winner === "player" ? "🏆" : "😔"}</div>
      <h3 className="text-2xl font-bold text-yellow-400">
        {winner === "player" ? "ПОБЕДА!" : "Поражение"}
      </h3>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 rounded-lg bg-white/5 border border-gray-600">
          <p className="text-xs text-gray-400 mb-1">Ваш HP</p>
          <p className="text-lg font-bold text-cyan-300">{playerHP} / 100</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-gray-600">
          <p className="text-xs text-gray-400 mb-1">Противник HP</p>
          <p className="text-lg font-bold text-red-300">{enemyHP} / 100</p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-white/5 border border-gray-600">
        <p className="text-xs text-gray-400 mb-1">Раундов сыграно</p>
        <p className="text-xl font-bold text-white">{rounds}</p>
      </div>

      {winner === "player" && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50">
          <p className="text-sm text-gray-400 mb-1">Выигрыш</p>
          <p className="text-2xl font-bold text-green-300">{payout.toFixed(2)} TON</p>
          <p className="text-xs text-gray-500 mt-1">Транзакция отправлена автоматически</p>
        </div>
      )}

      <motion.button
        onClick={onPlayAgain}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Play again"
      >
        Играть снова
      </motion.button>
    </motion.div>
  );
}
