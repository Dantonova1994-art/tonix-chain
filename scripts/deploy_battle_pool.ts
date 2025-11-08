// scripts/deploy_battle_pool.ts
// Deployment script stub - not included in Next.js build

// TODO: После деплоя записать адрес в deployments/battle_pool.address
// И добавить в ENV: NEXT_PUBLIC_BATTLEPOOL_ADDRESS

// В реальной реализации здесь будет деплой BattlePool контракта
// Используйте @ton/blueprint для деплоя:
// import { toNano } from '@ton/core';
// import { NetworkProvider } from '@ton/blueprint';
// 
// export async function run(provider: NetworkProvider) {
//   const entryValueTon = parseFloat(process.env.NEXT_PUBLIC_BATTLE_ENTRY_TON || "0.1");
//   const entryValueNano = toNano(entryValueTon);
//   const ownerAddress = provider.sender().address!;
//   
//   const battlePool = provider.open(BattlePool.createFromConfig({
//     owner: ownerAddress,
//     entry_value: entryValueNano,
//   }, provider.api()));
//   
//   await battlePool.sendDeploy(provider.sender(), toNano('0.05'));
//   await provider.waitForDeploy(battlePool.address);
//   
//   console.log('🎮 BattlePool deployed:', battlePool.address.toString());
// }

