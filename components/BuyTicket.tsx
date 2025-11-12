"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { buyTicket } from "../lib/tonClient";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import NFTTicketModal from "./NFTTicketModal";
import { REFERRAL_XP } from "../constants/game";
import { useGame } from "../context/GameContext";
import { useSoundContext } from "./SoundProvider";
import { captureEvent } from "../lib/analytics";
import { generateSignature } from "../lib/verify";
import { ENV, CONTRACT_ADDRESS } from "../lib/env";

function getSecretKey(): string {
  return process.env.NEXT_PUBLIC_TONIX_SECRET_KEY || "dev-secret-key";
}

export default function BuyTicket({ onSuccess, currentRoundId }: { onSuccess?: () => void; currentRoundId?: number }) {
  const [tonConnectUI] = useTonConnectUI();
  const { addXP } = useGame();
  const { play } = useSoundContext();
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);

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
    console.log("📍 Sending to contract:", CONTRACT_ADDRESS);
    setLoading(true);

    const loadingToast = toast.loading("⏳ Отправка транзакции...", {
      duration: 10000,
    });

    try {
      await buyTicket(tonConnectUI);
      toast.dismiss(loadingToast);
      toast.success("🎟 Билет куплен успешно!");
      console.log("✅ Транзакция успешна");
      
      // Генерируем mock txHash (в реальном приложении получаем из ответа)
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      setLastTxHash(txHash);
      
      // Трекинг реферала
      const referrerWallet = localStorage.getItem("referrer_wallet");
      if (referrerWallet && tonConnectUI.account?.address) {
        try {
          await fetch("/api/referral/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referrer: referrerWallet,
              buyer: tonConnectUI.account.address,
              txHash,
            }),
          });
          
          addXP(REFERRAL_XP, "Реферал");
          toast.success("🎁 1 XP за приглашённого друга!");
          captureEvent("referral_tracked", {
            referrer: referrerWallet,
            buyer: tonConnectUI.account.address,
          });
          
          // Очищаем реферала после первого использования
          localStorage.removeItem("referrer_wallet");
        } catch (err) {
          console.warn("⚠️ Failed to track referral:", err);
        }
      }

      // Webhook для автоматического минта NFT (в фоне)
      if (txHash && tonConnectUI.account?.address) {
        fetch("/api/hooks/mint-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: tonConnectUI.account.address,
            txHash,
            type: "ticket_purchase",
          }),
        }).catch((err) => {
          console.warn("⚠️ Webhook call failed (non-critical):", err);
        });
      }

      onSuccess?.();
      
      // Предлагаем минт Ticket NFT (если включено)
      if (ENV.NFT_ENABLED === "true") {
        setShowNFTModal(true);
      }
      
      // Вибрация
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(100);
      }
           } catch (err) {
             toast.dismiss(loadingToast);
             toast.error("❌ Ошибка при транзакции");
             play("alert");
             console.error("❌ Ошибка при покупке билета:", err);
             captureEvent("tx_buy_error", {
        wallet: tonConnectUI.account?.address,
        error: err instanceof Error ? err.message : "Unknown",
      });
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
               <div className="flex flex-col gap-3 w-full">
          <motion.button
            onClick={handleBuyTicket}
            disabled={loading || !isConnected}
            aria-busy={loading}
            whileHover={{ 
              scale: isConnected && !loading ? 1.02 : 1,
              boxShadow: isConnected && !loading ? "0 0 40px rgba(0, 240, 255, 0.6)" : undefined
            }}
            whileTap={{ scale: isConnected && !loading ? 0.97 : 1 }}
            className="megamoon-btn w-full px-8 py-4 rounded-xl font-bold text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
              background: "linear-gradient(120deg, #00f0ff, #7b2ff7)",
              boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)",
            }}
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
          
          <motion.a
            href="https://t.me/tonixchain_lottery_bot/app?startapp=buy"
            onClick={(e) => {
              if (typeof window !== "undefined" && !(window as any).Telegram?.WebApp) {
                e.preventDefault();
                alert("Открой Mini App в Telegram для покупки");
              }
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-8 py-4 rounded-xl font-bold text-lg text-white text-center bg-white/10 backdrop-blur-md border border-cyan-500/30 hover:bg-white/20 transition-all"
            style={{
              fontFamily: "'Satoshi', 'Inter', sans-serif",
            }}
          >
            💎 Buy in Tonkeeper
          </motion.a>
        </div>
      </motion.div>

      <NFTTicketModal
        isOpen={showNFTModal}
        onClose={() => {
          setShowNFTModal(false);
          setLastTxHash(undefined);
        }}
        roundId={currentRoundId}
        txHash={lastTxHash}
      />
    </>
  );
}
