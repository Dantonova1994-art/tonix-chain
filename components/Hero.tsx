"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GalaxyParticles from "./GalaxyParticles";
import PassPanel from "./PassPanel";
import TypewriterText from "./TypewriterText";
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: 360,
              y: [0, -10, 0],
            }}
            transition={{ 
              scale: { duration: 0.8, ease: "easeOut" },
              rotate: { duration: 12, ease: "linear", repeat: Infinity },
              y: { duration: 6, ease: "easeInOut", repeat: Infinity },
            }}
            whileHover={{ 
              rotate: 720, 
              scale: 1.05,
            }}
            className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center select-none cursor-pointer holographic-logo"
            style={{
              filter: "drop-shadow(0 0 30px rgba(0,255,255,0.8)) drop-shadow(0 0 60px rgba(157,78,221,0.6))",
            }}
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
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-bold text-2xl sm:text-3xl md:text-4xl text-glow text-reflection"
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            TONIX CHAIN
          </motion.span>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center text-secondary text-sm md:text-base max-w-md mt-4"
        >
          Лотерея будущего на TON — децентрализованная, прозрачная и мгновенная.
        </motion.p>

        {/* Слоган "Play. Earn. Evolve." с typewriter эффектом */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-4"
        >
          <TypewriterText
            text="Play. Earn. Evolve."
            speed={80}
            delay={1000}
            className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-500 to-magenta-500 text-glow"
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          />
        </motion.div>

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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="btn-gradient relative overflow-hidden"
            aria-label="Начать игру"
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
              background: "linear-gradient(90deg, var(--neon-cyan), var(--neon-violet))",
              backgroundSize: "200% 200%",
            }}
          >
            <span className="relative z-10">🚀 НАЧАТЬ ИГРУ</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 border border-white/30 rounded-xl backdrop-blur-sm" />
          </motion.button>
          
          <motion.button
            onClick={() => setShowPassPanel(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="pass-card px-6 py-4 text-lg font-semibold text-white relative z-10"
            aria-label="TONIX PASS"
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span className="relative z-10">TONIX PASS 🪪</span>
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
