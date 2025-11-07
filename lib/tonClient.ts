import { TonConnectUI } from "@tonconnect/ui-react";

export async function buyTicket(tonConnectUI: TonConnectUI) {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Contract address not configured");
    throw new Error("Адрес контракта не настроен. Проверьте переменные окружения.");
  }

  console.log("🎫 Initiating ticket purchase...");
  console.log("📍 Contract address:", contractAddress);
  console.log("💰 Amount: 0.5 TON (500000000 nanoTON)");

  if (!tonConnectUI.connected) {
    console.warn("⚠️ Wallet not connected");
    throw new Error("Пожалуйста, подключите кошелек сначала");
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
}
