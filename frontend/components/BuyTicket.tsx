"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { sendTransaction } from "../lib/ton";
import { useState } from "react";

export default function BuyTicket({ onSuccess }: { onSuccess?: () => void }) {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleBuy = async () => {
    setLoading(true);
    setStatus("⏳ Отправка транзакции...");
    const success = await sendTransaction(0.5, tonConnectUI); // 0.5 TON за билет
    if (success) {
      setStatus("✅ Успешно отправлено!");
      onSuccess?.();
    } else {
      setStatus("❌ Ошибка при отправке.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50"
      >
        🎟 Купить билет — 0.5 TON
      </button>
      {status && <p className="text-sm text-gray-400 mt-3">{status}</p>}
    </div>
  );
}
