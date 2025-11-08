"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GameFlip from "./GameFlip";
import GameCatch from "./GameCatch";
import GameSpin from "./GameSpin";
import XPPanel from "./XPPanel";
import Leaderboard from "./Leaderboard";

type GameView = "hub" | "flip" | "catch" | "spin";

export default function GameHub({ onClose }: { onClose: () => void }) {
  const [currentView, setCurrentView] = useState<GameView>("hub");

  const games = [
    { id: "flip" as GameView, name: "Flip & Win", icon: "🎲" },
    { id: "catch" as GameView, name: "Catch TONs", icon: "💎" },
    { id: "spin" as GameView, name: "Spin the Galaxy", icon: "🎰" },
  ];

  const renderGame = () => {
    switch (currentView) {
      case "flip":
        return <GameFlip />;
      case "catch":
        return <GameCatch />;
      case "spin":
        return <GameSpin />;
      default:
        return null;
    }
  };

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
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            🏠
          </motion.button>
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
            {games.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => setCurrentView(game.id)}
                className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-md border border-cyan-500/30 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{game.icon}</span>
                  <span className="text-lg font-semibold text-white">{game.name}</span>
                </div>
                <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">→</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <button
              onClick={() => setCurrentView("hub")}
              className="mb-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              ← Назад
            </button>
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {renderGame()}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
