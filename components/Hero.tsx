"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GalaxyParticles from "./GalaxyParticles";
import PassPanel from "./PassPanel";
import { ENV } from "../lib/env";

export default function Hero({ scrollToBuy }: { scrollToBuy?: boolean }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const [showPassPanel, setShowPassPanel] = useState(false);

  // Автоматический скролл к секции покупки билетов
  useEffect(() => {
    if (scrollToBuy) {
      setTimeout(() => {
        const buySection = document.getElementById("buy-section");
        if (buySection) {
          buySection.scrollIntoView({ behavior: "smooth", block: "center" });
          console.log("📍 Scrolled to buy section");
        }
      }, 500);
    }
  }, [scrollToBuy]);

  const handleScrollToBuy = () => {
    console.log("🚀 НАЧАТЬ ИГРУ button clicked");
    const el = document.getElementById("buy-section");
    if (el) {
      // Мягкий zoom-out эффект
      el.style.transform = "scale(0.95)";
      setTimeout(() => {
        el.style.transform = "scale(1)";
      }, 200);
      console.log("📍 Scrolling to buy-section");
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("⚠️ buy-section element not found");
    }
  };

  return (
    <>
      <GalaxyParticles />
      <motion.section
        style={{ y }}
        className="relative text-center flex flex-col items-center justify-center min-h-[60vh] space-y-6 z-10"
      >
        <div className="flex flex-col items-center justify-center gap-4 z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            whileHover={{ rotate: 720, scale: 1.05 }}
            className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center select-none cursor-pointer drop-shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:drop-shadow-[0_0_35px_rgba(0,255,255,1)] transition-all"
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full neon-glow">
              <defs>
                <linearGradient id="tonixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ffff">
                    <animate
                      attributeName="stop-color"
                      values="#00ffff;#0088ff;#9b5cff;#00ffff"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#9b5cff">
                    <animate
                      attributeName="stop-color"
                      values="#9b5cff;#00ffff;#0088ff;#9b5cff"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polygon
                points="100,10 190,55 190,145 100,190 10,145 10,55"
                fill="none"
                stroke="url(#tonixGradient)"
                strokeWidth="8"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
            </svg>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-bold text-2xl sm:text-3xl md:text-4xl drop-shadow-[0_0_25px_rgba(0,255,255,0.9)] glow-flicker"
          >
            TONIX CHAIN
          </motion.span>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center text-gray-300 text-sm md:text-base max-w-md mt-4"
        >
          Лотерея будущего на TON — децентрализованная, прозрачная и мгновенная.
        </motion.p>

        {/* Подпись "THE FUTURE OF WEB3 GAMES" */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-4 text-xl text-cyan-300/80 text-reflection glow-pulse"
        >
          THE FUTURE OF WEB3 GAMES
        </motion.p>

        {ENV.GAMING_MODE === "true" && (
          <motion.button
            onClick={() => {
              const gameHub = document.getElementById("game-hub");
              if (gameHub) {
                gameHub.scrollIntoView({ behavior: "smooth" });
              }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.8)] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Играть"
          >
            🎮 Играть
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={handleScrollToBuy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:shadow-[0_0_40px_rgba(0,255,255,0.9)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Начать игру"
          >
            🚀 НАЧАТЬ ИГРУ
          </motion.button>
          
          <motion.button
            onClick={() => setShowPassPanel(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:shadow-[0_0_40px_rgba(168,85,247,0.9)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="TONIX PASS"
          >
            TONIX PASS 🪪
          </motion.button>
        </motion.div>
      </motion.section>

      {showPassPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-md w-full">
            <PassPanel onClose={() => setShowPassPanel(false)} />
          </div>
        </div>
      )}
    </>
  );
}
