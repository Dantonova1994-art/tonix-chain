"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTonWallet } from "@tonconnect/ui-react";

interface NFTTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundId?: number;
}

export default function NFTTicketModal({ isOpen, onClose, roundId }: NFTTicketModalProps) {
  const wallet = useTonWallet();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleRequestMint = async () => {
    if (!wallet?.account?.address) {
      toast.error("Подключите кошелёк");
      return;
    }

    try {
      console.log("🎫 Requesting NFT mint (stub)...");
      const response = await fetch("/api/nft/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.account.address,
          roundId: roundId || 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request mint");
      }

      const data = await response.json();
      toast.success("Запрос на минт NFT отправлен (заглушка)");
      console.log("✅ NFT mint request:", data);
    } catch (err: any) {
      console.error("❌ Error requesting NFT mint:", err);
      toast.error("Ошибка при запросе минта");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_40px_rgba(0,255,255,0.5)] max-w-md w-full z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10 rounded-2xl" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">NFT Ticket</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              title="Закрыть (Esc)"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-lg text-gray-300 mb-2">NFT Ticket — Coming Soon</p>
              <p className="text-sm text-gray-400">
                В ближайшее время вы сможете получить NFT-билет за участие в лотерее
              </p>
            </div>

            {roundId && (
              <div className="p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/10">
                <p className="text-sm text-gray-400">Раунд</p>
                <p className="text-lg font-bold text-cyan-300">#{roundId}</p>
              </div>
            )}

            <button
              onClick={handleRequestMint}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8)] transition-all duration-300"
            >
              Запросить минт (заглушка)
            </button>

            <p className="text-xs text-gray-500 text-center">
              Функционал NFT-билетов находится в разработке
            </p>
            
            <p className="text-xs text-gray-600 text-center">
              Нажмите Esc для закрытия
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
