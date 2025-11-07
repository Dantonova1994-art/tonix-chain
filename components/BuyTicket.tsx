"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { buyTicket } from "../lib/tonClient";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BuyTicket({ onSuccess }: { onSuccess?: () => void }) {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (tonConnectUI) {
      setIsConnected(tonConnectUI.connected || false);
    }
  }, [tonConnectUI]);

  const handleBuyTicket = async () => {
    if (!tonConnectUI) {
      alert("⚠️ TonConnect не инициализирован");
      return;
    }

    console.log("🎫 Покупка билета началась");
    setLoading(true);
    setStatus("⏳ Отправка транзакции...");
    
    try {
      await buyTicket(tonConnectUI);
      setStatus("✅ Билет успешно куплен!");
      console.log("✅ Транзакция успешна");
      onSuccess?.();
      
      setTimeout(() => {
        setStatus(null);
      }, 3000);
    } catch (err) {
      console.error("❌ Ошибка при покупке билета:", err);
      setStatus("❌ Ошибка при покупке билета.");
      
      setTimeout(() => {
        setStatus(null);
      }, 3000);
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
        
        {!isConnected && (
          <span className="block text-xs mt-1 text-cyan-200/80">
            Сначала подключите кошелёк
          </span>
        )}
      </motion.button>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-cyan-500/30 text-sm text-center"
        >
          {status}
        </motion.div>
      )}
    </motion.div>
  );
}
