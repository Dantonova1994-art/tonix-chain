"use client";

import { motion } from "framer-motion";
import DiamondCore from "./DiamondCore";
import StatusBar from "./StatusBar";
import useJackpot from "../hooks/useJackpot";
import useFadeIn from "../hooks/useFadeIn";
import LoadingButton from "./LoadingButton";
import useLocale from "../hooks/useLocale";
import LangSwitch from "./LangSwitch";
import { useEffect } from "react";

export default function Hero({ scrollToBuy }: { scrollToBuy?: boolean } = {}) {
  const { jackpot, ok, loading } = useJackpot();
  const fade = useFadeIn(300);
  const { t } = useLocale();

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

  const handlePlay = async () => {
    console.log("Play pressed");
    const buySection = document.getElementById("buy-section");
    if (buySection) {
      buySection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    await new Promise(r => setTimeout(r, 1000));
  };

  return (
    <section className={`hero ${fade}`}>
      <StatusBar />
      <LangSwitch />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
      >
        <div className="diamond-container">
          <DiamondCore />
        </div>
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {t.hero.title}
        </motion.h1>
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {t.hero.subtitle}
        </motion.p>
        <motion.p 
          className="jackpot-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {loading ? t.hero.loading : `${t.hero.pool}: ${ok ? `${jackpot} TON` : "—"}`}
        </motion.p>
        <motion.div 
          className="hero-buttons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <LoadingButton text={t.hero.play.replace("🚀 ", "")} icon="🚀" onClick={handlePlay} />
          <button className="btn-glass">{t.hero.pass}</button>
        </motion.div>
        <motion.p 
          className="powered"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Powered by TON Blockchain
        </motion.p>
      </motion.div>
    </section>
  );
}
