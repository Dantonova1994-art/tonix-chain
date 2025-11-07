// ─────────────────────────────────────────────
// TONIX CHAIN — Buy Ticket Test Script (Mainnet)
// ─────────────────────────────────────────────
import { TonClient, WalletContractV4, internal, toNano, fromNano } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import dotenv from "dotenv";

dotenv.config();

// Support testnet/mainnet via env
const NETWORK = process.env.NETWORK || "mainnet";
const CONTRACT_ADDRESS = NETWORK === "testnet" 
    ? process.env.TESTNET_CONTRACT || "EQXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" // Will be set after testnet deploy
    : (process.env.PROD_CONTRACT || "EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"); // Mainnet address (default or from PROD_CONTRACT)
const TICKET_PRICE = toNano("1");
const ENDPOINT = NETWORK === "testnet"
    ? "https://testnet.toncenter.com/api/v2/jsonRPC"
    : "https://toncenter.com/api/v2/jsonRPC";

async function main() {
    console.log(`🎟️ TONIX CHAIN — Buy Ticket Test (${NETWORK.toUpperCase()})\n`);

    const MNEMONIC = process.env.MNEMONIC || process.env.WALLET_MNEMONIC;
    if (!MNEMONIC) {
        throw new Error("❌ MNEMONIC или WALLET_MNEMONIC не указан в .env");
    }

    const words = MNEMONIC.trim().split(" ").filter(w => w.length > 0);
    if (words.length !== 24) {
        throw new Error("❌ Мнемоника должна содержать 24 слова");
    }

    // For testnet, API key is optional (may cause 401 if invalid)
    const API_KEY = NETWORK === "testnet" ? "" : (process.env.TONCENTER_API_KEY || "");

    // 1️⃣ Инициализация клиента и кошелька
    const client = new TonClient({ endpoint: ENDPOINT, apiKey: API_KEY });
    const key = await mnemonicToWalletKey(words);
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);

    const walletBalance = await walletContract.getBalance();
    console.log("💼 Wallet:", wallet.address.toString());
    console.log("💰 Wallet Balance:", fromNano(walletBalance), "TON");

    if (Number(walletBalance) < Number(TICKET_PRICE)) {
        throw new Error(`❌ Недостаточно TON на балансе (нужно ≥ ${fromNano(TICKET_PRICE)} TON)`);
    }

    // 2️⃣ Проверка текущего баланса контракта
    const { TonixLottery } = await import("../build/TonixLottery_TonixLottery");
    const contract = TonixLottery.fromAddress({ address: CONTRACT_ADDRESS });
    const contractProvider = client.open(contract);
    
    const contractState = await contractProvider.provider.getState();
    const contractBalanceBefore = await contractProvider.provider.getBalance();
    console.log("\n📊 Contract Status:", contractState.state);
    console.log("💰 Contract Balance (before):", fromNano(contractBalanceBefore), "TON");

    // 3️⃣ Получение seqno (перед отправкой)
    const seqno = await walletContract.getSeqno();
    console.log("🔢 Current seqno:", seqno);

    // 4️⃣ Отправка BuyTicket сообщения
    console.log("\n🎟️ Buying 1 ticket (sending BuyTicket message)...");
    
    await contractProvider.send(
        walletContract.sender(key.secretKey),
        {
            value: TICKET_PRICE,
            bounce: false,
        },
        {
            $$type: "BuyTicket",
        }
    );

    console.log("✅ Transaction sent! Waiting for confirmation...");
    console.log("⏳ Waiting 30 seconds for transaction to be processed...\n");

    // 6️⃣ Ожидание и проверка результата
    await new Promise((r) => setTimeout(r, 30000));

    const contractBalanceAfter = await contractProvider.provider.getBalance();
    const participantCount = await contract.getParticipantCount(contractProvider.provider);
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Buy Ticket Test Result:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💰 Contract Balance (after):", fromNano(contractBalanceAfter), "TON");
    console.log("📈 Balance Change:", fromNano(contractBalanceAfter - contractBalanceBefore), "TON");
    console.log("👥 Participant Count:", participantCount.toString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 Check in TonViewer:");
    console.log("   https://tonviewer.com/" + CONTRACT_ADDRESS);
    console.log("🔗 Check in Tonscan:");
    console.log("   https://tonscan.org/address/" + CONTRACT_ADDRESS);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (Number(contractBalanceAfter) > Number(contractBalanceBefore)) {
        console.log("✅ SUCCESS: Contract balance increased!");
        console.log("✅ Buy() function is working correctly in mainnet!\n");
    } else {
        console.log("⚠️  WARNING: Contract balance did not increase");
        console.log("   Transaction may still be processing. Check again in a few minutes.\n");
    }
}

main().catch((e) => {
    console.error("\n💥 Error:", e);
    process.exit(1);
});

