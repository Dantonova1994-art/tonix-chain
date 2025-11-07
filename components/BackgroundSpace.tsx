import { motion } from "framer-motion";
import React from "react";

export default function BackgroundSpace() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Градиентное свечение */}
      <motion.div
        className="absolute -top-1/2 left-1/2 w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08)_0%,rgba(0,0,0,0)_70%)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 200, ease: "linear", repeat: Infinity }}
      />
      
      {/* Пульсирующие линии */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent h-[1px]"
          style={{
            top: `${(i * 8) + 5}%`,
            left: `${(i % 2) * 10}%`,
            width: `${50 + (i * 3)}%`,
            filter: "blur(1px)"
          }}
          animate={{
            x: ["-10%", "10%", "-10%"],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Неоновое свечение фона */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,255,255,0.05),rgba(0,0,0,0))]" />
    </div>
  );
}

