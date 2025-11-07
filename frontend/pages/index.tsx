import React, { useState } from "react";
import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import ContractStatus from "../components/ContractStatus";
import BuyTicket from "../components/BuyTicket";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketBought = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060a] to-[#0a0c13] text-white flex flex-col items-center justify-center p-6">
      <Hero />
      <div className="mt-8 flex flex-col items-center gap-4">
        <WalletConnect />
        <ContractStatus refreshKey={refreshKey} />
        <BuyTicket onSuccess={handleTicketBought} />
      </div>
      <footer className="mt-16 text-gray-500 text-sm text-center">
        <p>© {new Date().getFullYear()} TONIX CHAIN • The Future Lottery on TON</p>
      </footer>
    </main>
  );
}
