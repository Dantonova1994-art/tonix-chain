"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-24 sm:py-32 overflow-hidden">
      {/* Космический фон */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19] via-[#0b1630] to-[#000] animate-gradientMove opacity-90" />
      {/* Звёздный фон (опционально, если есть stars.svg) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:50px_50px] animate-stars" />
      </div>

      {/* Градиентное свечение */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-600/30 to-cyan-400/30 blur-3xl rounded-full opacity-40" />

      {/* Контент */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center px-6 sm:px-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-2xl sm:text-3xl">
            💎
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Tonix Chain
          </h1>
        </motion.div>

        <p className="text-lg sm:text-xl text-gray-300 max-w-md mb-10">
          Лотерея будущего на TON 💎  
          <br />
          Играй. Выигрывай. Проверь свою удачу.
        </p>

        <motion.a
          href="#lottery"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-cyan-400/40 hover:shadow-cyan-400/60 transition-all"
        >
          НАЧАТЬ ИГРУ
        </motion.a>
      </motion.div>
    </section>
  );
}
