import React from "react";

export default function EnvDebug() {
  const vars = {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_TONCENTER_API: process.env.NEXT_PUBLIC_TONCENTER_API,
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-2">TONIX CHAIN 🔷</h1>
      <h2 className="text-lg mb-6 text-cyan-400">Проверка окружения (Environment Variables)</h2>
      <div className="bg-[#141821] border border-cyan-600 rounded-lg p-4 text-sm w-full max-w-xl overflow-x-auto">
        <pre className="text-cyan-300">{JSON.stringify(vars, null, 2)}</pre>
      </div>
      <p className="mt-6 text-gray-500 text-xs">
        [Если что-то undefined — переменные не проброшены в Vercel]
      </p>
    </div>
  );
}

