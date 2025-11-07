import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "@ton/ton";
import { requireEnv } from "./env";
import toast from "react-hot-toast";

export async function getClient() {
  try {
    const network = (requireEnv("NETWORK") || "mainnet") as "mainnet" | "testnet";
    console.log("🌐 Getting TON client for network:", network);
    const endpoint = await getHttpEndpoint({ network });
    console.log("✅ TON endpoint:", endpoint);
    return new TonClient({ endpoint });
  } catch (err: any) {
    console.error("❌ Error getting TON client:", err);
    toast.error("❌ Ошибка подключения к сети TON");
    throw err;
  }
}

export async function getContractBalance(address: string) {
  try {
    console.log("💰 Fetching contract balance for:", address);
    let contractAddress: string;
    try {
      contractAddress = requireEnv("CONTRACT");
    } catch (err: any) {
      console.error("❌ Contract address not configured:", err);
      toast.error("❌ Адрес контракта не настроен!");
      throw err;
    }
    
    const client = await getClient();
    const balance = await client.getBalance(Address.parse(contractAddress));
    const balanceTon = Number(balance) / 1e9;
    console.log("✅ Contract balance:", balanceTon, "TON");
    return balanceTon;
  } catch (err) {
    console.error("❌ Error fetching contract balance:", err);
    throw err;
  }
}

export async function sendTransaction(amountTon: number, tonConnectUI: any) {
  if (!tonConnectUI.connected) {
    console.warn("⚠️ Wallet not connected");
    toast.error("Пожалуйста, подключите кошелек сначала");
    return false;
  }

  let contractAddress: string;
  try {
    contractAddress = requireEnv("CONTRACT");
  } catch (err: any) {
    console.error("❌ Contract address not configured:", err);
    toast.error("❌ Адрес контракта не настроен!");
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
