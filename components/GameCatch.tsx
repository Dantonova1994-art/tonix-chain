"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { GAME_REWARDS } from "../constants/game";
import toast from "react-hot-toast";

interface Coin {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export default function GameCatch() {
  const { addXP } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const coinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(10);
    setScore(0);
    setCoins([]);

    // Таймер игры
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Генерация монет
    coinIntervalRef.current = setInterval(() => {
      if (gameAreaRef.current) {
        const newCoin: Coin = {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10, // 10-90%
          y: -10,
          speed: 2 + Math.random() * 2,
        };
        setCoins((prev) => [...prev, newCoin]);
      }
    }, 800);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
    
    if (score > 0) {
      const xpEarned = score * GAME_REWARDS.CATCH_COIN;
      addXP(xpEarned, `Catch TONs: ${score} монет`);
      toast.success(`🎉 Поймано ${score} монет! +${xpEarned} XP`);
    } else {
      toast("Попробуйте ещё раз!", { icon: "🔄" });
    }
    
    setTimeout(() => {
      setCoins([]);
    }, 2000);
  };

  const catchCoin = (coinId: number) => {
    if (!isPlaying) return;
    
    setCoins((prev) => prev.filter((c) => c.id !== coinId));
    setScore((prev) => prev + 1);
    
    // Вибрация
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }
  };

  // Анимация падения монет
  useEffect(() => {
    if (!isPlaying) return;

    const animationFrame = setInterval(() => {
      setCoins((prev) =>
        prev
          .map((coin) => ({
            ...coin,
            y: coin.y + coin.speed,
          }))
          .filter((coin) => coin.y < 110) // Удаляем упавшие монеты
      );
    }, 50);

    return () => clearInterval(animationFrame);
  }, [isPlaying]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Catch TONs</h3>
      
      <div className="flex flex-col items-center space-y-4">
        {/* Статус игры */}
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

        {/* Игровая область */}
        <div
          ref={gameAreaRef}
          className="relative w-full h-64 bg-gradient-to-b from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/30 overflow-hidden"
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
              >
                <div className="text-4xl animate-bounce">💎</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Кнопка */}
        <motion.button
          onClick={isPlaying ? endGame : startGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300"
        >
          {isPlaying ? "⏹ Остановить" : "🎮 Начать игру"}
        </motion.button>
      </div>
    </motion.div>
  );
}

