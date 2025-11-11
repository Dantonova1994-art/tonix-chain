import { WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const MNEMONIC = process.env.MNEMONIC || process.env.WALLET_MNEMONIC;
    if (!MNEMONIC) {
        throw new Error("❌ MNEMONIC not found in .env");
    }

    const words = MNEMONIC.trim().split(" ").filter(w => w.length > 0);
    if (words.length !== 24) {
        throw new Error("❌ Invalid mnemonic (must be 24 words)");
    }

    const key = await mnemonicToWalletKey(words);
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💼 Wallet Address:", wallet.address.toString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 Request testnet TON:");
    console.log("   https://t.me/testgiver_ton_bot");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(console.error);










