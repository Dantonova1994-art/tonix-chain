"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTonConnectUI } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { ENV } from "../../lib/env";
import { generateSignature } from "../../lib/verify";
import BattleRoom from "./BattleRoom";

function getSecretKey(): string {
  return process.env.NEXT_PUBLIC_TONIX_SECRET_KEY || "dev-secret-key";
}

export default function BattleHub() {
  const [tonConnectUI] = useTonConnectUI();
  const [joining, setJoining] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [entryValue] = useState(parseFloat(ENV.BATTLE_ENTRY_TON || "0.1"));

  const handleJoinBattle = async () => {
    if (!tonConnectUI?.connected || !tonConnectUI.account?.address) {
      toast.error("⚠️ Подключите кошелёк");
      return;
    }

    setJoining(true);
    toast.loading("🎮 Поиск соперника...", { id: "battle-join" });

    try {
      const wallet = tonConnectUI.account.address;
      const tempMatchId = `temp-${Date.now()}`; // Временный ID, сервер вернёт реальный
      const payload = `${wallet}-${tempMatchId}`;
      const signature = generateSignature(payload, getSecretKey());

      const response = await fetch("/api/battle/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          matchId: tempMatchId,
          signature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join battle");
      }

      const data = await response.json();
      const realMatchId = data.matchId;

      // Отправляем транзакцию
      await tonConnectUI.sendTransaction(data.tx);
      toast.success("✅ Транзакция отправлена!", { id: "battle-join" });

      setMatchId(realMatchId);
      toast.success("🎮 Соперник найден! Начинаем бой!", { duration: 3000 });
    } catch (err: any) {
      console.error("❌ Error joining battle:", err);
      toast.error(`Ошибка: ${err.message}`, { id: "battle-join" });
    } finally {
      setJoining(false);
    }
  };

  if (matchId) {
    return <BattleRoom matchId={matchId} onExit={() => setMatchId(null)} />;
  }

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
        <p className="text-2xl font-bold text-cyan-300">{entryValue} TON</p>
        <p className="text-xs text-gray-500 mt-1">Победитель забирает весь банк</p>
      </div>

      <motion.button
        onClick={handleJoinBattle}
        disabled={joining || !tonConnectUI?.connected}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Join battle"
      >
        {joining ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.span>
            Поиск соперника...
          </span>
        ) : (
          "⚔️ В БОЙ!"
        )}
      </motion.button>

      {!tonConnectUI?.connected && (
        <p className="text-xs text-gray-500">Сначала подключите кошелёк</p>
      )}
    </motion.div>
  );
}

