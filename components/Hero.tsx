"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
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
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative text-center flex flex-col items-center justify-center min-h-[50vh] space-y-6 z-10 px-4"
    >
      {/* Логотип с анимацией */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 shadow-[0_0_30px_rgba(0,255,255,0.7)] flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 30px rgba(0,255,255,0.7)",
              "0 0 50px rgba(0,255,255,0.9)",
              "0 0 30px rgba(0,255,255,0.7)"
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-12 border-4 border-white/20 rounded-lg rotate-45" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]"
        >
          Лотерея будущего на TON 💎
        </motion.h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg md:text-xl text-gray-300 max-w-md leading-relaxed"
      >
        Играй. Побеждай. Доверяй блокчейну.
      </motion.p>

      <motion.button
        onClick={scrollToBuy}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:shadow-[0_0_40px_rgba(0,255,255,0.9)] transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        <span className="relative z-10">🚀 НАЧАТЬ ИГРУ</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0"
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </motion.section>
  );
}
