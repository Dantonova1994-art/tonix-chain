import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "@ton/ton";
import { TonConnectUI } from "@tonconnect/ui-react";

export async function getClient() {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "mainnet") as "mainnet" | "testnet";
  console.log("🌐 Getting TON client for network:", network);
  const endpoint = await getHttpEndpoint({ network });
  console.log("✅ TON endpoint:", endpoint);
  return new TonClient({ endpoint });
}

export async function getContractBalance(address: string) {
  try {
    console.log("💰 Fetching contract balance for:", address);
    const client = await getClient();
    const balance = await client.getBalance(Address.parse(address));
    const balanceTon = Number(balance) / 1e9;
    console.log("✅ Contract balance:", balanceTon, "TON");
    return balanceTon;
  } catch (err) {
    console.error("❌ Error fetching contract balance:", err);
    throw err;
  }
}

export async function sendTransaction(amountTon: number, tonConnectUI: TonConnectUI) {
  if (!tonConnectUI.connected) {
    console.warn("⚠️ Wallet not connected");
    alert("Please connect your wallet first");
    return false;
  }

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ Contract address not configured");
    alert("Contract address not configured");
    return false;
  }

  const tx = {
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [
      {
        address: contractAddress,
        amount: (amountTon * 1e9).toString(),
      },
    ],
  };

  try {
    console.log("📤 Sending transaction:", tx);
    await tonConnectUI.sendTransaction(tx);
    console.log("✅ Transaction sent successfully");
    return true;
  } catch (err) {
    console.error("❌ Transaction failed:", err);
    return false;
  }
}
