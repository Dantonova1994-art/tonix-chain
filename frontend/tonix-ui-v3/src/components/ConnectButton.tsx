"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";

export default function ConnectButton() {
  const [tonConnectUI] = useTonConnectUI();
  return (
    <button
      onClick={() => tonConnectUI.connectWallet()}
      className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-cyan-400/50 hover:scale-105 transition"
    >
      🔗 Подключить кошелёк
    </button>
  );
}

