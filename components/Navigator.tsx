"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatPanel from "./ChatPanel";

export default function Navigator() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* AI Аватар */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:shadow-[0_0_40px_rgba(0,255,255,0.9)] transition-all glow-pulse"
        aria-label="TONIX Navigator"
      >
        ⚡
      </motion.button>

      {/* Чат-панель */}
      <AnimatePresence>
        {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

