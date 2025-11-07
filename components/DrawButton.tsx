"use client";

import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Временный адрес владельца (заменить на реальный из контракта)
const OWNER_ADDRESS = process.env.NEXT_PUBLIC_OWNER_ADDRESS || "";

export default function DrawButton() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (wallet?.account?.address) {
      setIsOwner(wallet.account.address === OWNER_ADDRESS);
    }
    if (tonConnectUI) {
      setIsConnected(tonConnectUI.connected || false);
    }
  }, [wallet, tonConnectUI]);

  const handleDraw = async () => {
    if (!isOwner) {
      console.warn("⚠️ Only owner can draw");
      toast.error("Только владелец может запустить розыгрыш");
      return;
    }

    if (!tonConnectUI || !isConnected) {
      toast.error("⚠️ Пожалуйста, подключите кошелек сначала");
      return;
    }

    console.log("🎲 Проведение розыгрыша началось");
    setLoading(true);
    
    const loadingToast = toast.loading("⏳ Отправка транзакции розыгрыша...", {
      duration: 10000,
    });

    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address not configured");
      }

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: contractAddress,
            amount: "0",
          }
        ]
      };

      console.log("📤 Sending draw transaction...", tx);
      await tonConnectUI.sendTransaction(tx);
      toast.dismiss(loadingToast);
      toast.success("🎲 Розыгрыш запущен!");
      console.log("✅ Розыгрыш успешно проведён!");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("❌ Ошибка при проведении розыгрыша");
      console.error("❌ Ошибка при проведении розыгрыша:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="flex flex-col items-center mt-6 w-full max-w-md mx-auto px-4"
    >
      <motion.button
        onClick={handleDraw}
        disabled={loading}
        whileHover={{ scale: !loading ? 1.05 : 1 }}
        whileTap={{ scale: !loading ? 0.95 : 1 }}
        className="w-full px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:shadow-[0_0_40px_rgba(168,85,247,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.span>
            Проведение розыгрыша...
          </span>
        ) : (
          <span>🎲 Провести розыгрыш</span>
        )}
      </motion.button>
    </motion.div>
  );
}
