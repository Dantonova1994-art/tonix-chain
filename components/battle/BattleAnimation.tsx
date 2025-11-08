"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BattleState } from "./hooks/useBattle";

interface BattleAnimationProps {
  state: BattleState;
}

export default function BattleAnimation({ state }: BattleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state !== "fighting") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = 200;
    };
    resize();
    window.addEventListener("resize", resize);

    const createParticle = (x: number, y: number, color: string) => {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1,
        color,
      });
    };

    const animate = () => {
      if (state !== "fighting") {
        particlesRef.current = [];
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Обновляем и рисуем частицы
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // гравитация
        p.life -= 0.02;

        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      // Случайные взрывы TON-монет
      if (Math.random() < 0.1 && particlesRef.current.length < 20) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const colors = ["#00FFFF", "#007BFF", "#FF00FF", "#FFFF00"];
        for (let i = 0; i < 5; i++) {
          createParticle(x, y, colors[Math.floor(Math.random() * colors.length)]);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state]);

  if (state !== "fighting") {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          {state === "searching" && "🔍"}
          {state === "matched" && "⚔️"}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-[200px] overflow-hidden rounded-lg bg-gradient-to-b from-red-900/20 to-blue-900/20 border border-cyan-500/30">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl"
        >
          ⚔️
        </motion.div>
      </div>
    </div>
  );
}

