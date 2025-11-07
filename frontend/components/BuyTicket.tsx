"use client";

import { useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { sendTransaction } from "../lib/ton";

interface BuyTicketProps {
  onTransactionSuccess?: () => void;
}

export default function BuyTicket({ onTransactionSuccess }: BuyTicketProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const ticketPrice = 1; // 1 TON за билет

  const handleBuyTicket = async () => {
    if (!tonConnectUI.connected) {
      setStatus("Please connect your wallet first");
      tonConnectUI.openModal();
      return;
    }

    setLoading(true);
    setStatus("Preparing transaction...");

    try {
      const success = await sendTransaction(ticketPrice, tonConnectUI);
      
      if (success) {
        setStatus("Transaction sent! Waiting for confirmation...");
        // Обновляем баланс через 3 секунды после отправки
        setTimeout(() => {
          if (onTransactionSuccess) {
            onTransactionSuccess();
          }
          setStatus("Transaction confirmed!");
        }, 3000);
      } else {
        setStatus("Transaction failed. Please try again.");
      }
    } catch (error) {
      console.error("Error buying ticket:", error);
      setStatus("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <button
        onClick={handleBuyTicket}
        disabled={loading}
        className={`px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-lg font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.4)] ${
          loading
            ? "opacity-50 cursor-not-allowed"
            : "hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"
        }`}
      >
        {loading ? "Processing..." : "🎟 Купить билет"}
      </button>
      
      {status && (
        <div className={`px-4 py-2 rounded-lg text-sm max-w-md text-center ${
          status.includes("failed") || status.includes("Error")
            ? "bg-red-900/20 text-red-400 border border-red-500/20"
            : status.includes("confirmed")
            ? "bg-green-900/20 text-green-400 border border-green-500/20"
            : "bg-blue-900/20 text-blue-400 border border-blue-500/20"
        }`}>
          {status}
        </div>
      )}
      
      <p className="text-sm text-gray-400">
        Price: <span className="text-cyan-400 font-semibold">{ticketPrice} TON</span>
      </p>
    </div>
  );
}

