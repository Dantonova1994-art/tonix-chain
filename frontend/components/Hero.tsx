import WalletConnect from "./WalletConnect";
import ContractStatus from "./ContractStatus";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-b from-[#0b0c10] to-[#121826]">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 mb-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.6)]" />
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Tonix Chain
        </h1>
        <p className="text-gray-400 mb-8 text-lg md:text-xl max-w-lg">
          Bridging TON to the future of Web3
        </p>
        <WalletConnect />
        <ContractStatus />
      </div>
    </section>
  );
}
