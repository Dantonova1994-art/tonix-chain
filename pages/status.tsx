"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import { ENV, TWA } from "../lib/env";
import { formatAddressShort } from "../lib/address";
import toast from "react-hot-toast";

export default function StatusPage() {
  const [battleEntryValue, setBattleEntryValue] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [telegramData, setTelegramData] = useState<{
    initData: string | null;
    initDataUnsafe: any;
    platform: string | null;
    version: string | null;
  }>({
    initData: null,
    initDataUnsafe: null,
    platform: null,
    version: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      setTelegramData({
        initData: tg.initData || null,
        initDataUnsafe: tg.initDataUnsafe || null,
        platform: tg.platform || null,
        version: tg.version || null,
      });
    }
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} скопировано`);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Ошибка при копировании");
    }
  };

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6"
        >
          <h2 className="text-xl font-bold text-red-400 mb-4">⚔️ TON Battle</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Battle Enabled:</span>
              <span className={ENV.BATTLE_ENABLED === "true" ? "text-green-400" : "text-red-400"}>
                {ENV.BATTLE_ENABLED === "true" ? "✅ Enabled" : "❌ Disabled"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Entry Value:</span>
              <span className="text-red-300">{ENV.BATTLE_ENTRY_TON || "0.1"} TON</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">BattlePool Address:</span>
              {ENV.BATTLEPOOL_ADDRESS ? (
                <button
                  onClick={() => copyToClipboard(ENV.BATTLEPOOL_ADDRESS!, "BattlePool address")}
                  className="text-red-300 font-mono text-xs hover:text-red-200 cursor-pointer"
                  title={ENV.BATTLEPOOL_ADDRESS}
                >
                  {formatAddressShort(ENV.BATTLEPOOL_ADDRESS)}
                </button>
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </div>
            {ENV.BATTLEPOOL_ADDRESS && (ENV.BATTLEPOOL_ADDRESS.startsWith("EQAAAA") || ENV.BATTLEPOOL_ADDRESS === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") && (
              <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-300">
                ⚠️ Placeholder address — Battle coming soon
              </div>
            )}
          </div>
        </motion.div>

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

        {/* Mini App Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 text-center"
        >
          <h2 className="text-xl font-bold text-cyan-400 mb-4">🔗 Telegram Mini App</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-2">Mini App Link:</p>
              <button
                onClick={() => copyToClipboard(`https://t.me/${TWA.BOT}/app?startapp=lottery`, "Mini App Link")}
                className="bg-black/40 px-4 py-2 rounded-md text-sm text-cyan-300 font-mono hover:bg-black/60 transition-colors break-all"
              >
                https://t.me/{TWA.BOT}/app?startapp=lottery
              </button>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">GameHub Link:</p>
              <button
                onClick={() => copyToClipboard(`https://t.me/${TWA.BOT}/app?startapp=game`, "GameHub Link")}
                className="bg-black/40 px-4 py-2 rounded-md text-sm text-purple-300 font-mono hover:bg-black/60 transition-colors break-all"
              >
                https://t.me/{TWA.BOT}/app?startapp=game
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">📱 Bot Username:</p>
              <code className="text-cyan-400 text-sm">@{TWA.BOT}</code>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">🌐 App URL:</p>
              <code className="text-cyan-400 text-sm break-all">{TWA.URL}</code>
            </div>
          </div>
        </motion.div>

        {/* Telegram Debug */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-6"
        >
          <h2 className="text-xl font-bold text-yellow-400 mb-4">🔍 Telegram Debug</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Platform:</p>
              <code className="text-yellow-300 font-mono text-xs">
                {telegramData.platform || "Not detected (browser mode)"}
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Version:</p>
              <code className="text-yellow-300 font-mono text-xs">
                {telegramData.version || "N/A"}
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">initData:</p>
              <button
                onClick={() => {
                  if (telegramData.initData) {
                    copyToClipboard(telegramData.initData, "initData");
                  }
                }}
                className="block w-full bg-black/40 px-3 py-2 rounded-md text-xs text-yellow-300 font-mono break-all text-left hover:bg-black/60 transition-colors"
                disabled={!telegramData.initData}
              >
                {telegramData.initData || "Not available (open from Telegram)"}
              </button>
            </div>
            {telegramData.initDataUnsafe && (
              <div>
                <p className="text-gray-400 mb-1">User Info:</p>
                <div className="bg-black/40 px-3 py-2 rounded-md text-xs text-yellow-300 font-mono">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(telegramData.initDataUnsafe, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {!telegramData.initData && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-300">
                ⚠️ Open this page from Telegram Mini App to see initData
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
