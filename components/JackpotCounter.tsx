"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function JackpotCounter() {
  const [val, setVal] = useState<number | null>(null);
  const [blink, setBlink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/metrics/jackpot", { cache: "no-store" });
      const j = await r.json();
      if (j.ok && j.value !== undefined) {
        setBlink(true);
        setTimeout(() => setBlink(false), 350);
        setVal(j.value);
        setError(null);
      } else {
        setError(j.error || "Network error");
        if (j.value === 0) {
          setVal(0);
        }
      }
    } catch (err) {
      console.error("Failed to load jackpot:", err);
      setError("Network unreachable");
    }
  }

  useEffect(() => { 
    load(); 
    const id = setInterval(load, 5000); 
    return () => clearInterval(id); 
  }, []);

  return (
    <div className="glass-panel relative overflow-hidden rounded-xl p-4 md:p-6 border border-white/10">
      <div className="text-xs uppercase tracking-widest text-cyan-200/80">Current Jackpot</div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={String(val)}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className={`mt-1 text-3xl md:text-4xl font-semibold ${blink ? "shadow-[0_0_32px_#00F0FF66]" : ""}`}
          style={{ 
            background: "linear-gradient(120deg,#00f0ff,#7b2ff7)", 
            WebkitBackgroundClip: "text", 
            color: "transparent" 
          }}
          aria-live="polite"
        >
          {val === null ? "—.— TON" : `${val.toFixed(3)} TON`}
        </motion.div>
      </AnimatePresence>
      {error && (
        <div className="mt-2 text-red-400 text-sm">
          🛰 On-chain data temporarily unavailable
        </div>
      )}
      {!error && (
        <div className="mt-2 text-[12px] text-white/60">Обновляется каждые 5 секунд</div>
      )}
    </div>
  );
}

