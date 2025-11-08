/**
 * Deploy NFT Ticket Contract to TON Mainnet
 * 
 * Usage:
 * 1. Set PRIVATE_KEY in .env
 * 2. Run: npx ts-node scripts/deploy_nft_ticket.ts
 */

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, WalletContractV4, internal, fromNano } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";

async function deploy() {
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  // Load mnemonic from .env or environment
  const mnemonic = process.env.MNEMONIC?.split(" ") || [];
  if (mnemonic.length !== 24) {
    throw new Error("MNEMONIC must be 24 words");
  }

  const key = await mnemonicToWalletKey(mnemonic);
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  
  if (!(await client.isContractDeployed(wallet.address))) {
    throw new Error("Wallet is not deployed");
  }

  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();

  console.log("📦 Deploying NFT Ticket Contract...");
  console.log("📍 Wallet:", wallet.address.toString());
  console.log("🔢 Seqno:", seqno);

  // TODO: Deploy NFT Ticket contract
  // This requires compiled Tact contract
  console.log("⚠️  NFT Ticket contract deployment requires compiled Tact code");
  console.log("📝 Steps:");
  console.log("  1. Compile nft_ticket.tact using Tact compiler");
  console.log("  2. Get contract address from compilation");
  console.log("  3. Send deploy transaction");
  
  console.log("✅ Deployment script ready (compile Tact first)");
}

deploy().catch(console.error);

