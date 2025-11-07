import { TonConnectUI } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { requireEnv } from "./env";

export async function buyTicket(tonConnectUI: TonConnectUI) {
  try {
    let contractAddress: string;
    try {
      contractAddress = requireEnv("CONTRACT");
    } catch (err: any) {
      console.error("❌ Contract address not configured:", err);
      toast.error("❌ Адрес контракта не настроен!");
      throw err;
    }

    console.log("🎫 Initiating ticket purchase...");
    console.log("📍 Contract address:", contractAddress);
    console.log("💰 Amount: 0.5 TON (500000000 nanoTON)");

    if (!tonConnectUI.connected) {
      console.warn("⚠️ Wallet not connected");
      toast.error("⚠️ Пожалуйста, подключите кошелек сначала");
      return;
    }

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: contractAddress,
          amount: "500000000" // 0.5 TON в nanoTON
        }
      ]
    };

    console.log("📤 Sending transaction...", tx);
    await tonConnectUI.sendTransaction(tx);
    console.log("✅ Ticket purchased successfully!");
  } catch (err) {
    console.error("❌ Transaction failed:", err);
    throw err; // Re-throw to be caught by the calling component for toast.error
  }
}

export async function sendDrawTransaction(tonConnectUI: TonConnectUI, ownerAddress: string) {
  try {
    let contractAddress: string;
    try {
      contractAddress = requireEnv("CONTRACT");
    } catch (err: any) {
      console.error("❌ Contract address not configured:", err);
      toast.error("❌ Адрес контракта не настроен!");
      throw err;
    }

    console.log("🎲 Initiating draw transaction...");
    console.log("📍 Contract address:", contractAddress);
    console.log("👤 Owner address:", ownerAddress);

    if (!tonConnectUI.connected) {
      console.warn("⚠️ Wallet not connected");
      toast.error("⚠️ Пожалуйста, подключите кошелек сначала");
      return;
    }

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: contractAddress,
          amount: "0", // Отправляем 0 TON для вызова метода контракта
          payload: "te6ccgEBAQEAAgAAAEysCg==" // Пример payload для вызова метода draw
        }
      ]
    };

    console.log("📤 Sending draw transaction...", tx);
    await tonConnectUI.sendTransaction(tx);
    console.log("✅ Draw transaction sent successfully!");
  } catch (err) {
    console.error("❌ Draw transaction failed:", err);
    throw err;
  }
}
