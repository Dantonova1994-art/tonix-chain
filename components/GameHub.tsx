"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameFlip from "./GameFlip";
import GameCatch from "./GameCatch";
import GameSpin from "./GameSpin";
import XPPanel from "./XPPanel";
import Leaderboard from "./Leaderboard";
import PassPanel from "./PassPanel";
import BattleHub from "./battle/BattleHub";
import { ENV } from "../lib/env";

type GameView = "hub" | "flip" | "catch" | "spin" | "pass" | "battle";

export default function GameHub({ onClose }: { onClose: () => void }) {
  const [currentView, setCurrentView] = useState<GameView>("hub");
  const battleEnabled = ENV.BATTLE_ENABLED === "true";

  const games = [
    { id: "flip" as GameView, name: "Flip & Win", icon: "🎲", component: GameFlip },
    { id: "catch" as GameView, name: "Catch TONs", icon: "💎", component: GameCatch },
    { id: "spin" as GameView, name: "Spin the Galaxy", icon: "🎰", component: GameSpin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-gradient-to-b from-[#0b0c10] to-[#121826] text-white p-6"
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            🎮 Игровая Арена TONIX
          </motion.h1>
          <div className="flex gap-2">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setCurrentView("pass")}
              className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-purple-300"
              aria-label="TONIX PASS"
              title="TONIX PASS"
            >
              🪪
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Home"
            >
              🏠
            </motion.button>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-400 mb-6"
        >
          Выиграй бонусы TON!
        </motion.p>

        {/* XP Panel */}
        {currentView === "hub" && <XPPanel />}

        {/* Leaderboard */}
        {currentView === "hub" && <Leaderboard />}

        {/* Games */}
        {currentView === "hub" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Mini Games</h2>
            
            {/* TON Battle */}
            {battleEnabled && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => setCurrentView("battle")}
                className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-md border border-red-500/30 hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="TON Battle"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">⚔️</span>
                  <span className="text-lg font-semibold text-white">TON Battle</span>
                </div>
                <span className="text-red-400 group-hover:text-red-300 transition-colors">→</span>
              </motion.button>
            )}

            {games.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => setCurrentView(game.id)}
                className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-md border border-cyan-500/30 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label={game.name}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{game.icon}</span>
                  <span className="text-lg font-semibold text-white">{game.name}</span>
                </div>
                <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">→</span>
              </motion.button>
            ))}
          </motion.div>
        ) : currentView === "pass" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <button
              onClick={() => setCurrentView("hub")}
              className="mb-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Back"
            >
              ← Назад
            </button>
            <PassPanel onClose={() => setCurrentView("hub")} />
          </motion.div>
        ) : currentView === "battle" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <button
              onClick={() => setCurrentView("hub")}
              className="mb-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Back"
            >
              ← Назад
            </button>
            <BattleHub />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <button
              onClick={() => setCurrentView("hub")}
              className="mb-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Back"
            >
              ← Назад
            </button>
            {(() => {
              const GameComponent = games.find((g) => g.id === currentView)?.component;
              return GameComponent ? <GameComponent /> : null;
            })()}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
