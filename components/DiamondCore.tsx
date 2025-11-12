"use client";

import { motion } from "framer-motion";

export default function DiamondCore() {
  return (
    <motion.div
      initial={{ rotateY: 0 }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="diamond-core"
    >
      <div className="diamond-glow" />
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="diamond-shape"
      >
        <polygon
          points="100,10 180,80 140,190 60,190 20,80"
          fill="url(#grad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="50%" stopColor="#8f7bff" />
            <stop offset="100%" stopColor="#ff8fff" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
