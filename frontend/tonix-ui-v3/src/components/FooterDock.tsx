"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaTicketAlt, FaWallet, FaTrophy, FaUser } from "react-icons/fa";

const tabs = [
  { id: "play", label: "Играть", icon: <FaTicketAlt /> },
  { id: "wallet", label: "Баланс", icon: <FaWallet /> },
  { id: "winners", label: "Победители", icon: <FaTrophy /> },
  { id: "profile", label: "Профиль", icon: <FaUser /> },
];

export default function FooterDock() {
  const [active, setActive] = useState("play");

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 safe-area">
      <motion.div
        className="mx-auto mb-[env(safe-area-inset-bottom)] w-full max-w-sm bg-white/10 backdrop-blur-2xl border-t border-white/10 rounded-t-2xl flex justify-around py-3 sm:py-4 shadow-lg shadow-cyan-500/5"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex flex-col items-center gap-1 text-sm transition-all ${
              active === tab.id
                ? "text-cyan-400 scale-110"
                : "text-gray-400 hover:text-cyan-300"
            }`}
          >
            <motion.div
              animate={{
                scale: active === tab.id ? 1.2 : 1,
                color: active === tab.id ? "#22d3ee" : "#9ca3af",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-lg"
            >
              {tab.icon}
            </motion.div>
            <span className="text-xs sm:text-sm">{tab.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

