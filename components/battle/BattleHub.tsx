"use client";

import { motion } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import React from "react";
import { ENV } from "../../lib/env";
import { useBattle } from "./hooks/useBattle";
import BattleArena from "./BattleArena";
import BattleResult from "./BattleResult";

export default function BattleHub() {
  const wallet = useTonWallet();
  const { state, joinBattle, resetBattle, winner } = useBattle();
  const enabled = ENV.BATTLE_ENABLED === "true";
  const entry = ENV.BATTLE_ENTRY_TON || "0.1";
  const pool = ENV.BATTLEPOOL_ADDRESS;

  // Если Battle отключен или адрес placeholder - показываем Coming Soon
  if (!enabled || !pool || pool.startsWith("EQAAAA") || pool === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 text-center border border-cyan-500/30 rounded-xl backdrop-blur-md bg-black/40"
      >
        <h2 className="text-xl font-semibold text-cyan-400">⚔️ TON Battle</h2>
        <p className="text-gray-400 mt-2">Coming soon... Prepare for the Arena.</p>
      </motion.div>
    );
  }

  // Если бой в процессе или завершён - показываем Arena или Result
  if (state === "fighting" || state === "matched" || state === "searching") {
    return <BattleArena />;
  }

  if (state === "finished") {
    return <BattleResult onPlayAgain={resetBattle} />;
  }

  // Основной экран - кнопка начала боя
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-center space-y-6"
    >
      <div className="text-6xl mb-4">⚔️</div>
      <h2 className="text-2xl font-bold text-red-400">TON Battle</h2>
      <p className="text-gray-400">Мультиплеерная битва на TON</p>

      <div className="p-4 rounded-lg bg-white/5 border border-gray-600">
        <p className="text-sm text-gray-400 mb-1">Ставка</p>
        <p className="text-2xl font-bold text-cyan-300">{entry} TON</p>
        <p className="text-xs text-gray-500 mt-1">Победитель забирает весь банк</p>
      </div>

      {wallet ? (
        <motion.button
          onClick={joinBattle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Start battle"
        >
          🎮 Начать бой за {entry} TON
        </motion.button>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-400">Подключи кошелёк, чтобы участвовать</p>
          <p className="text-xs text-gray-500">BattlePool: {pool ? `${pool.slice(0, 6)}...${pool.slice(-6)}` : "N/A"}</p>
        </div>
      )}
    </motion.div>
  );
}
