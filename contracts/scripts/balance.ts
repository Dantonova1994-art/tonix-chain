// ─────────────────────────────────────────────
// TONIX CHAIN — Wallet Balance Check Script
// ─────────────────────────────────────────────
import { TonClient, WalletContractV4, fromNano } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("💰 TONIX CHAIN — Wallet Balance Check\n");

    const MNEMONIC = process.env.MNEMONIC || process.env.WALLET_MNEMONIC;
    if (!MNEMONIC) {
        throw new Error("❌ MNEMONIC или WALLET_MNEMONIC не указан в .env");
    }

    const words = MNEMONIC.trim().split(" ").filter(w => w.length > 0);
    if (words.length !== 24) {
        throw new Error("❌ Мнемоника должна содержать 24 слова");
    }

    const NETWORK = process.env.NETWORK || "mainnet";
    const ENDPOINT = NETWORK === "testnet"
        ? "https://testnet.toncenter.com/api/v2/jsonRPC"
        : "https://toncenter.com/api/v2/jsonRPC";
    const API_KEY = process.env.TONCENTER_API_KEY;
    
    // Для testnet API ключ необязателен, для mainnet может быть нужен
    const client = new TonClient({ 
        endpoint: ENDPOINT, 
        apiKey: API_KEY && API_KEY.length > 0 && !API_KEY.includes("tonix-chain") ? API_KEY : undefined 
    });

    const key = await mnemonicToWalletKey(words);
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);

    const balance = await walletContract.getBalance();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💼 Wallet Address:", wallet.address.toString());
    console.log("🌐 Network:", NETWORK.toUpperCase());
    console.log("💰 Balance:", fromNano(balance), "TON");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const balanceNum = Number(balance);
    const minForDeploy = 0.2 * 1e9;
    const minForBuy = 1 * 1e9;
    
    console.log("\n📊 Status:");
    if (balanceNum >= minForDeploy) {
        console.log("  ✅ Sufficient for deployment (≥ 0.2 TON)");
    } else {
        console.log("  ❌ Insufficient for deployment (need ≥ 0.2 TON)");
    }
    
    if (balanceNum >= minForBuy) {
        console.log("  ✅ Sufficient for buy test (≥ 1 TON)");
    } else {
        console.log("  ❌ Insufficient for buy test (need ≥ 1 TON)");
    }
    
    console.log("\n🔗 Check in TonViewer:");
    console.log(`   https://tonviewer.com/${wallet.address.toString()}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((e) => {
    console.error("\n💥 Error:", e.message);
    process.exit(1);
});










