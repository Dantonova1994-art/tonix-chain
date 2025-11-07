"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import ContractStatus from "../components/ContractStatus";
import BackgroundSpace from "../components/BackgroundSpace";
import { motion } from "framer-motion";

// Динамический импорт компонентов с TonConnect для избежания SSR ошибок
const BuyTicket = dynamic(() => import("../components/BuyTicket"), { ssr: false });
const DrawButton = dynamic(() => import("../components/DrawButton"), { ssr: false });

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketBought = () => {
    console.log("🔄 Refreshing contract status...");
    setRefreshKey((prev) => prev + 1);
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.shareUrl("https://t.me/tonixchain_lottery_bot/app?startapp=lottery", "🎰 TONIX Chain Lottery");
      console.log("🔗 Sharing Mini App link");
    } else {
      if (navigator.share) {
        navigator.share({
          title: "TONIX Chain Lottery",
          text: "🎰 Играй в лотерею на TON!",
          url: "https://t.me/tonixchain_lottery_bot/app?startapp=lottery"
        });
      } else {
        alert("🔗 Ссылка: https://t.me/tonixchain_lottery_bot/app?startapp=lottery");
      }
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.close();
      console.log("❌ Closing Mini App");
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0b0c10] to-[#121826] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <BackgroundSpace />
      
      <div className="z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-6 pb-20">
        <Hero />
        <WalletConnect />
        <ContractStatus refreshKey={refreshKey} />
        <BuyTicket onSuccess={handleTicketBought} />
        <DrawButton />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex gap-4 mt-8 w-full max-w-md px-4"
        >
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:bg-white/20 transition-all duration-300 text-sm font-semibold"
          >
            🔗 Поделиться
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-red-500/30 text-red-300 hover:bg-white/20 transition-all duration-300 text-sm font-semibold"
          >
            Закрыть
          </button>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-gray-500 text-xs text-center"
        >
          © TONIX Chain — The Future of Web3 Games
        </motion.footer>
      </div>
    </main>
  );
}
