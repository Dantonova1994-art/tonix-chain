import React from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';

export default function ConnectButton() {
  const [tonConnectUI] = useTonConnectUI();
  const connected = tonConnectUI?.connected || false;
  const walletAddress = tonConnectUI?.account?.address;

  return (
    <div className="flex flex-col items-center gap-4">
      <TonConnectButton />
      
      {connected && walletAddress && (
        <div className="glass-strong rounded-xl p-4 text-center min-w-[280px]">
          <p className="text-sm text-gray-400 mb-2">Wallet Connected</p>
          <p className="text-xs text-cyan-400 font-mono break-all">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
}

