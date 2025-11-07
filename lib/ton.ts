import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "@ton/ton";
import { TonConnectUI } from "@tonconnect/ui-react";

export async function getClient() {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "mainnet") as "mainnet" | "testnet";
  const endpoint = await getHttpEndpoint({ network });
  return new TonClient({ endpoint });
}

export async function getContractBalance(address: string) {
  const client = await getClient();
  const balance = await client.getBalance(Address.parse(address));
  return Number(balance) / 1e9;
}

export async function sendTransaction(amountTon: number, tonConnectUI: TonConnectUI) {
  if (!tonConnectUI.connected) {
    alert("Please connect your wallet first");
    return;
  }

  const tx = {
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [
      {
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        amount: (amountTon * 1e9).toString(),
      },
    ],
  };

  try {
    await tonConnectUI.sendTransaction(tx);
    return true;
  } catch (err) {
    console.error("Transaction failed:", err);
    return false;
  }
}

