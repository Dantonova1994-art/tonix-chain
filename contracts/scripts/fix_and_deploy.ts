// 🚀 TONIX CHAIN: auto-compile + deploy FunC contract to TON mainnet/testnet
// Author: Tonix Chain Dev Team 🧠
// Run: `npx tsx scripts/fix_and_deploy.ts`

import { compile } from "@ton/blueprint";
import { TonClient, WalletContractV4, internal, contractAddress, toNano, beginCell, Cell } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

function lotteryConfigToCell(owner: any, ticketPrice: bigint) {
  return beginCell()
    .storeAddress(owner)
    .storeCoins(ticketPrice)
    .storeDict(null)
    .storeUint(0, 16)
    .endCell();
}

async function main() {
  console.log("🎯 TONIX CHAIN — deploy script (vFinal)\n");

  const MNEMONIC = process.env.WALLET_MNEMONIC;
  const NETWORK = process.env.NETWORK || "mainnet";
  const TICKET_PRICE = process.env.TICKET_PRICE || "1";
  const API_KEY = process.env.TONCENTER_API_KEY || "";

  if (!MNEMONIC) {
    throw new Error("❌ WALLET_MNEMONIC не найден в .env");
  }

  // Фильтруем пустые слова на случай лишних пробелов
  const words = MNEMONIC.trim().split(" ").filter(w => w.length > 0);
  if (words.length !== 24) {
    throw new Error(`❌ Мнемоника должна содержать ровно 24 слова (получено: ${words.length})`);
  }

  const ENDPOINT =
    NETWORK === "mainnet"
      ? "https://toncenter.com/api/v2/jsonRPC"
      : "https://testnet.toncenter.com/api/v2/jsonRPC";

  console.log("🌐 Сеть:", NETWORK);
  console.log("🔌 Endpoint:", ENDPOINT);

  // 1️⃣ Компиляция контракта
  console.log("\n📦 Компиляция Lottery через Blueprint...");
  try {
    await compile("Lottery");
    console.log("✅ Контракт успешно скомпилирован!");
  } catch (err: any) {
    console.error("❌ Ошибка компиляции:", err.message || err);
    process.exit(1);
  }

  const compiledPath = "build/Lottery.compiled.json";
  if (!fs.existsSync(compiledPath)) {
    throw new Error("❌ build/Lottery.compiled.json не найден!");
  }

  const compiled = JSON.parse(fs.readFileSync(compiledPath, "utf-8"));
  const codeCell = Cell.fromBoc(Buffer.from(compiled.hex, "hex"))[0];
  console.log("🧬 Code cell hash:", codeCell.hash().toString("hex"));

  // 2️⃣ Инициализация клиента и кошелька
  const client = new TonClient({ endpoint: ENDPOINT, apiKey: API_KEY });
  const key = await mnemonicToWalletKey(words);
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  const walletContract = client.open(wallet);

  const balance = await walletContract.getBalance();
  const balanceTON = (Number(balance) / 1e9).toFixed(3);
  console.log(`💰 Баланс кошелька: ${balanceTON} TON`);
  
  if (Number(balance) < 0.1 * 1e9) {
    throw new Error("❌ Недостаточно TON на балансе (нужно ≥ 0.1 TON)");
  }

  // 3️⃣ Формируем init data
  const owner = wallet.address;
  const ticketPrice = toNano(TICKET_PRICE);
  const dataCell = lotteryConfigToCell(owner, ticketPrice);
  
  const init = { code: codeCell, data: dataCell };
  const contractAddr = contractAddress(0, init);

  console.log("\n⚙️  Конфигурация контракта:");
  console.log("📍 Адрес контракта:", contractAddr.toString());
  console.log("🎫 Ticket price:", TICKET_PRICE, "TON");
  console.log("👤 Owner:", owner.toString());

  // 4️⃣ Отправка деплоя
  console.log("\n🚀 Отправка транзакции деплоя...");
  const seqno = await walletContract.getSeqno();
  console.log("🔢 Текущий seqno:", seqno);

  try {
    await walletContract.sendTransfer({
      seqno,
      secretKey: key.secretKey,
      messages: [
        internal({
          to: contractAddr,
          value: toNano("0.05"),
          init: init,
          body: beginCell().endCell(),
        }),
      ],
    });
  } catch (err: any) {
    console.error("💥 Ошибка при отправке транзакции:", err.message || err);
    process.exit(1);
  }

  console.log("📤 Транзакция отправлена. Ожидаем активации...");

  // 5️⃣ Проверка активации
  let active = false;
  const maxAttempts = 15;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    
    try {
      const account = await client.getAccount(contractAddr);
      if (account.account.state?.type === "active") {
        active = true;
        break;
      }
    } catch (e) {
      // Игнорируем ошибки во время ожидания
    }
    
    process.stdout.write(`⏳ ${i + 1}/${maxAttempts}... ожидание активации\r`);
  }

  console.log(); // новая строка после прогресса

  if (active) {
    console.log("✅ Контракт успешно активирован!");
  } else {
    console.log("⚠️  Контракт пока не активен. Проверь позже в блокчейн-эксплорере.");
  }

  // 6️⃣ Итоговый вывод
  console.log("\n📘 === DEPLOY SUMMARY ===");
  console.log("🌐 Network:", NETWORK);
  console.log("💼 Wallet:", owner.toString());
  console.log("🏗️  Contract:", contractAddr.toString());
  console.log("🎫 Ticket price:", TICKET_PRICE, "TON");
  console.log("🔢 Seqno:", seqno);
  console.log("🧩 Code hash:", codeCell.hash().toString("hex"));
  console.log("------------------------------");
  
  if (NETWORK === "mainnet") {
    console.log("🌍 Tonviewer: https://tonviewer.com/" + contractAddr.toString());
    console.log("🔗 Tonscan: https://tonscan.org/address/" + contractAddr.toString());
  } else {
    console.log("🌍 Tonviewer: https://testnet.tonviewer.com/" + contractAddr.toString());
    console.log("🔗 Tonscan: https://testnet.tonscan.org/address/" + contractAddr.toString());
  }
  
  console.log("------------------------------");
  console.log("\n💡 Для взаимодействия:");
  console.log("   📝 Покупка билета: отправь " + TICKET_PRICE + " TON на адрес контракта с OP_BUY (0x01)");
  console.log("   🎲 Розыгрыш: владелец отправляет OP_DRAW (0x02)");
  console.log("\n");
}

main().catch((e) => {
  console.error("\n💥 Непредвиденная ошибка:", e.message || e);
  process.exit(1);
});
