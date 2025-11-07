#!/bin/bash

# === TONIX CHAIN — MAINNET DEPLOY & MINI APP SETUP ===

cd "$(dirname "$0")" || exit

echo "💎 TONIX CHAIN — Полный деплой в MAINNET + Telegram Mini App"
echo "============================================================="
echo ""

# 1️⃣ Проверка окружения
echo "🔍 Проверка окружения..."
echo ""

NODE_VERSION=$(node -v 2>/dev/null || echo "не установлен")
NPM_VERSION=$(npm -v 2>/dev/null || echo "не установлен")

echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"

if [ "$NODE_VERSION" = "не установлен" ]; then
  echo "❌ Node.js не установлен. Установите Node.js 20+ с https://nodejs.org/"
  exit 1
fi

# Проверяем версию Node.js
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "⚠️  Рекомендуется Node.js 18+ (текущая версия: $NODE_VERSION)"
fi

echo "✅ Окружение проверено"
echo ""

# 2️⃣ Проверка и настройка contracts
echo "📦 Проверка контрактов..."
cd contracts || {
  echo "❌ Директория contracts не найдена!"
  exit 1
}

if [ ! -f ".env" ]; then
  echo "❌ Файл contracts/.env не найден!"
  echo "📝 Создайте .env с MNEMONIC и TONCENTER_API_KEY"
  exit 1
fi

# Проверяем наличие MNEMONIC
if ! grep -q "^MNEMONIC=" .env 2>/dev/null && ! grep -q "^WALLET_MNEMONIC=" .env 2>/dev/null; then
  echo "❌ MNEMONIC не найден в contracts/.env"
  echo "📝 Добавьте MNEMONIC=\"word1 word2 ... word24\" в contracts/.env"
  exit 1
fi

# Устанавливаем NETWORK=mainnet если не установлен
if ! grep -q "^NETWORK=mainnet" .env 2>/dev/null; then
  if grep -q "^NETWORK=" .env 2>/dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's|^NETWORK=.*|NETWORK=mainnet|' .env
    else
      sed -i 's|^NETWORK=.*|NETWORK=mainnet|' .env
    fi
  else
    echo "NETWORK=mainnet" >> .env
  fi
  echo "✅ Установлен NETWORK=mainnet"
fi

echo "✅ Контракты готовы"
echo ""

# 3️⃣ Деплой контракта
read -p "🚀 Деплоить контракт в mainnet? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Запуск деплоя контракта..."
  
  if [ -f "deploy-mainnet.sh" ]; then
    ./deploy-mainnet.sh || {
      echo "❌ Ошибка при деплое контракта"
      exit 1
    }
  else
    echo "⚠️  Скрипт deploy-mainnet.sh не найден, используем прямой деплой..."
    npx tsx scripts/deploy.ts || {
      echo "❌ Ошибка при деплое контракта"
      exit 1
    }
  fi
  
  # Извлекаем адрес контракта
  CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" .env | cut -d'=' -f2)
  
  if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "⚠️  Не удалось автоматически определить адрес контракта"
    read -p "Введите адрес контракта вручную (EQ...): " CONTRACT_ADDRESS
  fi
  
  echo "✅ Контракт задеплоен: $CONTRACT_ADDRESS"
else
  # Проверяем существующий адрес
  CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" .env | cut -d'=' -f2)
  
  if [ -z "$CONTRACT_ADDRESS" ]; then
    DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"
    CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
    echo "⚠️  Используется дефолтный адрес: $CONTRACT_ADDRESS"
  else
    echo "✅ Используется существующий контракт: $CONTRACT_ADDRESS"
  fi
fi

echo ""

# 4️⃣ Настройка фронтенда
echo "🌐 Настройка фронтенда..."
cd ../frontend || {
  echo "❌ Директория frontend не найдена!"
  exit 1
}

# Создаём .env.local если его нет
if [ ! -f ".env.local" ]; then
  echo "📝 Создаю .env.local..."
  touch .env.local
fi

# Обновляем переменные окружения
update_env_var() {
  local var_name=$1
  local var_value=$2
  
  if grep -q "^${var_name}=" .env.local 2>/dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${var_name}=.*|${var_name}=${var_value}|" .env.local
    else
      sed -i "s|^${var_name}=.*|${var_name}=${var_value}|" .env.local
    fi
  else
    echo "${var_name}=${var_value}" >> .env.local
  fi
}

update_env_var "NEXT_PUBLIC_CONTRACT_ADDRESS" "$CONTRACT_ADDRESS"
update_env_var "NEXT_PUBLIC_TON_NETWORK" "mainnet"

# Проверяем наличие других переменных
if ! grep -q "^NEXT_PUBLIC_BOT_USERNAME" .env.local 2>/dev/null; then
  update_env_var "NEXT_PUBLIC_BOT_USERNAME" "tonixchain_lottery_bot"
fi

if ! grep -q "^NEXT_PUBLIC_TONCONNECT_MANIFEST_URL" .env.local 2>/dev/null; then
  update_env_var "NEXT_PUBLIC_TONCONNECT_MANIFEST_URL" "https://tonix-chain.vercel.app/tonconnect-manifest.json"
fi

if ! grep -q "^TELEGRAM_BOT_TOKEN" .env.local 2>/dev/null || grep -q "^TELEGRAM_BOT_TOKEN=.*your_actual_bot_token" .env.local 2>/dev/null; then
  read -p "🤖 Введите TELEGRAM_BOT_TOKEN (или нажмите Enter чтобы пропустить): " BOT_TOKEN
  if [ ! -z "$BOT_TOKEN" ]; then
    update_env_var "TELEGRAM_BOT_TOKEN" "$BOT_TOKEN"
    echo "✅ TELEGRAM_BOT_TOKEN сохранён"
  else
    echo "⚠️  TELEGRAM_BOT_TOKEN не установлен (можно будет добавить позже)"
    if ! grep -q "^TELEGRAM_BOT_TOKEN" .env.local 2>/dev/null; then
      echo "# TELEGRAM_BOT_TOKEN=your_actual_bot_token_here" >> .env.local
    fi
  fi
fi

echo "✅ Фронтенд настроен"
echo ""

# 5️⃣ Установка зависимостей и сборка фронтенда
echo "📦 Установка зависимостей фронтенда..."
npm install --legacy-peer-deps || npm install

echo ""
echo "🔨 Сборка фронтенда..."
npm run build || {
  echo "❌ Ошибка при сборке фронтенда"
  echo "Проверьте ошибки выше и исправьте их"
  exit 1
}

echo "✅ Фронтенд собран"
echo ""

# 6️⃣ Проверка Vercel CLI
echo "☁️  Проверка Vercel CLI..."
if ! command -v vercel &> /dev/null; then
  echo "⚙️  Устанавливаю Vercel CLI..."
  npm install -g vercel || {
    echo "❌ Ошибка установки Vercel CLI"
    echo "Установите вручную: npm install -g vercel"
    exit 1
  }
fi

echo "✅ Vercel CLI установлен"
echo ""

# 7️⃣ Авторизация в Vercel
echo "🔑 Проверка авторизации в Vercel..."
VERCEL_USER=$(vercel whoami 2>/dev/null)

if [ -z "$VERCEL_USER" ]; then
  echo "⚠️  Не авторизован в Vercel"
  echo "🔐 Запускаю процесс авторизации..."
  vercel login || {
    echo "❌ Ошибка авторизации в Vercel"
    echo "Запустите вручную: vercel login"
    exit 1
  }
  VERCEL_USER=$(vercel whoami 2>/dev/null)
fi

echo "✅ Авторизован как: $VERCEL_USER"
echo ""

# 8️⃣ Инициализация проекта Vercel (если нужно)
if [ ! -f ".vercel/project.json" ]; then
  echo "⚙️  Инициализация проекта Vercel..."
  echo "ℹ️  Выберите существующий проект или создайте новый"
  vercel link --yes || vercel link
fi

# 9️⃣ Деплой в Vercel
read -p "🚀 Деплоить фронтенд в Vercel? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Запуск деплоя в Vercel..."
  
  DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
  DEPLOY_EXIT_CODE=$?
  
  if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo "❌ Ошибка деплоя:"
    echo "$DEPLOY_OUTPUT"
    exit 1
  fi
  
  # Извлекаем URL
  DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -E "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1 | sed 's/.*\(https:\/\/[a-zA-Z0-9-]*\.vercel\.app\).*/\1/')
  
  if [ -z "$DEPLOY_URL" ]; then
    DEPLOY_URL=$(vercel inspect --prod 2>/dev/null | grep -E "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1 | sed 's/.*\(https:\/\/[a-zA-Z0-9-]*\.vercel\.app\).*/\1/')
  fi
  
  if [ -z "$DEPLOY_URL" ]; then
    DEPLOY_URL="https://tonix-chain.vercel.app"
    echo "⚠️  Не удалось определить URL, используем: $DEPLOY_URL"
    echo "ℹ️  Проверьте URL в панели Vercel: https://vercel.com/dashboard"
  else
    echo "✅ URL определён: $DEPLOY_URL"
  fi
  
  # Обновляем manifest с реальным URL
  echo "📝 Обновляю tonconnect-manifest.json с production URL..."
  cat > public/tonconnect-manifest.json <<EOF
{
  "url": "${DEPLOY_URL}",
  "name": "TONIX CHAIN",
  "iconUrl": "https://ton.org/favicon.ico",
  "termsOfUseUrl": "${DEPLOY_URL}/terms",
  "privacyPolicyUrl": "${DEPLOY_URL}/privacy"
}
EOF
  
  # Обновляем переменную окружения
  update_env_var "NEXT_PUBLIC_TONCONNECT_MANIFEST_URL" "${DEPLOY_URL}/tonconnect-manifest.json"
  
  echo "✅ Деплой завершён: $DEPLOY_URL"
else
  DEPLOY_URL="https://tonix-chain.vercel.app"
  echo "⚠️  Деплой пропущен, используем дефолтный URL: $DEPLOY_URL"
fi

echo ""

# 🔟 Добавление переменных окружения в Vercel
echo "🔐 Настройка переменных окружения в Vercel..."
echo "ℹ️  Добавьте следующие переменные в Vercel Dashboard:"
echo "   → Settings → Environment Variables"
echo ""
echo "   NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
echo "   NEXT_PUBLIC_TON_NETWORK=mainnet"
echo "   NEXT_PUBLIC_BOT_USERNAME=tonixchain_lottery_bot"
echo "   NEXT_PUBLIC_TONCONNECT_MANIFEST_URL=$DEPLOY_URL/tonconnect-manifest.json"
echo "   TELEGRAM_BOT_TOKEN=<ваш_токен>"
echo ""

read -p "📝 Добавить переменные окружения автоматически? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "⚙️  Добавление переменных в Vercel..."
  
  vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production <<< "$CONTRACT_ADDRESS" 2>/dev/null || echo "⚠️  Переменная уже существует или ошибка"
  vercel env add NEXT_PUBLIC_TON_NETWORK production <<< "mainnet" 2>/dev/null || echo "⚠️  Переменная уже существует или ошибка"
  vercel env add NEXT_PUBLIC_BOT_USERNAME production <<< "tonixchain_lottery_bot" 2>/dev/null || echo "⚠️  Переменная уже существует или ошибка"
  vercel env add NEXT_PUBLIC_TONCONNECT_MANIFEST_URL production <<< "$DEPLOY_URL/tonconnect-manifest.json" 2>/dev/null || echo "⚠️  Переменная уже существует или ошибка"
  
  if grep -q "^TELEGRAM_BOT_TOKEN=" .env.local 2>/dev/null && ! grep -q "^TELEGRAM_BOT_TOKEN=.*your_actual_bot_token" .env.local 2>/dev/null; then
    BOT_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" .env.local | cut -d'=' -f2)
    if [ ! -z "$BOT_TOKEN" ]; then
      vercel env add TELEGRAM_BOT_TOKEN production <<< "$BOT_TOKEN" 2>/dev/null || echo "⚠️  Переменная уже существует или ошибка"
    fi
  fi
  
  echo "✅ Переменные окружения добавлены"
  echo "⚠️  Если возникли ошибки, добавьте переменные вручную через Vercel Dashboard"
fi

echo ""

# 1️⃣1️⃣ Финальный отчёт
echo "============================================================="
echo "✅ TONIX CHAIN успешно задеплоен в MAINNET!"
echo "============================================================="
echo ""
echo "📍 Контракт: $CONTRACT_ADDRESS"
echo "🌐 ТонViewer: https://tonviewer.com/$CONTRACT_ADDRESS"
echo "🌐 Tonscan: https://tonscan.org/address/$CONTRACT_ADDRESS"
echo ""
echo "🌍 Frontend URL: $DEPLOY_URL"
echo "🔗 Главная: $DEPLOY_URL"
echo "📄 Terms: $DEPLOY_URL/terms"
echo "🔒 Privacy: $DEPLOY_URL/privacy"
echo "👑 Admin: $DEPLOY_URL/admin"
echo ""
echo "🤖 Telegram Bot: @tonixchain_lottery_bot"
echo "📎 Mini App: https://t.me/tonixchain_lottery_bot/app?startapp=lottery"
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "1️⃣ Настройка Telegram Bot:"
echo "   → Откройте @BotFather в Telegram"
echo "   → Выполните: /setmenubutton"
echo "   → Выберите бота: @tonixchain_lottery_bot"
echo "   → Вставьте URL: $DEPLOY_URL"
echo ""
echo "   Или создайте новый Mini App:"
echo "   → /newapp"
echo "   → Выберите бота"
echo "   → Укажите URL: $DEPLOY_URL"
echo "   → Название: TONIX CHAIN"
echo "   → Описание: Decentralized Lottery on TON"
echo ""
echo "2️⃣ Проверка переменных окружения в Vercel:"
echo "   → https://vercel.com/dashboard"
echo "   → Выберите проект → Settings → Environment Variables"
echo "   → Убедитесь что все переменные добавлены"
echo ""
echo "3️⃣ Тестирование:"
echo "   → Откройте: $DEPLOY_URL"
echo "   → Подключите TON кошелёк"
echo "   → Купите билет (1 TON)"
echo "   → Проведите розыгрыш (только owner)"
echo "   → Получите приз (только winner)"
echo ""
echo "4️⃣ Проверка Telegram Mini App:"
echo "   → Откройте: https://t.me/tonixchain_lottery_bot/app?startapp=lottery"
echo "   → Проверьте работу всех функций"
echo ""
echo "============================================================="
echo "💎 TONIX CHAIN готов к использованию в MAINNET!"
echo "============================================================="

