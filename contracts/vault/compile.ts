// Скрипт для компиляции Vault через Blueprint
import { compile } from "@ton/blueprint";

async function main() {
    console.log("🔨 Компиляция Vault...\n");
    
    try {
        await compile("Vault");
        console.log("✅ Компиляция успешна!");
        console.log("📁 Результаты в: vault/build/");
    } catch (err: any) {
        console.error("❌ Ошибка компиляции:", err.message || err);
        process.exit(1);
    }
}

main();

