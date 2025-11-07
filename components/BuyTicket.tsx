"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { buyTicket } from "../lib/tonClient";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function BuyTicket({ onSuccess }: { onSuccess?: () => void }) {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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
      onSuccess?.();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("❌ Ошибка при транзакции");
      console.error("❌ Ошибка при покупке билета:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
    </motion.div>
  );
}
