"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DiamondCore() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    // Звук будет добавлен через внешний обработчик при необходимости
    if (typeof window !== 'undefined' && (window as any).tonixSound) {
      (window as any).tonixSound.click?.();
    }
  };

  return (
    <motion.div
      className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      whileHover={!isMobile ? { scale: 1.03 } : {}}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      {/* Мягкое отражение под алмазом */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,255,247,0.15), transparent 70%)",
          filter: "blur(30px)",
          transform: "translateY(20px)",
        }}
      />

      {/* Внешний алмаз с градиентом */}
      <div
        className="absolute inset-0 diamond-3d"
        style={{
          transformStyle: "preserve-3d",
          animation: isMobile ? "breathe 6s ease-in-out infinite" : "spin 8s linear infinite",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{
            filter: "drop-shadow(0 0 20px rgba(0,255,247,0.2))",
          }}
        >
          <defs>
            <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00fff7" />
              <stop offset="50%" stopColor="#7b2ff7" />
              <stop offset="100%" stopColor="#ff6ad5" />
            </linearGradient>
            <radialGradient id="diamondCenter" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(0,255,247,0.6)" />
              <stop offset="70%" stopColor="rgba(0,255,247,0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          
          {/* Алмазная форма (ромб) */}
          <polygon
            points="100,20 180,100 100,180 20,100"
            fill="url(#diamondGradient)"
            opacity="0.85"
          />
          
          {/* Центральное свечение */}
          <circle cx="100" cy="100" r="40" fill="url(#diamondCenter)" />
          
          {/* Внутренние грани для объема */}
          <polygon
            points="100,40 160,100 100,160 40,100"
            fill="none"
            stroke="rgba(0,255,247,0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Мягкое внутреннее свечение при hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,255,247,0.1), transparent 70%)",
          filter: "blur(25px)",
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
