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
  wallet?: string;
}

const LEADERBOARD_KEY = "tonix_leaderboard_v2";
const PLAYER_NAME_KEY = "tonix_player_name";

export default function LeaderboardV2() {
  const { xp, levelInfo, passLevel } = useGame();
  const level = levelInfo.level;
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [xpProgress, setXpProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
      if (savedLeaderboard) {
        const parsed = JSON.parse(savedLeaderboard);
        setLeaderboard(parsed);
        updatePlayerRank(parsed);
      }
      const savedName = localStorage.getItem(PLAYER_NAME_KEY);
      if (savedName) {
        setPlayerName(savedName);
      }
    }
  }, []);

  useEffect(() => {
    if (xp > 0) {
      updateLeaderboard(xp);
    }
  }, [xp]);

  useEffect(() => {
    // Расчет прогресса XP (0-100%)
    const xpForNextLevel = level * 100;
    const currentLevelXP = (level - 1) * 100;
    const progress = ((xp - currentLevelXP) / (xpForNextLevel - currentLevelXP)) * 100;
    setXpProgress(Math.min(100, Math.max(0, progress)));
  }, [xp, level]);

  const updateLeaderboard = (currentXP: number) => {
    const boost = getBoostMultiplier(passLevel);
    const newScore: PlayerScore = {
      name: playerName || "Anon",
      xp: currentXP,
      timestamp: Date.now(),
      boost: Math.round((boost - 1) * 100),
    };
    
    const allScores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    const updated = [...allScores, newScore]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10)
      .map((score, index) => ({ ...score, rank: index + 1 }));

    setLeaderboard(updated);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    updatePlayerRank(updated);
  };

  const updatePlayerRank = (scores: PlayerScore[]) => {
    const playerScore = scores.find((s) => s.name === playerName || s.xp === xp);
    if (playerScore) {
      const rank = scores.findIndex((s) => s.xp === playerScore.xp) + 1;
      setPlayerRank(rank);
    }
  };

  const handleShareRank = () => {
    const shareText = `🏆 Мой рейтинг в TONIX CHAIN:\n\nУровень: ${level}\nXP: ${xp}\nРейтинг: #${playerRank || "—"}\n\nПрисоединяйся: https://t.me/tonixchain_lottery_bot/app?startapp=lottery`;
    
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareText)}`);
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Рейтинг скопирован!");
    }
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "from-yellow-400 to-yellow-600"; // Gold
    if (index === 1) return "from-gray-300 to-gray-500"; // Silver
    if (index === 2) return "from-orange-400 to-orange-600"; // Bronze
    return "from-cyan-400 to-blue-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent blur-xl -z-10" />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          🏆 Rating
        </h2>
        <button
          onClick={handleShareRank}
          className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors text-sm"
        >
          Share Rank
        </button>
      </div>

      {/* Твой рейтинг */}
      {playerRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50"
        >
          <p className="text-sm text-gray-400 mb-1">Your Rank</p>
          <p className="text-3xl font-bold text-cyan-400">#{playerRank}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Level {level}</span>
              <span>{xp} XP</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Топ-3 */}
      <div className="space-y-3 mb-4">
        {leaderboard.slice(0, 3).map((entry, index) => (
          <motion.div
            key={`${entry.name}-${entry.timestamp}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl bg-gradient-to-r ${getRankColor(index)}/20 border-2 border-${index === 0 ? "yellow" : index === 1 ? "gray" : "orange"}-400/50`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </span>
                <div>
                  <p className="font-bold text-white">{entry.name}</p>
                  <p className="text-sm text-gray-300">{entry.xp} XP</p>
                </div>
              </div>
              {entry.boost && entry.boost > 0 && (
                <span className="text-xs text-purple-300 font-semibold">+{entry.boost}%</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Остальные места */}
      {leaderboard.length > 3 && (
        <div className="space-y-2">
          {leaderboard.slice(3).map((entry, index) => (
            <motion.div
              key={`${entry.name}-${entry.timestamp}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + 3) * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-gray-600/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400 w-6">#{index + 4}</span>
                <div>
                  <p className="font-semibold text-white">{entry.name}</p>
                  <p className="text-xs text-gray-400">{entry.xp} XP</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {leaderboard.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">Пока нет участников</p>
      )}
    </motion.div>
  );
}

