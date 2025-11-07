import { useEffect, useState } from 'react';
import { getTonClient, TonixLottery } from '../lib/ton';
import { Address } from '@ton/core';

interface ContractData {
  status: 'loading' | 'active' | 'error';
  balance?: string;
  address?: string;
}

export default function ContractStatus() {
  const [data, setData] = useState<ContractData>({ status: 'loading' });
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

  useEffect(() => {
    async function fetchContractData() {
      if (!contractAddress) {
        setData({ status: 'error' });
        return;
      }

      try {
        const client = await getTonClient();
        const address = Address.parse(contractAddress);
        const contract = TonixLottery.createFromAddress(address);
        const provider = client.open(contract);

        const state = await provider.getState();
        const balance = (Number(state.balance) / 1e9).toFixed(2);

        setData({
          status: 'active',
          balance: `${balance} TON`,
          address: contractAddress,
        });
      } catch (error) {
        console.error('Error fetching contract data:', error);
        setData({ status: 'error' });
      }
    }

    fetchContractData();
  }, [contractAddress]);

  if (data.status === 'loading') {
    return (
      <div className="px-6 py-4 bg-gray-800/50 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
        <p className="text-gray-400">Loading contract status...</p>
      </div>
    );
  }

  if (data.status === 'error') {
    return (
      <div className="px-6 py-4 bg-red-900/20 rounded-xl border border-red-500/20 backdrop-blur-sm">
        <p className="text-red-400">Contract not configured</p>
        <p className="text-sm text-gray-400 mt-1">
          Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 bg-gray-800/50 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Contract Status</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className="text-green-400 font-semibold">Active</span>
        </div>
        {data.balance && (
          <div className="flex justify-between">
            <span className="text-gray-400">Balance:</span>
            <span className="text-white font-semibold">{data.balance}</span>
          </div>
        )}
        {data.address && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Address:</span>
            <span className="text-cyan-400 font-mono text-xs">
              {data.address.slice(0, 6)}...{data.address.slice(-4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

