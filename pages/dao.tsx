"use client";

import React from "react";
import { motion } from "framer-motion";
import DAODashboard from "../components/DAODashboard";
import Identity from "../components/Identity";
import MyProfile from "../components/MyProfile";

export default function DAOPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0b0c10] to-[#121826] text-white p-4 overflow-hidden">
      <div className="absolute inset-0 glow-grid opacity-30" />
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-8 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent glow-flicker">
            TONIX DAO Genesis
          </h1>
          <p className="text-xl text-cyan-300/80 text-reflection glow-pulse">
            We Rise as One. The Chain Decides.
          </p>
        </motion.div>

        {/* Identity & Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Identity />
          <MyProfile />
        </div>

        {/* DAO Dashboard */}
        <DAODashboard />
      </div>
    </main>
  );
}

