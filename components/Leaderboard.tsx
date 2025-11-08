"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { getBoostMultiplier } from "../lib/pass";
import toast from "react-hot-toast";

interface PlayerScore {
  name: string;
  xp: number;
  timestamp: number;
  boost?: number;
}

const LEADERBOARD_KEY = "tonix_leaderboard";
const PLAYER_NAME_KEY = "tonix_player_name";

export default function Leaderboard() {
  const { xp, passLevel } = useGame();
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [newRecordPopup, setNewRecordPopup] = useState(false);
  const initialXpRef = useState(xp)[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
      if (savedLeaderboard) {
        setLeaderboard(JSON.parse(savedLeaderboard));
      }
      const savedName = localStorage.getItem(PLAYER_NAME_KEY);
      if (savedName) {
        setPlayerName(savedName);
      } else {
        setShowNameInput(true);
      }
    }
  }, []);

  useEffect(() => {
    if (xp > initialXpRef) {
      updateLeaderboard(xp);
    }
  }, [xp]);

  const updateLeaderboard = (currentXP: number) => {
    const boost = getBoostMultiplier(passLevel);
    const newScore: PlayerScore = {
      name: playerName || "Anon",
      xp: currentXP,
      timestamp: Date.now(),
      boost: Math.round((boost - 1) * 100),
    };
    
    const updatedLeaderboard = [...leaderboard, newScore]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5);

    setLeaderboard(updatedLeaderboard);
    if (typeof window !== "undefined") {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedLeaderboard));
    }

    const isNewRecord = updatedLeaderboard.some(
      (score) => score.name === newScore.name && score.xp === newScore.xp && score.timestamp === newScore.timestamp
    );
    if (isNewRecord && currentXP > initialXpRef) {
      setNewRecordPopup(true);
      setTimeout(() => setNewRecordPopup(false), 5000);
    }
  };

  const handleSaveName = () => {
    if (playerName.trim()) {
      if (typeof window !== "undefined") {
        localStorage.setItem(PLAYER_NAME_KEY, playerName.trim());
      }
      setShowNameInput(false);
      updateLeaderboard(xp);
    } else {
      toast.error("Пожалуйста, введите имя.");
    }
  };

  const boost = getBoostMultiplier(passLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-green-500/30 p-6 shadow-[0_0_20px_rgba(34,197,94,0.3)] relative overflow-hidden"
      role="region"
      aria-label="Leaderboard"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-transparent blur-xl -z-10" />

      <h2 className="text-xl font-bold text-green-400 mb-4 text-center">🏆 Leaderboard</h2>

      {showNameInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-white/5 border border-gray-600"
        >
          <p className="text-sm text-gray-400 mb-2">Введите ваше имя:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Ваше имя"
              aria-label="Player name"
            />
            <button
              onClick={handleSaveName}
              className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Save name"
            >
              Сохранить
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">Пока нет участников</p>
        ) : (
          leaderboard.map((entry, index) => (
            <motion.div
              key={`${entry.name}-${entry.timestamp}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-gray-600"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-400 w-6">#{index + 1}</span>
                <div>
                  <p className="font-semibold text-white">{entry.name}</p>
                  <p className="text-xs text-gray-400">{entry.xp} XP</p>
                </div>
              </div>
              {entry.boost !== undefined && entry.boost > 0 && (
                <span className="text-xs text-purple-300 font-semibold">+{entry.boost}% Boost</span>
              )}
            </motion.div>
          ))
        )}
      </div>

      {newRecordPopup && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center p-6">
              <p className="text-4xl mb-2">🔥</p>
              <p className="text-xl font-bold text-yellow-400">Новый уровень!</p>
              <p className="text-sm text-gray-300 mt-2">Ты вошёл в ТОП!</p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
