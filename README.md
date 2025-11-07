# 💎 TONIX CHAIN — Lottery on TON

![Tonix Chain Logo](./public/logo.png)

**Version:** v1.0.0 — Mainnet Release  
**Network:** TON Mainnet  
**Contract:** [`EQBtB8vIHgd049Jh02Yk9KDstDKxOTtFgZHKrKAjFTIvJzi`](https://tonviewer.com/EQBtB8vIHgd049Jh02Yk9KDstDKxOTtFgZHKrKAjFTIvJzi)  
**Frontend:** [https://tonix-chain.vercel.app](https://tonix-chain.vercel.app)  
**Telegram Mini App:** [@tonixchain_lottery_bot](https://t.me/tonixchain_lottery_bot)  
**Start App:** [https://t.me/tonixchain_lottery_bot/app?startapp=lottery](https://t.me/tonixchain_lottery_bot/app?startapp=lottery)

---

## 🚀 Overview

**TONIX CHAIN** — децентрализованная лотерея будущего на блокчейне **TON**, доступная прямо внутри **Telegram Mini App**.  

Проект объединяет простоту Web2 и прозрачность Web3, позволяя участвовать в играх с мгновенными результатами, безопасными TON-транзакциями и полностью открытым смарт-контрактом.

---

## 🧠 Stack

- **Smart Contracts:** Tact (`TonixLottery.tact`)
- **Network:** TON Mainnet
- **Backend:** Next.js API routes (`/api/twa/verify`)
- **Frontend:** Next.js + React + TypeScript
- **UI Framework:** CSS Modules + TonConnect UI
- **Deployment:** Vercel (auto CI/CD)
- **Telegram Integration:** Mini App via BotFather

---

## ⚙️ Environment Variables (`.env.local`)

```bash
NEXT_PUBLIC_TON_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=EQBtB8vIHgd049Jh02Yk9KDstDKxOTtFgZHKrKAjFTIvJzi
NEXT_PUBLIC_TONCONNECT_MANIFEST_URL=https://tonix-chain.vercel.app/tonconnect-manifest.json
NEXT_PUBLIC_BOT_USERNAME=tonixchain_lottery_bot
TELEGRAM_BOT_TOKEN=<your_botfather_token>
```

---

## 💡 Features

- 🎟 **Buy Tickets** — покупка билетов через TonConnect
- 🎰 **Draw Winner** — автоматический розыгрыш победителя (owner only)
- 💰 **Claim Prize** — получение выигрыша победителем
- 📊 **Live Stats** — реальное время: пул, участники, победитель
- 📜 **History** — история всех розыгрышей
- 👥 **Participants Dashboard** — админ-панель с экспортом CSV
- 🔒 **Telegram Mini App** — полная интеграция с Telegram
- 🌐 **Web App** — доступ через браузер

---

## 🗺️ Roadmap v1.1 (Q4 2025)

### 🚀 1. Telegram UX Upgrade

- Улучшение навигации в Mini App
- Поддержка нескольких активных лотерей
- Автоматическое обновление статуса без перезагрузки

### 💎 2. NFT Tickets

- Выпуск билетов как NFT на TON
- Возможность перепродажи и коллекционирования
- Интеграция с TON NFT Marketplace

### 🧩 3. TON Open League Integration

- Добавление TONIX CHAIN в Open Platform / Open League
- Поддержка токенов $TONIX для внутриигровых операций
- Рейтинг игроков и система бонусов

### 🔒 4. Smart Contract Enhancements

- Оптимизация логики draw/claim
- Поддержка мульти-сессий
- Возможность проверки выигрыша без транзакции

---

**Tonix Chain — bridging TON to the future of Web3 💠**
