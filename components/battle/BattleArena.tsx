"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBattle } from "./hooks/useBattle";
import BattleAnimation from "./BattleAnimation";

export default function BattleArena() {
  const { state, playerHP, enemyHP, log, attack, rounds } = useBattle();

  const playerHPPercent = Math.max(0, (playerHP / 100) * 100);
  const enemyHPPercent = Math.max(0, (enemyHP / 100) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-[0_0_20px_rgba(239,68,68,0.3)] space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-2">⚔️ БОЙ</h2>
        {state === "searching" && (
          <p className="text-cyan-300 animate-pulse">🔍 Поиск соперника...</p>
        )}
        {state === "matched" && (
          <p className="text-yellow-300">✅ Соперник найден! Приготовьтесь...</p>
        )}
        {state === "fighting" && (
          <p className="text-green-300">⚔️ Бой идёт! Раунд {rounds + 1}</p>
        )}
      </div>

      {/* Противник */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-red-300">Противник</span>
          <span className="text-sm text-gray-400">{enemyHP} / 100 HP</span>
        </div>
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${enemyHPPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-red-600 to-red-400"
          />
        </div>
      </div>

      {/* Визуальные эффекты */}
      <BattleAnimation state={state} />

      {/* Игрок */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-cyan-300">Вы</span>
          <span className="text-sm text-gray-400">{playerHP} / 100 HP</span>
        </div>
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${playerHPPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
          />
        </div>
      </div>

      {/* Кнопка атаки (только во время боя) */}
      {state === "fighting" && (
        <motion.button
          onClick={attack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Attack"
        >
          ⚔️ АТАКОВАТЬ
        </motion.button>
      )}

      {/* Лог боя */}
      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-gray-600 max-h-48 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-2 font-semibold">Лог боя:</p>
        <div className="space-y-1">
          <AnimatePresence>
            {log.map((entry, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs ${
                  entry.type === "victory"
                    ? "text-green-400 font-bold"
                    : entry.type === "defeat"
                    ? "text-red-400 font-bold"
                    : entry.type === "player_critical" || entry.type === "enemy_critical"
                    ? "text-yellow-400 font-semibold"
                    : entry.type === "player_attack"
                    ? "text-cyan-300"
                    : "text-red-300"
                }`}
              >
                {entry.message}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

