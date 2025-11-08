"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import ContractStatus from "../components/ContractStatus";
import BackgroundSpace from "../components/BackgroundSpace";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useGame } from "../context/GameContext";
import { ENV } from "../lib/env";
import ReferralPanel from "../components/ReferralPanel";
import MyNFTs from "../components/nft/MyNFTs";

// Динамический импорт компонентов с TonConnect для избежания SSR ошибок
const BuyTicket = dynamic(() => import("../components/BuyTicket"), { ssr: false });
const DrawButton = dynamic(() => import("../components/DrawButton"), { ssr: false });
const MyTickets = dynamic(() => import("../components/MyTickets"), { ssr: false });
const LastDraws = dynamic(() => import("../components/LastDraws"), { ssr: false });
const Rounds = dynamic(() => import("../components/Rounds"), { ssr: false });
const RoundHistory = dynamic(() => import("../components/RoundHistory"), { ssr: false });
const MyWins = dynamic(() => import("../components/MyWins"), { ssr: false });
const GameHub = dynamic(() => import("../components/GameHub"), { ssr: false });

const GAMING_MODE = ENV.GAMING_MODE === "true";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [envWarning, setEnvWarning] = useState(false);
  const [showGameHub, setShowGameHub] = useState(false);

  // Проверка ENV переменных (только в development)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const requiredEnv = [
        "NEXT_PUBLIC_NETWORK",
        "NEXT_PUBLIC_CONTRACT_ADDRESS",
        "NEXT_PUBLIC_TONCENTER_API",
      ];
      const missing = requiredEnv.filter((key) => !process.env[key]);
      if (missing.length > 0) {
        console.warn("⚠️ Missing ENV variables:", missing);
        setEnvWarning(true);
      }
    }
  }, []);

  // Загрузка текущего раунда
  useEffect(() => {
    const fetchCurrentRound = async () => {
      try {
        const response = await fetch("/api/lottery/rounds");
        if (response.ok) {
          const data = await response.json();
          setCurrentRoundId(data.currentRoundId);
          if (!selectedRoundId) {
            setSelectedRoundId(data.currentRoundId);
          }
        }
      } catch (err) {
        console.error("Error fetching current round:", err);
      }
    };
    fetchCurrentRound();
  }, []);

  // Telegram MainButton integration
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp && GAMING_MODE) {
      const tg = (window as any).Telegram.WebApp;
      tg.MainButton.setText("Играть 🎮");
      tg.MainButton.show();
      tg.MainButton.onClick(handleOpenGameHub);

      return () => {
        tg.MainButton.offClick(handleOpenGameHub);
      };
    }
  }, [GAMING_MODE]);

  const handleOpenGameHub = () => {
    setShowGameHub(true);
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.MainButton.hide();
    }
  };

  const handleCloseGameHub = () => {
    setShowGameHub(false);
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp && GAMING_MODE) {
      (window as any).Telegram.WebApp.MainButton.show();
    }
  };

  const handleTicketBought = () => {
    console.log("🔄 Refreshing all components after ticket purchase...");
    setRefreshKey((prev) => prev + 1);
  };

  const handleDrawSuccess = () => {
    console.log("🔄 Refreshing all components after draw...");
    setRefreshKey((prev) => prev + 1);
    const fetchCurrentRound = async () => {
      try {
        const response = await fetch("/api/lottery/rounds");
        if (response.ok) {
          const data = await response.json();
          setCurrentRoundId(data.currentRoundId);
          setSelectedRoundId(data.currentRoundId);
        }
      } catch (err) {
        console.error("Error fetching current round:", err);
      }
    };
    fetchCurrentRound();
  };

  const handleRoundChange = (roundId: number) => {
    console.log("🔄 Round changed to:", roundId);
    setSelectedRoundId(roundId);
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
        navigator.clipboard.writeText("https://t.me/tonixchain_lottery_bot/app?startapp=lottery");
        toast.success("Ссылка скопирована!");
        console.log("🔗 Link copied to clipboard");
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

      {envWarning && process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-xs text-yellow-300">
          ⚠️ Missing ENV variables. Check console.
        </div>
      )}

      {showGameHub && GAMING_MODE ? (
        <GameHub onClose={handleCloseGameHub} />
      ) : (
        <div className="z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-6 pb-20">
          <Hero />
          <WalletConnect />
          <ReferralPanel />
          {ENV.NFT_ENABLED === "true" && <MyNFTs />}
          <MyTickets refreshKey={refreshKey} />
          <ContractStatus refreshKey={refreshKey} />
          <BuyTicket onSuccess={handleTicketBought} currentRoundId={currentRoundId || undefined} />
          <DrawButton onSuccess={handleDrawSuccess} />

          {selectedRoundId && (
            <>
              <Rounds selectedRoundId={selectedRoundId} onRoundChange={handleRoundChange} />
              <RoundHistory roundId={selectedRoundId} />
            </>
          )}

          <MyWins refreshKey={refreshKey} />
          <LastDraws />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex gap-4 mt-8 w-full max-w-md px-4"
          >
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:bg-white/20 transition-all duration-300 text-sm font-semibold shadow-[0_0_10px_rgba(0,255,255,0.2)] focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Share"
            >
              🔗 Поделиться
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-red-500/30 text-red-300 hover:bg-white/20 transition-all duration-300 text-sm font-semibold shadow-[0_0_10px_rgba(255,0,0,0.2)] focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Close"
            >
              Закрыть
            </button>
          </motion.div>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-gray-500 text-xs text-center space-y-2"
          >
            <p>© TONIX Chain — The Future of Web3 Games 💎</p>
            <a
              href="/status"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Статус системы
            </a>
          </motion.footer>
        </div>
      )}
    </main>
  );
}
