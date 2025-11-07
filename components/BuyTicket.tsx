"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { buyTicket } from "../lib/tonClient";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import NFTTicketModal from "./NFTTicketModal";

export default function BuyTicket({ onSuccess, currentRoundId }: { onSuccess?: () => void; currentRoundId?: number }) {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [justBought, setJustBought] = useState(false);

  useEffect(() => {
    if (tonConnectUI) {
      setIsConnected(tonConnectUI.connected || false);
    }
  }, [tonConnectUI]);

  const handleBuyTicket = async () => {
    if (!tonConnectUI) {
      toast.error("⚠️ TonConnect не инициализирован");
      return;
    }

    if (!isConnected) {
      toast.error("⚠️ Сначала подключите кошелёк");
      return;
    }

    console.log("🎫 Покупка билета началась");
    setLoading(true);
    
    const loadingToast = toast.loading("⏳ Отправка транзакции...", {
      duration: 10000,
    });
    
    try {
      await buyTicket(tonConnectUI);
      toast.dismiss(loadingToast);
      toast.success("🎟 Билет куплен успешно!");
      console.log("✅ Транзакция успешна");
      setJustBought(true);
      onSuccess?.();
      
      // Вибрация (если доступно)
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(100);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("❌ Ошибка при транзакции");
      console.error("❌ Ошибка при покупке билета:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        id="buy-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col items-center mt-8 w-full max-w-md mx-auto px-4"
      >
        <motion.button
          onClick={handleBuyTicket}
          disabled={loading || !isConnected}
          aria-busy={loading}
          whileHover={{ scale: isConnected && !loading ? 1.05 : 1 }}
          whileTap={{ scale: isConnected && !loading ? 0.95 : 1 }}
          className="w-full px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:shadow-[0_0_40px_rgba(0,255,255,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.span>
              Отправка транзакции...
            </span>
          ) : (
            <span>🎟 Купить билет — 0.5 TON</span>
          )}
          
          {!isConnected && !loading && (
            <span className="block text-xs mt-1 text-cyan-200/80">
              Сначала подключите кошелёк
            </span>
          )}
        </motion.button>

        {justBought && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowNFTModal(true)}
            className="mt-4 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all duration-300"
          >
            🎫 Mint NFT ticket (soon)
          </motion.button>
        )}
      </motion.div>

      <NFTTicketModal
        isOpen={showNFTModal}
        onClose={() => {
          setShowNFTModal(false);
          setJustBought(false);
        }}
        roundId={currentRoundId}
      />
    </>
  );
}
