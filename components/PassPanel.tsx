"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { PASS_LEVELS, getPassLevel, getNextLevelXP, getPassNFTFromStorage } from "../lib/pass";
// import { t } from "../i18n";
import MintPassModal from "./MintPassModal";

export default function PassPanel({ onClose }: { onClose?: () => void }) {
  const { xp, passLevel, boostMultiplier } = useGame();
  const [showMintModal, setShowMintModal] = useState(false);
  const [nftId, setNftId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getPassNFTFromStorage();
    setNftId(stored);
  }, []);

  const currentPass = getPassLevel(xp);
  const nextLevelXP = getNextLevelXP(xp);
  const progress = nextLevelXP ? ((xp - currentPass.xpRequired) / (nextLevelXP - currentPass.xpRequired)) * 100 : 100;

  const levelData = PASS_LEVELS.find((l) => l.level === passLevel) || PASS_LEVELS[0];
  const glowColor = typeof levelData.color === "string" && levelData.color.includes("gradient")
    ? "from-red-500 via-yellow-500 to-purple-500"
    : levelData.color;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl border p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden"
        style={{
          borderColor: typeof glowColor === "string" ? `${glowColor}50` : "rgba(0, 255, 255, 0.3)",
        }}
      >
        <div
          className="absolute inset-0 blur-xl -z-10 opacity-30"
          style={{
            background: typeof levelData.color === "string" && levelData.color.includes("gradient")
              ? levelData.color
              : `linear-gradient(135deg, ${levelData.color}20, transparent)`,
          }}
        />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: levelData.color }}>
            🪪 TONIX PASS
          </h2>
          <p className="text-gray-400 text-sm">Уровень {passLevel}: {levelData.name}</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Прогресс до следующего уровня</span>
              <span className="text-cyan-300">{nextLevelXP ? `${nextLevelXP - xp} XP` : "Макс. уровень"}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <motion.div
                className="h-2.5 rounded-full"
                style={{
                  background: typeof levelData.color === "string" && levelData.color.includes("gradient")
                    ? levelData.color
                    : levelData.color,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-cyan-500/30">
            <p className="text-sm text-gray-400 mb-1">XP Boost</p>
            <p className="text-2xl font-bold text-cyan-300">
              +{Math.round((boostMultiplier - 1) * 100)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {boostMultiplier}x множитель для всех начислений XP
            </p>
          </div>

          {nftId ? (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50">
              <p className="text-sm text-green-300 mb-1">✅ NFT заминчен</p>
              <p className="text-xs text-gray-400 font-mono">{nftId}</p>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowMintModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300"
            >
              🎖 Минт TONIX PASS NFT
            </motion.button>
          )}
        </div>
      </motion.div>

      <MintPassModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        level={passLevel}
        onMintSuccess={(nftId) => {
          setNftId(nftId);
          setShowMintModal(false);
        }}
      />
    </>
  );
}
