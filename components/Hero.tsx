import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]); // эффект параллакса

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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
          TONIX CHAIN
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg md:text-xl text-gray-300 max-w-xl"
      >
        Лотерея будущего на TON — децентрализованная, прозрачная и мгновенная.
      </motion.p>

      <motion.button
        onClick={scrollToBuy}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="px-8 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300 cursor-pointer"
      >
        🚀 НАЧАТЬ ИГРУ
      </motion.button>
    </motion.section>
  );
}
