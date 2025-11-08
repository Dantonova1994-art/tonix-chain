"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useSoundContext } from "./SoundProvider";
import toast from "react-hot-toast";

interface Meteor {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
}

const SHIP_SIZE = 30;
const METEOR_SIZE = 40;
const GAME_SPEED = 2;

export default function GalaxyRun() {
  const { addXP } = useGame();
  const { play } = useSoundContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [shipX, setShipX] = useState(0);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const lastXPTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      setShipX(canvas.width / 2);
    };
    resize();
    window.addEventListener("resize", resize);

    // Сохраняем текущее состояние meteors
    let currentMeteors = meteors;

    // Управление
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Touch управление
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        touchStartX = e.touches[0].clientX;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0] && canvas) {
        const deltaX = e.touches[0].clientX - touchStartX;
        setShipX((prev) => {
          const newX = prev + deltaX * 0.5;
          return Math.max(SHIP_SIZE, Math.min(canvas.width - SHIP_SIZE, newX));
        });
        touchStartX = e.touches[0].clientX;
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);

    // Игровой цикл
    let lastTime = Date.now();
    let meteorId = 0;

    const gameLoop = () => {
      if (!isPlaying) return;

      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      // Движение корабля
      setShipX((prev) => {
        let newX = prev;
        if (keysRef.current.has("ArrowLeft") || keysRef.current.has("a") || keysRef.current.has("A")) {
          newX -= 5;
        }
        if (keysRef.current.has("ArrowRight") || keysRef.current.has("d") || keysRef.current.has("D")) {
          newX += 5;
        }
        return Math.max(SHIP_SIZE, Math.min(canvas.width - SHIP_SIZE, newX));
      });

      // Обновление метеоров
      setMeteors((prev) => {
        const updated = prev
          .map((m) => ({ ...m, y: m.y + m.speed }))
          .filter((m) => m.y < canvas.height + METEOR_SIZE);

        // Спавн новых метеоров
        if (Math.random() < 0.02) {
          updated.push({
            id: meteorId++,
            x: Math.random() * (canvas.width - METEOR_SIZE * 2) + METEOR_SIZE,
            y: -METEOR_SIZE,
            speed: GAME_SPEED + Math.random() * 2,
            size: METEOR_SIZE,
          });
        }

        currentMeteors = updated;
        return updated;
      });

      // Проверка столкновений (используем currentMeteors)
      const shipYPos = canvas.height - SHIP_SIZE - 20;
      const collision = currentMeteors.find((m) => {
        const dx = shipX - m.x;
        const dy = shipYPos - m.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (SHIP_SIZE + m.size) / 2;
      });

      if (collision) {
        endGame();
        return;
      }

      // Обновление времени и XP
      setTime((prev) => {
        const newTime = prev + delta / 1000;
        if (newTime - lastXPTimeRef.current >= 10) {
          addXP(5, "Galaxy Run: 10 seconds survived");
          lastXPTimeRef.current = newTime;
        }
        return newTime;
      });

      // Отрисовка
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Фон (звёзды)
      ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
      for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (time * 50 + i * 23) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
      }

      // Корабль
      const shipYPos = canvas.height - SHIP_SIZE - 20;
      ctx.fillStyle = "#00FFFF";
      ctx.beginPath();
      ctx.moveTo(shipX, shipYPos);
      ctx.lineTo(shipX - SHIP_SIZE / 2, shipYPos + SHIP_SIZE);
      ctx.lineTo(shipX + SHIP_SIZE / 2, shipYPos + SHIP_SIZE);
      ctx.closePath();
      ctx.fill();

      // Метеоры
      currentMeteors.forEach((m) => {
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(gameLoop);
    };

    const interval = setInterval(() => {
      setScore((prev) => prev + 1);
    }, 1000);

    gameLoop();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      clearInterval(interval);
    };
  }, [isPlaying, shipX, time, addXP, meteors]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTime(0);
    setMeteors([]);
    lastXPTimeRef.current = 0;
    play("click");
  };

  const endGame = () => {
    setIsPlaying(false);
    const xpEarned = Math.floor(time / 10) * 5;
    if (xpEarned > 0) {
      toast.success(`🎮 Galaxy Run завершён! +${xpEarned} XP`);
    }
    play("alert");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
    >
      <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">🚀 Galaxy Run</h3>

      {!isPlaying ? (
        <div className="text-center space-y-4">
          <p className="text-gray-400">Уворачивайся от метеоров!</p>
          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold glow-pulse"
          >
            🎮 Начать игру
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-400">Время</p>
              <p className="text-cyan-300 font-bold">{time.toFixed(1)}s</p>
            </div>
            <div>
              <p className="text-gray-400">Счёт</p>
              <p className="text-cyan-300 font-bold">{score}</p>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-64 bg-black/20 rounded-xl border border-cyan-500/30"
            style={{ touchAction: "none" }}
          />

          <motion.button
            onClick={endGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
          >
            ⏹ Остановить
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

