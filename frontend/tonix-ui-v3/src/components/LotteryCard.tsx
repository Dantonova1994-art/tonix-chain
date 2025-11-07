"use client";

import { motion } from "framer-motion";

export default function LotteryCard() {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white max-w-md mx-auto shadow-xl border border-white/20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Текущий розыгрыш</h2>
      <p className="text-gray-300 mb-2">💰 Призовой пул: 4,500 TON</p>
      <p className="text-gray-300 mb-2">👥 Участники: 178</p>
      <div className="flex justify-around mt-6">
        <button className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition">Купить билет</button>
        <button className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition">Провести</button>
        <button className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-600 transition">Забрать</button>
      </div>
    </motion.div>
  );
}

