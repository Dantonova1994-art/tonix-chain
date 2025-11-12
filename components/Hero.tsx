"use client";

import { motion } from "framer-motion";
import DiamondCore from "./DiamondCore";
import StatusBar from "./StatusBar";
import useJackpot from "../hooks/useJackpot";
import { useEffect } from "react";

export default function Hero({ scrollToBuy }: { scrollToBuy?: boolean } = {}) {
  const { jackpot, ok } = useJackpot();

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
      <StatusBar />
      <div className="diamond-container">
        <DiamondCore />
      </div>
      <motion.h1 
        className="hero-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        TONIX CHAIN
      </motion.h1>
      <motion.p 
        className="hero-subtitle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Лотерея будущего на TON — прозрачная, мгновенная и децентрализованная.
      </motion.p>
      <motion.p 
        className="jackpot-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Призовой пул: {ok ? `${jackpot} TON` : "загрузка..."}
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
