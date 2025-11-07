// ─────────────────────────────────────────────
// TONIX CHAIN — Production Deploy Script (Mainnet Only)
// ─────────────────────────────────────────────
import { compile } from "@ton/blueprint";
import { TonClient, WalletContractV4, internal, contractAddress, toNano, beginCell, Cell } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function main() {
    console.log("🚀 TONIX CHAIN — Production Deploy to Mainnet\n");

    const MNEMONIC = process.env.MNEMONIC || process.env.WALLET_MNEMONIC;
    const TICKET_PRICE = process.env.TICKET_PRICE || "1";
    const API_KEY = process.env.TONCENTER_API_KEY || "";

    if (!MNEMONIC) {
        throw new Error("❌ MNEMONIC или WALLET_MNEMONIC не указан в .env");
    }

    const words = MNEMONIC.trim().split(" ").filter(w => w.length > 0);
    if (words.length !== 24) {
        throw new Error("❌ Мнемоника должна содержать 24 слова");
    }

    // Mainnet endpoint
    const endpoint = "https://toncenter.com/api/v2/jsonRPC";
    console.log("🌐 Network: MAINNET");
    console.log("🔌 Endpoint:", endpoint);

    // 1️⃣ Компиляция контракта
    console.log("\n📦 Компиляция TonixLottery через Blueprint...");
    try {
        await compile("TonixLottery");
    } catch (err) {
        // Если компиляция не удалась, проверяем существующий build
        console.warn("⚠️ Компиляция не удалась, проверяем существующий build...");
        const compiledPath = "build/TonixLottery.compiled.json";
        if (!fs.existsSync(compiledPath)) {
            console.error("❌ Ошибка компиляции:", err);
            console.error("❌ build/TonixLottery.compiled.json не найден!");
            process.exit(1);
        }
        console.log("✅ Используем существующий build");
    }

    // Проверяем возможные пути к скомпилированному файлу
    let compiledPath = "build/TonixLottery.compiled.json";
    if (!fs.existsSync(compiledPath)) {
        compiledPath = "build/TonixLottery/TonixLottery.compiled.json";
    }
    if (!fs.existsSync(compiledPath)) {
        // Ищем любой файл с TonixLottery в build
        const buildFiles = fs.readdirSync("build").filter(f => f.includes("TonixLottery") && f.endsWith(".json"));
        if (buildFiles.length > 0) {
            compiledPath = `build/${buildFiles[0]}`;
        }
    }
    
    if (!fs.existsSync(compiledPath)) {
        throw new Error(`❌ Скомпилированный файл не найден! Проверь build/`);
    }

    const compiled = JSON.parse(fs.readFileSync(compiledPath, "utf-8"));
    const codeCell = Cell.fromBoc(Buffer.from(compiled.hex, "hex"))[0];
    console.log("✅ Контракт скомпилирован");
    console.log("🧬 Code hash:", codeCell.hash().toString("hex"));

    // 2️⃣ Инициализация TON клиента и кошелька
    // Если API ключ пустой или некорректный, работаем без него
    const client = new TonClient({ 
        endpoint, 
        apiKey: API_KEY && API_KEY.length > 0 && !API_KEY.includes("tonix-chain") ? API_KEY : undefined 
    });
    const key = await mnemonicToWalletKey(words);
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);

    const balance = await walletContract.getBalance();
    console.log(`\n💼 Wallet: ${wallet.address.toString()}`);
    console.log(`💰 Balance: ${(Number(balance) / 1e9).toFixed(3)} TON`);

    if (Number(balance) < 0.2 * 1e9) {
        throw new Error("❌ Недостаточно TON на балансе (нужно ≥ 0.2 TON)");
    }

    // 3️⃣ Подготовка init data для TonixLottery
    const owner = wallet.address;
    const ticketPrice = toNano(TICKET_PRICE);

    // Используем TonixLottery.fromInit для правильной инициализации
    const { TonixLottery } = await import("../build/TonixLottery_TonixLottery");
    const contract = await TonixLottery.fromInit(owner, ticketPrice);
    const contractAddr = contract.address;

    console.log("\n📍 Contract Address:", contractAddr.toString());
    console.log("🎫 Ticket Price:", TICKET_PRICE, "TON");
    console.log("👤 Owner:", owner.toString());

    // 4️⃣ Проверка, не задеплоен ли уже контракт
    try {
        const account = await client.provider(contractAddr, {}).getState();
        if (account.state === 'active') {
            console.log("\n⚠️  Контракт уже задеплоен по адресу:", contractAddr.toString());
            console.log("🔗 Tonviewer: https://tonviewer.com/" + contractAddr.toString());
            return;
        }
    } catch (e) {
        // Контракт еще не задеплоен - продолжаем
    }

    // 5️⃣ Отправка деплоя
    console.log("\n🚀 Отправка транзакции деплоя...");
    const seqno = await walletContract.getSeqno();
    console.log("🔢 Seqno:", seqno);

    try {
        await walletContract.sendTransfer({
            seqno,
            secretKey: key.secretKey,
            messages: [
                internal({
                    to: contractAddr,
                    value: toNano("0.1"),
                    init: contract.init,
                    body: beginCell()
                        .storeUint(0x00000000, 32) // Deploy opcode
                        .storeStringTail("Deploy TonixLottery")
                        .endCell(),
                    bounce: false,
                }),
            ],
        });
    } catch (err) {
        console.error("💥 Ошибка при отправке транзакции:", err);
        process.exit(1);
    }

    console.log("📤 Транзакция отправлена. Ожидаем активации...");

    // 6️⃣ Проверка активации с повторными попытками деплоя
    let active = false;
    let attempts = 0;
    const maxAttempts = 3;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        attempts = attempt + 1;
        console.log(`\n🔄 Попытка активации ${attempts}/${maxAttempts}...`);
        
        // Ожидание перед проверкой
        if (attempt > 0) {
            console.log("⏳ Ожидание 20 секунд перед повторной проверкой...");
            await new Promise((r) => setTimeout(r, 20000));
        } else {
            console.log("⏳ Ожидание 30 секунд перед первой проверкой...");
            await new Promise((r) => setTimeout(r, 30000));
        }
        
        // Проверка статуса через API
        try {
            const account = await client.provider(contractAddr, {}).getState();
            if (account.state === 'active') {
                active = true;
                console.log(`✅ Контракт активирован на попытке ${attempts}`);
                break;
            }
        } catch (e) {
            // Контракт еще не активен
        }
        
        // Если не активен и не последняя попытка - повторный деплой
        if (attempt < maxAttempts - 1) {
            console.log(`❌ Контракт неактивен, повторный деплой...`);
            const retrySeqno = await walletContract.getSeqno();
            try {
                await walletContract.sendTransfer({
                    seqno: retrySeqno,
                    secretKey: key.secretKey,
                    messages: [
                        internal({
                            to: contractAddr,
                            value: toNano("0.1"),
                            init: contract.init,
                            body: beginCell()
                                .storeUint(0x00000000, 32)
                                .storeStringTail("Deploy TonixLottery Retry")
                                .endCell(),
                            bounce: false,
                        }),
                    ],
                });
                console.log(`📤 Повторный деплой отправлен (seqno: ${retrySeqno})`);
            } catch (err) {
                console.error(`⚠️ Ошибка при повторном деплое: ${err}`);
            }
        } else {
            // Проверка статуса несколько раз перед финальным выводом
            for (let i = 0; i < 10; i++) {
                try {
                    const finalCheck = await client.provider(contractAddr, {}).getState();
                    if (finalCheck.state === 'active') {
                        active = true;
                        console.log(`✅ Контракт активирован на финальной проверке`);
                        break;
                    }
                } catch (e) {
                    // Продолжаем проверку
                }
                process.stdout.write(`⏳ Финальная проверка ${i + 1}/10...\r`);
                await new Promise((r) => setTimeout(r, 4000));
            }
            console.log("\n");
        }
    }

    // 7️⃣ Итоговый отчёт
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (active) {
        console.log("✅ DEPLOY SUCCESS");
        console.log("⏳  Activation confirmed (Status: Active)");
    } else {
        console.log("⚠️  Контракт отправлен, но пока не активирован");
        console.log("   Проверь статус позже в Tonviewer");
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🌐 Network: MAINNET");
    console.log("💼 Wallet:", owner.toString());
    console.log("🏗️  Contract:", contractAddr.toString());
    console.log("🎫 Ticket Price:", TICKET_PRICE, "TON");
    console.log("🧩 Code Hash:", codeCell.hash().toString("hex"));
    if (active) {
        console.log("✅ Status: ACTIVE");
    } else {
        console.log("⚠️  Status: PENDING ACTIVATION");
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 Tonviewer: https://tonviewer.com/" + contractAddr.toString());
    console.log("🔗 Tonscan: https://tonscan.org/address/" + contractAddr.toString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((e) => {
    console.error("\n💥 Ошибка деплоя:", e);
    process.exit(1);
});

