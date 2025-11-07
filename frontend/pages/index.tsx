import React, { useState } from "react";
import { motion } from "framer-motion";
import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import ContractStatus from "../components/ContractStatus";
import BuyTicket from "../components/BuyTicket";
import AnimatedWrapper from "../components/AnimatedWrapper";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketBought = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060a] to-[#0a0c13] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Hero />

      <AnimatedWrapper delay={0.5}>
        <WalletConnect />
      </AnimatedWrapper>

      <AnimatedWrapper delay={0.8}>
        <ContractStatus refreshKey={refreshKey} />
      </AnimatedWrapper>

      <AnimatedWrapper delay={1.1}>
        <BuyTicket onSuccess={handleTicketBought} />
      </AnimatedWrapper>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5 }}
        className="mt-16 text-gray-500 text-sm text-center"
      >
        © {new Date().getFullYear()} TONIX CHAIN • The Future Lottery on TON
      </motion.footer>
    </main>
  );
}
