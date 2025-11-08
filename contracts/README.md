# NFT Ticket Contract

## Описание

NFT Ticket контракт для TONIX Chain лотереи. Хранит информацию о билетах как NFT на блокчейне TON.

## Структура контракта

- **owner**: Address — владелец NFT билета
- **round_id**: Int — номер раунда лотереи
- **ticket_id**: Int — уникальный ID билета
- **buy_tx_hash**: Slice — хеш транзакции покупки
- **created_at**: Int — время создания (timestamp)

## Функции

### `mint(owner, round_id, ticket_id, tx_hash)`
Минтит новый NFT билет. Только владелец контракта (minter) может вызывать эту функцию.

### `get_ticket_info()`
Возвращает информацию о билете: owner, round_id, ticket_id, created_at.

## Деплой

### Требования
- Node.js 18+
- Tact compiler
- TON wallet с балансом для деплоя

### Шаги

1. Установите зависимости:
```bash
npm install
```

2. Скомпилируйте контракт:
```bash
# Используйте Tact compiler для компиляции nft_ticket.tact
tact nft_ticket.tact
```

3. Настройте `.env`:
```
MNEMONIC="your 24 word mnemonic phrase"
PRIVATE_KEY=your_private_key
```

4. Запустите деплой:
```bash
npx ts-node scripts/deploy_nft_ticket.ts
```

5. Получите адрес контракта из вывода и добавьте в `.env.local`:
```
NEXT_PUBLIC_NFT_MINTER_ADDRESS=<deployed_contract_address>
```

## Интеграция

После деплоя контракт будет использоваться через API `/api/nft/mint` для создания NFT билетов при покупке лотерейных билетов.

