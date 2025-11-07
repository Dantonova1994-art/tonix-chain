import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { formatAddress } from '../lib/ton';

export default function WalletConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const connected = wallet !== null;
  const address = wallet?.account?.address;

  const handleConnect = () => {
    tonConnectUI?.openModal();
  };

  const handleDisconnect = () => {
    tonConnectUI?.disconnect();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!connected ? (
        <button
          onClick={handleConnect}
          className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="px-6 py-3 bg-gray-800/50 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">Connected</p>
            <p className="text-cyan-400 font-mono text-sm">
              {address ? formatAddress(address) : '—'}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

