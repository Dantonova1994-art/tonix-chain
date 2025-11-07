"use client";

import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonWallet } from "@tonconnect/ui-react";
import { useEffect } from "react";

export default function WalletConnect() {
  const wallet = useTonWallet();

  useEffect(() => {
    if (wallet) {
      console.log("✅ Wallet connected:", wallet.account.address);
    } else {
      console.log("ℹ️ Wallet not connected");
    }
  }, [wallet]);

  return (
    <div className="flex justify-center mt-6">
      <TonConnectButton />
    </div>
  );
}
