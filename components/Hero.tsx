"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import DiamondCore from "./DiamondCore";
import Starfield from "./Starfield";
import { ENV, CONTRACT_ADDRESS } from "../lib/env";
import { fetchContractBalance } from "../lib/ton-read";

export default function Hero({ scrollToBuy }: { scrollToBuy?: boolean }) {
  const [poolBalance, setPoolBalance] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");

  // Параллакс для фона
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bgX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const bgY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  // Загрузка баланса пула
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const balance = await fetchContractBalance(CONTRACT_ADDRESS);
        setPoolBalance(balance);
      } catch (err) {
        console.error("Ошибка загрузки баланса:", err);
      }
    };
    loadBalance();
    const interval = setInterval(loadBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  // Таймер до следующего розыгрыша
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const nextDraw = now + 3600000;
      const diff = nextDraw - now;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Параллакс при движении мыши
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (e.clientX - centerX) * 0.01;
      const deltaY = (e.clientY - centerY) * 0.01;
      mouseX.set(deltaX);
      mouseY.set(deltaY);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Автоматический скролл к секции покупки
  useEffect(() => {
    if (scrollToBuy) {
      setTimeout(() => {
        const buySection = document.getElementById("buy-section");
        if (buySection) {
          buySection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [scrollToBuy]);

  const handleScrollToBuy = () => {
    const el = document.getElementById("buy-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Starfield />
      <motion.section
        className="relative text-center flex flex-col items-center justify-center min-h-[70vh] space-y-8 z-10 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Параллакс фон */}
        <motion.div
          className="absolute inset-0 -z-10"
          style={{
            x: bgX,
            y: bgY,
            background: "radial-gradient(circle at 50% 50%, rgba(0,255,247,0.03), transparent 60%)",
            filter: "blur(40px)",
          }}
        />

        {/* Алмаз */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <DiamondCore />
        </motion.div>

        {/* Заголовок */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="hero-title text-4xl sm:text-5xl md:text-6xl"
        >
          TONIX CHAIN
        </motion.h1>

        {/* Подзаголовок */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center text-[#9fb3c8] text-sm md:text-base max-w-md"
        >
          Лотерея нового поколения на TON
        </motion.p>

        {/* CTA блок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={handleScrollToBuy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-neon text-lg px-8 py-4"
          >
            🎮 Играть
          </motion.button>

          <motion.button
            onClick={() => {
              const passSection = document.getElementById("pass-section");
              if (passSection) {
                passSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative px-8 py-4 rounded-xl font-semibold text-lg text-white overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,247,0.8), rgba(123,47,247,0.8))",
              boxShadow: "0 0 20px rgba(0,255,247,0.2)",
            }}
          >
            <span className="relative z-10">💎 TONIX PASS</span>
          </motion.button>
        </motion.div>

        {/* Powered by */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-xs text-[#9fb3c8] mt-4"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          На TON Blockchain 💎
        </motion.p>

        {/* Статистика */}
        {(poolBalance !== null || timeLeft !== "--:--:--") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-center mt-6"
          >
            {poolBalance !== null && (
              <div className="glass-card px-6 py-3">
                <p className="text-xs text-[#9fb3c8] mb-1">Призовой пул</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #00fff7, #7b2ff7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {poolBalance.toFixed(2)} TON
                </p>
              </div>
            )}
            <div className="glass-card px-6 py-3">
              <p className="text-xs text-[#9fb3c8] mb-1">Следующий розыгрыш</p>
              <p className="text-2xl font-bold text-[#00fff7] font-mono">{timeLeft}</p>
            </div>
          </motion.div>
        )}
      </motion.section>
    </>
  );
}
