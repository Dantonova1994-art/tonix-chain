"use client";

import DiamondCore from "./DiamondCore";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Hero({ scrollToBuy }: { scrollToBuy?: boolean } = {}) {
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

  return (
    <section className="hero">
      <div className="diamond-container">
        <DiamondCore />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hero-title"
      >
        TONIX CHAIN
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="hero-subtitle"
      >
        Лотерея будущего на TON — прозрачная, мгновенная и децентрализованная.
      </motion.p>

      <motion.div
        className="hero-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <button className="btn-neon">🎮 Играть</button>
        <button className="btn-glass">💎 TONIX PASS</button>
      </motion.div>

      <p className="powered">Powered by TON Blockchain</p>
    </section>
  );
}
