"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTonConnectUI } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { generateSignature } from "../../lib/verify";
import { useHapticFeedback } from "../../lib/hooks";
import { useConfetti } from "../../lib/hooks";
import { formatAddressShort } from "../../lib/address";
import { ENV } from "../../lib/env";

function getSecretKey(): string {
  return process.env.NEXT_PUBLIC_TONIX_SECRET_KEY || "dev-secret-key";
}

interface BattleResultProps {
  matchId: string;
  winner: string;
  onPlayAgain: () => void;
}

export default function BattleResult({ matchId, winner, onPlayAgain }: BattleResultProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [minting, setMinting] = useState(false);
  const haptic = useHapticFeedback();
  const confetti = useConfetti();
  const isWinner = tonConnectUI?.account?.address?.toLowerCase() === winner.toLowerCase();
  const entryValue = parseFloat(ENV.BATTLE_ENTRY_TON || "0.1");
  const payout = entryValue * 2 * 0.95; // 95% от банка (5% на fees)

  React.useEffect(() => {
    if (isWinner) {
      confetti();
      haptic("heavy");
    }
  }, [isWinner, confetti, haptic]);

  const handleMintWinnerNFT = async () => {
    if (!tonConnectUI?.account?.address) {
      toast.error("Подключите кошелёк");
      return;
    }

    setMinting(true);
    toast.loading("🎖 Минт NFT победителя...", { id: "mint-winner" });

    try {
      const wallet = tonConnectUI.account.address;
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}`; // Mock txHash
      const payload = `${wallet}-${matchId}-${txHash}`;
      const signature = generateSignature(payload, getSecretKey());

      const response = await fetch("/api/nft/mint-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet,
          matchId,
          txHash,
          signature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mint NFT");
      }

      const data = await response.json();
      toast.success("✅ NFT победителя заминчен!", { id: "mint-winner" });
      haptic("medium");
    } catch (err: any) {
      console.error("❌ Error minting winner NFT:", err);
      toast.error(`Ошибка: ${err.message}`, { id: "mint-winner" });
    } finally {
      setMinting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-6 shadow-[0_0_20px_rgba(234,179,8,0.3)] text-center space-y-4"
    >
      <div className="text-6xl mb-4">{isWinner ? "🏆" : "😔"}</div>
      <h3 className="text-2xl font-bold text-yellow-400">
        {isWinner ? "ПОБЕДА!" : "Поражение"}
      </h3>

      <div className="p-4 rounded-lg bg-white/5 border border-gray-600">
        <p className="text-sm text-gray-400 mb-1">Победитель</p>
        <p className="text-lg font-mono text-cyan-300">{formatAddressShort(winner)}</p>
      </div>

      {isWinner && (
        <>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50">
            <p className="text-sm text-gray-400 mb-1">Выигрыш</p>
            <p className="text-2xl font-bold text-green-300">{payout.toFixed(2)} TON</p>
          </div>

          <motion.button
            onClick={handleMintWinnerNFT}
            disabled={minting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:shadow-[0_0_40px_rgba(234,179,8,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Mint winner NFT"
          >
            {minting ? "⏳ Минтится..." : "🎖 Минт NFT победителя"}
          </motion.button>
        </>
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

