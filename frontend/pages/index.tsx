import React, { useState } from "react";
import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import ContractStatus from "../components/ContractStatus";
import BuyTicket from "../components/BuyTicket";
import AnimatedWrapper from "../components/AnimatedWrapper";
import BackgroundSpace from "../components/BackgroundSpace";
import { motion } from "framer-motion";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketBought = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="relative min-h-screen bg-[#05060a] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      <BackgroundSpace />
      <div className="z-10 w-full flex flex-col items-center justify-center">
        <Hero />
        <AnimatedWrapper delay={0.5}><WalletConnect /></AnimatedWrapper>
        <AnimatedWrapper delay={0.8}><ContractStatus refreshKey={refreshKey} /></AnimatedWrapper>
        <AnimatedWrapper delay={1.1}><BuyTicket onSuccess={handleTicketBought} /></AnimatedWrapper>
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-gray-500 text-sm text-center"
        >
          © {new Date().getFullYear()} TONIX CHAIN • The Future Lottery on TON
        </motion.footer>
      </div>
    </main>
  );
}
