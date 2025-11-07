import { TonConnectUI } from "@tonconnect/ui-react";

export async function buyTicket(tonConnectUI: TonConnectUI) {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      console.error("❌ Contract address not configured");
      alert("❌ Адрес контракта не настроен. Проверьте переменные окружения.");
      return;
    }

    console.log("🎫 Initiating ticket purchase...");
    console.log("📍 Contract address:", contractAddress);
    console.log("💰 Amount: 0.5 TON (500000000 nanoTON)");

    if (!tonConnectUI.connected) {
      console.warn("⚠️ Wallet not connected");
      alert("⚠️ Пожалуйста, подключите кошелек сначала");
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
    alert("✅ Билет успешно куплен!");
  } catch (err) {
    console.error("❌ Transaction failed:", err);
    alert("❌ Ошибка при покупке билета.");
  }
}
