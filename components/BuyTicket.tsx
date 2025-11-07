"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { buyTicket } from "../lib/tonClient";
import { useState } from "react";

export default function BuyTicket({ onSuccess }: { onSuccess?: () => void }) {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);

  const handleBuyTicket = async () => {
    console.log("🖱️ Buy Ticket button clicked");
    setLoading(true);
    try {
      await buyTicket(tonConnectUI);
      onSuccess?.();
    } catch (err) {
      console.error("❌ Error in handleBuyTicket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="buy-section" className="flex flex-col items-center mt-8">
      <button
        onClick={handleBuyTicket}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "⏳ Отправка..." : "🎟 Купить билет — 0.5 TON"}
      </button>
    </div>
  );
}
