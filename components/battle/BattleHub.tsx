"use client";

import { motion } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import React, { useEffect, useState } from "react";
import { ENV } from "../../lib/env";
import toast from "react-hot-toast";

export default function BattleHub() {
  const wallet = useTonWallet();
  const [status, setStatus] = useState<"idle" | "disabled" | "comingsoon" | "ready">("idle");

  const enabled = ENV.BATTLE_ENABLED === "true";
  const entry = ENV.BATTLE_ENTRY_TON || "0.1";
  const pool = ENV.BATTLEPOOL_ADDRESS;

  useEffect(() => {
    console.log("⚔️ TON Battle init:", { enabled, entry, pool });
    if (!enabled) {
      setStatus("disabled");
    } else if (!pool || pool.startsWith("EQAAAA") || pool === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
      setStatus("comingsoon");
    } else {
      setStatus("ready");
    }
  }, [enabled, pool, entry]);

  if (status === "disabled") return null;

  if (status === "comingsoon") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 text-center border border-cyan-500/30 rounded-xl backdrop-blur-md bg-black/40"
      >
        <h2 className="text-xl font-semibold text-cyan-400">⚔️ TON Battle</h2>
        <p className="text-gray-400 mt-2">Coming soon... Prepare for the Arena.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 text-center border border-cyan-500/30 rounded-xl backdrop-blur-md bg-black/40"
    >
      <h2 className="text-xl font-semibold text-cyan-400 mb-2">⚔️ TON Battle</h2>
      {wallet ? (
        <button
          onClick={() => {
            console.log("⚔️ Battle button clicked, pool:", pool);
            toast("Battle functionality coming soon! Join the arena when it's ready.", {
              icon: "⚔️",
            });
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label="Join battle"
        >
          В бой за {entry} TON
        </button>
      ) : (
        <p className="text-gray-400 mt-2">Подключи кошелёк, чтобы участвовать.</p>
      )}
      <p className="text-gray-500 text-xs mt-3">
        BattlePool: {pool ? `${pool.slice(0, 6)}...${pool.slice(-6)}` : "N/A"}
      </p>
    </motion.div>
  );
}
