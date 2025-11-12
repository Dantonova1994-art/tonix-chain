"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function JackpotCounter() {
  const [value, setValue] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchJackpot = async (silent = false) => {
    try {
      if (!silent) setIsUpdating(true);
      const res = await fetch("/api/metrics/jackpot");
      const data = await res.json();
      if (data.ok) {
        const val = Number(data.value || 0);
        if (value !== null && val !== value) {
          toast.success("💎 Jackpot updated!");
        }
        setValue(val);
        setError(false);
      } else {
        throw new Error(data.error || "Network error");
      }
    } catch (err) {
      console.error("Jackpot error:", err);
      if (!error) toast.error("🛰 TON Network unreachable");
      setError(true);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchJackpot();
    const interval = setInterval(() => fetchJackpot(true), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center mt-4">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm mt-2 font-light"
          >
            🛰 On-chain data temporarily unavailable
          </motion.div>
        ) : value !== null ? (
          <motion.div
            key="jackpot"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative text-center"
          >
            <motion.div
              animate={{
                opacity: [0.8, 1, 0.8],
                transition: { duration: 2, repeat: Infinity },
              }}
              className="text-cyan-300 text-lg font-semibold tracking-wider drop-shadow-glow"
            >
              🎰 Jackpot Pool
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.03, 1],
                transition: { duration: 1.5, repeat: Infinity },
              }}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 select-none"
            >
              {value.toFixed(3)} TON
            </motion.div>

            {isUpdating && (
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-blue-500 animate-shimmer" />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-40 h-8 rounded-md bg-gradient-to-r from-[#0a1828] via-[#14243b] to-[#0a1828] animate-shimmer"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
