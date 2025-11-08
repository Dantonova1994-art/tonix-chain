"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { STORAGE_KEYS } from "../constants/game";
import toast from "react-hot-toast";

interface LeaderboardEntry {
  username: string;
  xp: number;
  level: number;
}

export default function Leaderboard() {
  const { xp, level } = useGame();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [username, setUsername] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    const savedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      setShowInput(true);
    }
  }, []);

  useEffect(() => {
    if (username && xp > 0) {
      updateLeaderboard();
    }
  }, [xp, username]);

  const loadLeaderboard = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (saved) {
      try {
        const entries = JSON.parse(saved) as LeaderboardEntry[];
        setLeaderboard(entries.sort((a, b) => b.xp - a.xp).slice(0, 5));
      } catch (e) {
        console.error("Error loading leaderboard:", e);
      }
    }
  };

  const updateLeaderboard = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    let entries: LeaderboardEntry[] = saved ? JSON.parse(saved) : [];
    
    const existingIndex = entries.findIndex((e) => e.username === username);
    const entry: LeaderboardEntry = { username, xp, level };

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    entries = entries.sort((a, b) => b.xp - a.xp).slice(0, 5);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries));
    setLeaderboard(entries);

    // Проверка на новый рекорд
    if (entries[0]?.username === username && entries[0]?.xp === xp) {
      toast.success("🔥 Новый уровень! Ты вошёл в ТОП!");
    }
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      localStorage.setItem(STORAGE_KEYS.USERNAME, username);
      setShowInput(false);
      updateLeaderboard();
      toast.success(`Добро пожаловать, ${username}!`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">🏆 Лидерборд</h3>

        {/* Ввод имени */}
        {showInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg border border-cyan-500/50 bg-cyan-500/10"
          >
            <p className="text-sm text-gray-400 mb-2">Введите ваше имя:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUsernameSubmit()}
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="Ваше имя"
                maxLength={20}
              />
              <button
                onClick={handleUsernameSubmit}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}

        {/* Таблица лидеров */}
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-400 py-4">Пока нет участников</p>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  entry.username === username
                    ? "border-cyan-500 bg-cyan-500/20"
                    : "border-gray-500/50 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-cyan-300 w-8">#{index + 1}</span>
                  <div>
                    <p className="text-white font-semibold">{entry.username}</p>
                    <p className="text-xs text-gray-400">Уровень {entry.level}</p>
                  </div>
                </div>
                <span className="text-cyan-300 font-bold">{entry.xp} XP</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

