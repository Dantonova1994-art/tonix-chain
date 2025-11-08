"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundContext } from "./SoundProvider";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [showSkip, setShowSkip] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const fullText = "ENTER THE GALAXY";
  const { play } = useSoundContext();

  useEffect(() => {
    // Показываем кнопку SKIP через 2 секунды
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);

    // Анимация текста по буквам
    let charIndex = 0;
    const textInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setCurrentText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(textInterval);
      }
    }, 100);

    // Автозавершение через 5 секунд
    const completeTimer = setTimeout(() => {
      play("battle"); // Используем battle звук как portal
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 5000);

    return () => {
      clearTimeout(skipTimer);
      clearInterval(textInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete, play]);

  const handleSkip = () => {
    play("click");
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0b0c10] via-[#1a1f2e] to-[#0b0c10] flex items-center justify-center overflow-hidden"
      >
        {/* Вспышка неонового света */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          className="absolute inset-0 bg-gradient-radial from-cyan-500/20 via-blue-500/10 to-transparent"
        />

        {/* 3D вращающийся логотип */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-64 h-64 perspective-1000"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="relative w-full h-full preserve-3d"
            style={{ transformStyle: "preserve-3d" }}
          >
            <svg
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full neon-glow"
            >
              <defs>
                <linearGradient id="introGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ffff">
                    <animate
                      attributeName="stop-color"
                      values="#00ffff;#0088ff;#9b5cff;#00ffff"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#9b5cff">
                    <animate
                      attributeName="stop-color"
                      values="#9b5cff;#00ffff;#0088ff;#9b5cff"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
                <filter id="introGlow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polygon
                points="100,10 190,55 190,145 100,190 10,145 10,55"
                fill="none"
                stroke="url(#introGradient)"
                strokeWidth="10"
                strokeLinejoin="round"
                filter="url(#introGlow)"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Текст ENTER THE GALAXY */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-32 text-center"
        >
          <div className="flex gap-2 text-4xl font-bold">
            {fullText.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: currentText.includes(char) ? 1 : 0,
                  scale: currentText.includes(char) ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 glow-pulse"
                style={{
                  textShadow: "0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(123, 97, 255, 0.6)",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Кнопка SKIP */}
        {showSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSkip}
            className="absolute bottom-8 px-6 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:bg-white/20 transition-all"
          >
            SKIP INTRO
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

