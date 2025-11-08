"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { GAME_REWARDS } from "../constants/game";
import toast from "react-hot-toast";
import { useHapticFeedback } from "../lib/hooks";
import { getOrFetchSeed, getRandomInt } from "../lib/fair-rng";
import { captureEvent } from "../lib/analytics";

interface Coin {
  id: number;
  x: number;
  y: number;
  speed: number;
}

const MAX_COINS_PER_ROUND = 25;

function GameCatchComponent() {
  const { addXP } = useGame();
  const haptic = useHapticFeedback();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coinsSpawned, setCoinsSpawned] = useState(0);
  const [seedSynced, setSeedSynced] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const coinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    getOrFetchSeed()
      .then(() => {
        setSeedSynced(true);
        toast("🌀 Fair-Seed synced", { icon: "✅", duration: 2000 });
      })
      .catch((err) => {
        console.warn("⚠️ Failed to sync fair seed:", err);
        setSeedSynced(true);
      });
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const startGame = useCallback(async () => {
    if (!seedSynced) {
      toast.error("🌀 Дождитесь синхронизации Fair-Seed");
      return;
    }

    setIsPlaying(true);
    setTimeLeft(10);
    setScore(0);
    setCoins([]);
    setCoinsSpawned(0);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    coinIntervalRef.current = setInterval(async () => {
      if (gameAreaRef.current && coinsSpawned < MAX_COINS_PER_ROUND && isVisibleRef.current) {
        try {
          const fairSeed = await getOrFetchSeed();
          const randomX = getRandomInt(fairSeed.seed + Date.now().toString() + coinsSpawned, 80) + 10;
          const randomSpeed = 2 + getRandomInt(fairSeed.seed + Date.now().toString() + coinsSpawned + 100, 20) / 10;
          
          const newCoin: Coin = {
            id: Date.now() + Math.random(),
            x: randomX,
            y: -10,
            speed: randomSpeed,
          };
          setCoins((prev) => [...prev, newCoin]);
          setCoinsSpawned((prev) => prev + 1);
        } catch (err) {
          console.warn("⚠️ Failed to generate fair coin position:", err);
        }
      }
    }, 800);
  }, [coinsSpawned, seedSynced]);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (score > 0) {
      const xpEarned = score * GAME_REWARDS.CATCH_COIN;
      addXP(xpEarned, `Catch TONs: ${score} монет`);
      toast.success(`🎉 Поймано ${score} монет! +${xpEarned} XP`);
      haptic("medium");
      captureEvent("game_catch_play", { score, xp: xpEarned });
    } else {
      toast("Попробуйте ещё раз!", { icon: "🔄" });
      captureEvent("game_catch_play", { score: 0, xp: 0 });
    }
    
    setTimeout(() => {
      setCoins([]);
      setCoinsSpawned(0);
    }, 2000);
  }, [score, addXP, haptic]);

  const catchCoin = useCallback((coinId: number) => {
    if (!isPlaying) return;
    
    setCoins((prev) => prev.filter((c) => c.id !== coinId));
    setScore((prev) => prev + 1);
    haptic("light");
  }, [isPlaying, haptic]);

  // Анимация падения монет через requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !isVisibleRef.current) return;

    const animate = () => {
      setCoins((prev) =>
        prev
          .map((coin) => ({
            ...coin,
            y: coin.y + coin.speed,
          }))
          .filter((coin) => coin.y < 110)
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
      role="region"
      aria-label="Catch TONs game"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Catch TONs</h3>
      
      {!seedSynced && (
        <div className="text-sm text-yellow-400 mb-4 text-center">🌀 Синхронизация Fair-Seed...</div>
      )}

      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-center">
            <p className="text-sm text-gray-400">Время</p>
            <p className="text-2xl font-bold text-cyan-300">{timeLeft}s</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Счёт</p>
            <p className="text-2xl font-bold text-green-300">{score}</p>
          </div>
        </div>

        <div
          ref={gameAreaRef}
          className="relative w-full h-64 bg-gradient-to-b from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/30 overflow-hidden"
          role="application"
          aria-label="Game area"
        >
          <AnimatePresence>
            {coins.map((coin) => (
              <motion.div
                key={coin.id}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: `${coin.y}%`, opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => catchCoin(coin.id)}
                className="absolute left-0 cursor-pointer"
                style={{ left: `${coin.x}%`, transform: "translateX(-50%)" }}
                role="button"
                aria-label="Catch coin"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    catchCoin(coin.id);
                  }
                }}
              >
                <div className="text-4xl animate-bounce">💎</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={isPlaying ? endGame : startGame}
          disabled={!seedSynced}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label={isPlaying ? "Stop game" : "Start game"}
        >
          {isPlaying ? "⏹ Остановить" : "🎮 Начать игру"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default React.memo(GameCatchComponent);
