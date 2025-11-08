import { TonConnectUI } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import toast from "react-hot-toast";
import { requireEnv, CONTRACT_ADDRESS } from "./env";

const CONTRACT_ADDRESS_FALLBACK = "EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT";

export async function buyTicket(tonConnectUI: TonConnectUI) {
  try {
    const contractAddress = CONTRACT_ADDRESS || CONTRACT_ADDRESS_FALLBACK;
    
    console.log("🎫 Initiating ticket purchase...");
    console.log("📍 Sending to contract:", contractAddress);
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
          amount: toNano(0.5).toString() // 0.5 TON в nanoTON
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

export async function sendVoteTransaction(
  tonConnectUI: TonConnectUI,
  daoAddress: string,
  proposalId: number,
  option: string
) {
  try {
    console.log("🗳️ Initiating vote transaction...");
    console.log("📍 DAO address:", daoAddress);
    console.log("📋 Proposal ID:", proposalId);
    console.log("✅ Option:", option);

    if (!tonConnectUI.connected) {
      console.warn("⚠️ Wallet not connected");
      toast.error("⚠️ Пожалуйста, подключите кошелек сначала");
      return;
    }

    // Формирование payload для голосования
    const payload = Buffer.from(
      JSON.stringify({ method: "vote", proposalId, option })
    ).toString("base64");

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: daoAddress,
          amount: "0",
          payload: payload,
        },
      ],
    };

    console.log("📤 Sending vote transaction...", tx);
    await tonConnectUI.sendTransaction(tx);
    console.log("✅ Vote transaction sent successfully!");
  } catch (err) {
    console.error("❌ Vote transaction failed:", err);
    throw err;
  }
}

export async function sendDrawTransaction(tonConnectUI: TonConnectUI, ownerAddress: string) {
  try {
    const contractAddress = CONTRACT_ADDRESS || CONTRACT_ADDRESS_FALLBACK;
    
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
