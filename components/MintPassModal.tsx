"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { generateSignature } from "../lib/verify";
import { setPassNFTInStorage } from "../lib/pass";
import { useGame } from "../context/GameContext";
import { NFT_MINT_XP } from "../constants/game";
import { captureEvent } from "../lib/analytics";
import { useHapticFeedback } from "../lib/hooks";

interface MintPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  onMintSuccess: (nftId: string) => void;
}

function getSecretKey(): string {
  return process.env.NEXT_PUBLIC_TONIX_SECRET_KEY || "dev-secret-key";
}

export default function MintPassModal({ isOpen, onClose, level, onMintSuccess }: MintPassModalProps) {
  const wallet = useTonWallet();
  const { addXP } = useGame();
  const haptic = useHapticFeedback();
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!wallet?.account?.address) {
      toast.error("Подключите кошелёк");
      return;
    }

    setMinting(true);
    toast.loading("🪙 NFT TONIX PASS минтится…", { id: "mint-pass" });

    try {
      const walletAddress = wallet.account.address;
      const payload = `${walletAddress}-${level}`;
      const signature = generateSignature(payload, getSecretKey());

      const response = await fetch("/api/pass/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          level,
          signature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mint NFT");
      }

      const data = await response.json();
      setPassNFTInStorage(data.nftId);
      addXP(NFT_MINT_XP, "NFT TONIX PASS mint");
      haptic("heavy");

      toast.success("✅ NFT TONIX PASS готово!", { id: "mint-pass" });
      captureEvent("nft_pass_minted", {
        level,
        nftId: data.nftId,
        wallet: walletAddress,
      });

      onMintSuccess(data.nftId);
    } catch (err: any) {
      console.error("❌ Error minting TONIX PASS:", err);
      toast.error(`Ошибка: ${err.message}`, { id: "mint-pass" });
    } finally {
      setMinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_40px_rgba(0,255,255,0.5)] max-w-md w-full z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10 rounded-2xl" />

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">Минт TONIX PASS</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-6xl mb-4">🪪</div>
              <p className="text-lg text-gray-300 mb-2">TONIX PASS Level {level}</p>
              <p className="text-sm text-gray-400">
                Заминтите уникальный NFT-пасс для получения бустов XP!
              </p>
            </div>

            {wallet?.account?.address && (
              <div className="p-3 rounded-lg border border-gray-500/50 bg-white/5 text-sm">
                <p className="text-gray-400">Ваш кошелёк:</p>
                <p className="text-cyan-300 font-mono text-xs break-all">
                  {wallet.account.address}
                </p>
              </div>
            )}

            <motion.button
              onClick={handleMint}
              disabled={minting || !wallet?.account?.address}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {minting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.span>
                  Минтится...
                </span>
              ) : (
                <span>🎖 Минт TONIX PASS NFT</span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
