"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import { useGame } from "../context/GameContext";
import { formatAddressShort } from "../lib/address";
import toast from "react-hot-toast";

export default function Identity() {
  const wallet = useTonWallet();
  const { xp, level } = useGame();
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (wallet?.account?.address) {
      // Проверка баланса токенов TIX
      fetch("/api/dao/token")
        .then((res) => res.json())
        .then((data) => {
          // Здесь должна быть проверка баланса пользователя
          // Для демо используем mock
          const mockBalance = Math.random() * 1000;
          setTokenBalance(mockBalance);
          setHasToken(mockBalance > 0);
        })
        .catch((err) => console.error("Error fetching token balance:", err));
    }
  }, [wallet]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} скопировано`);
    } catch (err) {
      toast.error("Ошибка при копировании");
    }
  };

  if (!wallet?.account?.address) {
    return null;
  }

  const tonixId = wallet.account.address.slice(-8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-4">🆔 Identity</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">TON Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/40 px-3 py-2 rounded-md text-sm text-cyan-300 font-mono">
              {formatAddressShort(wallet.account.address)}
            </code>
            <button
              onClick={() => copyToClipboard(wallet.account.address, "Address")}
              className="px-3 py-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors text-sm"
            >
              📋
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">TONIX ID</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/40 px-3 py-2 rounded-md text-sm text-purple-300 font-mono">
              #{tonixId}
            </code>
            <button
              onClick={() => copyToClipboard(tonixId, "TONIX ID")}
              className="px-3 py-2 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors text-sm"
            >
              📋
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div>
            <p className="text-sm text-gray-400">Level</p>
            <p className="text-xl font-bold text-cyan-300">{level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">XP</p>
            <p className="text-xl font-bold text-cyan-300">{xp}</p>
          </div>
        </div>

        {hasToken && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-semibold">DAO Member</span>
              <span className="text-white">{tokenBalance.toFixed(2)} TIX</span>
            </div>
          </div>
        )}

        <a
          href={`https://tonviewer.com/${wallet.account.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-center transition-colors text-sm"
        >
          🔗 View on TonViewer
        </a>
      </div>
    </motion.div>
  );
}

