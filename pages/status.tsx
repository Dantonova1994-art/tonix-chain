"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ENV } from "../lib/env";
import { formatAddressShort } from "../lib/address";

export default function StatusPage() {
  const [battleEntryValue, setBattleEntryValue] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const testMetadata = async (type: "ticket" | "winner", id: string) => {
    setTesting(`metadata-${type}-${id}`);
    try {
      const response = await fetch(`/api/nft/metadata/${type}/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Metadata ${type}/${id}:`, data);
        setTesting(null);
        return true;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.error(`❌ Metadata test failed:`, err);
      setTesting(null);
      return false;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0c10] to-[#121826] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">TONIX CHAIN</h1>
          <p className="text-gray-400">Страница статуса системы</p>
        </motion.div>

        {/* Конфигурация */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6"
        >
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Конфигурация</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-cyan-300">{ENV.NETWORK || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contract:</span>
              <span className="text-cyan-300 font-mono text-xs">
                {ENV.CONTRACT ? formatAddressShort(ENV.CONTRACT) : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gaming Mode:</span>
              <span className="text-cyan-300">{ENV.GAMING_MODE === "true" ? "✅" : "❌"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Battle Enabled:</span>
              <span className="text-cyan-300">{ENV.BATTLE_ENABLED === "true" ? "✅" : "❌"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">NFT Enabled:</span>
              <span className="text-cyan-300">{ENV.NFT_ENABLED === "true" ? "✅" : "❌"}</span>
            </div>
          </div>
        </motion.div>

        {/* BattlePool */}
        {ENV.BATTLE_ENABLED === "true" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6"
          >
            <h2 className="text-xl font-bold text-red-400 mb-4">⚔️ TON Battle</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">BattlePool Address:</span>
                <span className="text-red-300 font-mono text-xs">
                  {ENV.BATTLEPOOL_ADDRESS ? formatAddressShort(ENV.BATTLEPOOL_ADDRESS) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry Value:</span>
                <span className="text-red-300">{ENV.BATTLE_ENTRY_TON || "0.1"} TON</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* NFT Collections */}
        {ENV.NFT_ENABLED === "true" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6"
          >
            <h2 className="text-xl font-bold text-purple-400 mb-4">🎫 NFT Collections</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Ticket Collection:</span>
                <span className="text-purple-300 font-mono text-xs">
                  {ENV.TICKET_COLLECTION_ADDRESS ? formatAddressShort(ENV.TICKET_COLLECTION_ADDRESS) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Winner Collection:</span>
                <span className="text-purple-300 font-mono text-xs">
                  {ENV.WINNER_COLLECTION_ADDRESS ? formatAddressShort(ENV.WINNER_COLLECTION_ADDRESS) : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => testMetadata("ticket", "1")}
                disabled={testing !== null}
                className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors disabled:opacity-50 text-sm"
              >
                {testing === "metadata-ticket-1" ? "⏳" : "Test Ticket Metadata"}
              </button>
              <button
                onClick={() => testMetadata("winner", "1")}
                disabled={testing !== null}
                className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors disabled:opacity-50 text-sm"
              >
                {testing === "metadata-winner-1" ? "⏳" : "Test Winner Metadata"}
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors"
          >
            ← Вернуться на главную
          </a>
        </motion.div>
      </div>
    </main>
  );
}
