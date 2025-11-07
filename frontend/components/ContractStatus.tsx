"use client";

import { useEffect, useState } from "react";
import { getContractBalance } from "../lib/ton";

export default function ContractStatus() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddress) {
          setLoading(false);
          return;
        }
        const bal = await getContractBalance(contractAddress);
        setBalance(bal);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="text-center mt-6 bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-md max-w-sm mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-cyan-400">Contract Status</h2>
      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : (
        <p className="text-white text-xl">{balance?.toFixed(2)} TON</p>
      )}
    </div>
  );
}
