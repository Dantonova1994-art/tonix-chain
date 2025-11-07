// ─────────────────────────────────────────────
// TONIX CHAIN — Contract State Check Script
// ─────────────────────────────────────────────
import { TonClient } from "@ton/ton";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const NETWORK = process.env.NETWORK || "mainnet";
    const CONTRACT_ADDRESS = NETWORK === "testnet" 
        ? process.env.TESTNET_CONTRACT 
        : (process.env.PROD_CONTRACT || process.env.CONTRACT_ADDRESS);

    if (!CONTRACT_ADDRESS) {
        throw new Error("❌ CONTRACT_ADDRESS или PROD_CONTRACT не указан в .env");
    }

    const ENDPOINT = NETWORK === "testnet"
        ? "https://testnet.toncenter.com/api/v2/jsonRPC"
        : "https://toncenter.com/api/v2/jsonRPC";
    const API_KEY = process.env.TONCENTER_API_KEY;

    const client = new TonClient({ 
        endpoint: ENDPOINT, 
        apiKey: API_KEY && API_KEY.length > 0 && !API_KEY.includes("tonix-chain") ? API_KEY : undefined 
    });

    try {
        const account = await client.provider(CONTRACT_ADDRESS, {}).getState();
        const balance = await client.provider(CONTRACT_ADDRESS, {}).getBalance();
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📊 Contract State Check");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📍 Address:", CONTRACT_ADDRESS);
        console.log("🌐 Network:", NETWORK.toUpperCase());
        console.log("📊 Status:", account.state.toUpperCase());
        console.log("💰 Balance:", (Number(balance) / 1e9).toFixed(6), "TON");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔗 Tonviewer: https://tonviewer.com/" + CONTRACT_ADDRESS);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } catch (e: any) {
        console.error("❌ Ошибка при проверке контракта:", e.message);
        process.exit(1);
    }
}

main().catch((e) => {
    console.error("\n💥 Error:", e.message);
    process.exit(1);
});

