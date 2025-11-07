"use client";

import { useEffect, useState } from "react";
import { getContractBalance } from "../lib/ton";

interface ContractStatusProps {
  refreshTrigger?: number;
}

export default function ContractStatus({ refreshTrigger = 0 }: ContractStatusProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
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
  };

  useEffect(() => {
    fetchBalance();
  }, [refreshTrigger]);

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
