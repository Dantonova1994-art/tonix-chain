"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import DiamondCore from "./DiamondCore";

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
    <motion.section
      className="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <DiamondCore />
      </motion.div>

      <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        TONIX CHAIN
      </motion.h1>

      <motion.p
        className="hero-subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Лотерея будущего на TON — прозрачная, мгновенная и децентрализованная.
      </motion.p>

      <motion.div
        className="hero-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <button className="btn-primary">🎮 Играть</button>
        <button className="btn-secondary">💎 TONIX PASS</button>
      </motion.div>

      <motion.p
        className="hero-powered"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        Powered by TON Blockchain
      </motion.p>
    </motion.section>
  );
}
