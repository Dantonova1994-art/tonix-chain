"use client";

import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonWallet } from "@tonconnect/ui-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { formatAddressShort } from "../lib/address";
import toast from "react-hot-toast";

export default function WalletConnect() {
  const wallet = useTonWallet();

  useEffect(() => {
    if (wallet) {
      console.log("✅ Кошелёк подключен");
      console.log("📍 Адрес:", wallet.account.address);
      console.log("🔗 Chain:", wallet.account.chain);
    } else {
      console.log("ℹ️ Кошелёк не подключен");
    }
  }, [wallet]);

  const copyAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      toast.success("Скопировано");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="flex flex-col items-center mt-6 w-full max-w-md mx-auto px-4"
    >
      {wallet ? (
        <div className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-green-500/30 p-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Статус</p>
              <p className="text-green-400 font-semibold">✅ Кошелёк подключен</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Адрес</p>
              <button
                onClick={() => copyAddress(wallet.account.address)}
                className="text-xs text-cyan-300 font-mono hover:text-cyan-200 cursor-pointer"
                title={wallet.account.address}
              >
                {formatAddressShort(wallet.account.address)}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <TonConnectButton />
        </div>
      )}
    </motion.div>
  );
}
