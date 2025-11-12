"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import ContractStatus from "../components/ContractStatus";
import BackgroundSpace from "../components/BackgroundSpace";
import CyberGalaxyBackground from "../components/CyberGalaxyBackground";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useGame } from "../context/GameContext";
import { ENV } from "../lib/env";
import ReferralPanel from "../components/ReferralPanel";
import MyNFTs from "../components/nft/MyNFTs";
import { useOnchainEvents } from "../hooks/useOnchainEvents";
import OnchainGraph from "../components/OnchainGraph";
import DAODashboard from "../components/DAODashboard";
import MyProfile from "../components/MyProfile";
import Identity from "../components/Identity";

// Динамический импорт компонентов с TonConnect для избежания SSR ошибок
const BuyTicket = dynamic(() => import("../components/BuyTicket"), { ssr: false });
const DrawButton = dynamic(() => import("../components/DrawButton"), { ssr: false });
const MyTickets = dynamic(() => import("../components/MyTickets"), { ssr: false });
const LastDraws = dynamic(() => import("../components/LastDraws"), { ssr: false });
const Rounds = dynamic(() => import("../components/Rounds"), { ssr: false });
const RoundHistory = dynamic(() => import("../components/RoundHistory"), { ssr: false });
const MyWins = dynamic(() => import("../components/MyWins"), { ssr: false });
const GameHub = dynamic(() => import("../components/GameHub"), { ssr: false });
const NovaAI = dynamic(() => import("../components/NovaAI"), { ssr: false });
const Starfield = dynamic(() => import("../components/Starfield"), { ssr: false });
const JackpotCounter = dynamic(() => import("../components/JackpotCounter"), { ssr: false });
const AIWidget = dynamic(() => import("../components/AIWidget"), { ssr: false });

const GAMING_MODE = ENV.GAMING_MODE === "true";

export default function Home() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [envWarning, setEnvWarning] = useState(false);
  const [showGameHub, setShowGameHub] = useState(false);
  const [startTarget, setStartTarget] = useState<string | null>(null);

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

  // Подписка на ончейн-события
  useOnchainEvents((event) => {
    console.log("💎 Onchain event:", event);
  });

  // Обработка параметра startapp для автоматической навигации
  useEffect(() => {
    const saved = localStorage.getItem("tonix_start_target");
    if (saved) {
      setStartTarget(saved);
      console.log("🚀 Auto navigation to:", saved);
      
      if (saved === "game") {
        setShowGameHub(true);
      } else if (saved === "lottery") {
        // Скролл к секции покупки билетов будет выполнен в Hero
      }
      
      // Очистка через 3 секунды
      setTimeout(() => {
        setStartTarget(null);
        localStorage.removeItem("tonix_start_target");
      }, 3000);
    }
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
      {process.env.NEXT_PUBLIC_ENABLE_STARFIELD !== 'false' && <Starfield />}
      <CyberGalaxyBackground />
      <BackgroundSpace />
      <div className="absolute inset-0 cyber-grid opacity-20" />

      {envWarning && process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-xs text-yellow-300">
          ⚠️ Missing ENV variables. Check console.
        </div>
      )}

      <AnimatePresence mode="wait">
        {showGameHub && GAMING_MODE ? (
          <motion.div
            key="gamehub"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            <GameHub onClose={handleCloseGameHub} autoStart={startTarget === "game"} />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-6 pb-20"
          >
            <Hero scrollToBuy={startTarget === "lottery"} />
          
          {/* Live Jackpot Counter */}
          <div className="w-full max-w-md mx-auto mt-6">
            <JackpotCounter />
          </div>
          
          <WalletConnect />
          <ReferralPanel />
          {ENV.NFT_ENABLED === "true" && <MyNFTs />}
          <MyTickets refreshKey={refreshKey} />
          <ContractStatus refreshKey={refreshKey} />
          
          {/* On-chain граф */}
          <div className="mt-8 w-full max-w-md mx-auto">
            <OnchainGraph />
          </div>
          
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

          {/* Identity & Profile */}
          <div className="mt-8 w-full max-w-md mx-auto space-y-4">
            <Identity />
            <MyProfile />
          </div>

          {/* DAO Section */}
          <div className="mt-8 w-full max-w-md mx-auto">
            <DAODashboard />
          </div>

          {/* GameHub section */}
          {GAMING_MODE ? (
            <div id="game-hub" className="w-full mt-8">
              <GameHub onClose={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-6 mb-10 text-sm">
              🎮 Игровой режим скоро будет
            </div>
          )}

          {/* AI Widget (новый) */}
          {process.env.NEXT_PUBLIC_AI_ASSISTANT !== 'false' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <AIWidget />
            </motion.div>
          )}

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
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* NOVA AI Assistant */}
      <NovaAI />
    </main>
  );
}
