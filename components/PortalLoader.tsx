"use client";

import { motion } from "framer-motion";

export default function PortalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="relative w-64 h-64"
      >
        {/* Врата портала */}
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/50" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-blue-500"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-4 border-transparent border-b-purple-500 border-l-pink-500"
        />
        
        {/* Центральный глоу */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 blur-xl"
        />
        
        <p className="absolute inset-0 flex items-center justify-center text-cyan-400 font-bold text-lg">
          Портал открывается...
        </p>
      </motion.div>
    </div>
  );
}

