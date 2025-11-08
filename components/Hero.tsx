"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GalaxyParticles from "./GalaxyParticles";
import PassPanel from "./PassPanel";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const [showPassPanel, setShowPassPanel] = useState(false);
  const [hovered, setHovered] = useState(false);

  const scrollToBuy = () => {
    console.log("🚀 НАЧАТЬ ИГРУ button clicked");
    const el = document.getElementById("buy-section");
    if (el) {
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-3 z-10"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 120"
            className="w-64 sm:w-72 md:w-[420px] h-auto cursor-pointer select-none"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => {
              setHovered(true);
              setTimeout(() => setHovered(false), 400);
            }}
            animate={{
              scale: hovered ? 1.05 : 1,
              filter: hovered
                ? "drop-shadow(0 0 25px rgba(0,255,255,1)) drop-shadow(0 0 45px rgba(123,97,255,0.8))"
                : "drop-shadow(0 0 15px rgba(0,255,255,0.6)) drop-shadow(0 0 25px rgba(123,97,255,0.5))",
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <defs>
              <linearGradient id="tonixGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00FFFF">
                  <animate
                    attributeName="stop-color"
                    values="#00FFFF;#0099FF;#7B61FF;#00FFFF"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#7B61FF">
                  <animate
                    attributeName="stop-color"
                    values="#7B61FF;#00FFFF;#0099FF;#7B61FF"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="70%"
              textAnchor="middle"
              fill="url(#tonixGradient)"
              fontSize="56"
              fontWeight="800"
              letterSpacing="4"
              fontFamily="Inter, sans-serif"
              style={{
                textShadow: hovered
                  ? "0 0 18px rgba(0,255,255,0.9), 0 0 42px rgba(123,97,255,0.9)"
                  : "0 0 12px rgba(0,255,255,0.8), 0 0 28px rgba(123,97,255,0.6)",
              }}
            >
              TONIX CHAIN
            </text>
          </motion.svg>
          <p className="text-center text-gray-300 text-sm md:text-base max-w-md mt-1">
            Лотерея будущего на TON — децентрализованная, прозрачная и мгновенная.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={scrollToBuy}
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
