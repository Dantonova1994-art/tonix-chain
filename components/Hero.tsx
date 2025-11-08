"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GalaxyParticles from "./GalaxyParticles";
import PassPanel from "./PassPanel";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const [showPassPanel, setShowPassPanel] = useState(false);

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
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_25px_rgba(0,255,255,0.7)]"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 20px rgba(0,255,255,0.5)",
                "0 0 40px rgba(0,255,255,0.9)",
                "0 0 20px rgba(0,255,255,0.5)"
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            TONIX CHAIN
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl px-4"
        >
          Лотерея будущего на TON — децентрализованная, прозрачная и мгновенная.
        </motion.p>

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
