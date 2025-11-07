import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import ContractStatus from "../components/ContractStatus";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0c10] to-[#121826]">
      <Hero />
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          <WalletConnect />
          <ContractStatus />
        </div>
      </div>
    </div>
  );
}
