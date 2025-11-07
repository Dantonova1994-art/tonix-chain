#!/bin/bash

# === TONIX CHAIN 💎 MAINNET FULL DEPLOY & BUY FLOW ===

cd "$(dirname "$0")" || exit

echo "💎 Запуск боевого деплоя TONIX CHAIN..."
echo "---------------------------------------"

# 1️⃣ Проверяем окружение
if [ ! -f ".env" ]; then
  echo "❌ Файл .env не найден. Добавь MNEMONIC и TONCENTER_API_KEY перед запуском!"
  exit 1
fi

# Устанавливаем NETWORK=mainnet если не установлен
if ! grep -q "^NETWORK=mainnet" .env; then
  if grep -q "^NETWORK=" .env; then
    # Обновляем существующую запись (для macOS используем sed -i '', для Linux - sed -i)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's|^NETWORK=.*|NETWORK=mainnet|' .env
    else
      sed -i 's|^NETWORK=.*|NETWORK=mainnet|' .env
    fi
  else
    echo "NETWORK=mainnet" >> .env
  fi
fi

# 2️⃣ Проверяем баланс кошелька
echo "💰 Проверяем баланс..."
BAL_OUTPUT=$(npx tsx scripts/balance.ts 2>&1)

# Извлекаем баланс из вывода (формат: "💰 Balance: 0.500 TON")
BAL=$(echo "$BAL_OUTPUT" | grep -E "Balance:" | grep -Eo "[0-9]+(\.[0-9]+)?" | head -1)

if [ -z "$BAL" ]; then
  echo "❌ Не удалось получить баланс кошелька"
  echo "$BAL_OUTPUT"
  exit 1
fi

echo "Текущий баланс: $BAL TON"

# Проверяем, что баланс >= 0.2 TON
# Используем awk для сравнения, так как он доступен везде
BAL_CHECK=$(awk "BEGIN {print ($BAL >= 0.2)}")
if [ "$BAL_CHECK" = "0" ]; then
  echo "❌ Недостаточно TON для деплоя (нужно ≥ 0.2 TON, текущий: $BAL TON)"
  exit 1
fi

# 3️⃣ Очистка и сборка
echo "🧱 Компиляция контракта..."
rm -rf build
npx blueprint build --verbose || { echo "❌ Ошибка сборки"; exit 1; }

# 4️⃣ Деплой контракта в MAINNET
echo "🚀 Деплой контракта..."
DEPLOY_OUTPUT=$(npx tsx scripts/deploy.ts 2>&1)

# Извлекаем адрес контракта (формат: "🏗️  Contract: EQ...")
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -Eo "EQ[a-zA-Z0-9_-]{40,}" | head -1)

# Если не нашли в таком формате, пробуем другой паттерн
if [ -z "$CONTRACT_ADDRESS" ]; then
  CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -i "contract" | grep -Eo "EQ[a-zA-Z0-9_-]{40,}" | head -1)
fi

# Если все еще не нашли, ищем любой адрес EQ
if [ -z "$CONTRACT_ADDRESS" ]; then
  CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -Eo "EQ[a-zA-Z0-9_-]{48}" | head -1)
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "❌ Не удалось извлечь адрес контракта!"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi

echo "✅ Контракт задеплоен: $CONTRACT_ADDRESS"

# 5️⃣ Запись в .env
echo "📝 Сохраняем PROD_CONTRACT=$CONTRACT_ADDRESS в .env..."

if grep -q "^PROD_CONTRACT=" .env; then
  # Обновляем существующую запись (для macOS используем sed -i '', для Linux - sed -i)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^PROD_CONTRACT=.*|PROD_CONTRACT=$CONTRACT_ADDRESS|" .env
  else
    sed -i "s|^PROD_CONTRACT=.*|PROD_CONTRACT=$CONTRACT_ADDRESS|" .env
  fi
else
  echo "PROD_CONTRACT=$CONTRACT_ADDRESS" >> .env
fi

# 6️⃣ Проверка статуса контракта
echo "🔍 Проверяем контракт..."
sleep 5  # Небольшая задержка для активации контракта
npx tsx scripts/getState.ts 2>&1 || echo "ℹ️ Можно проверить вручную: https://tonviewer.com/$CONTRACT_ADDRESS"

# 7️⃣ Выполняем buy() на боевом контракте
echo "🎟  Запуск buy()..."
npx tsx scripts/buyTest.ts 2>&1

echo "---------------------------------------"
echo "✅ TONIX CHAIN успешно задеплоен в MAINNET!"
echo "📍 Адрес контракта: $CONTRACT_ADDRESS"
echo "🌐 Проверка: https://tonviewer.com/$CONTRACT_ADDRESS"
echo "💰 Покупка выполнена — проект в бою!"

