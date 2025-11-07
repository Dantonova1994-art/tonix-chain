#!/bin/bash

# === TONIX CHAIN 💎 VERCEL DEPLOY AUTOMATION ===

cd "$(dirname "$0")" || exit

echo "🚀 Деплой TONIX CHAIN в продакшен (Vercel)..."
echo "---------------------------------------------------"

# 1️⃣ Проверяем зависимости
if ! command -v vercel &> /dev/null; then
  echo "⚙️ Устанавливаю Vercel CLI..."
  npm install -g vercel || {
    echo "❌ Ошибка установки Vercel CLI. Попробуйте установить вручную: npm install -g vercel"
    exit 1
  }
  echo "✅ Vercel CLI установлен"
else
  echo "✅ Vercel CLI найден"
fi

# 2️⃣ Проверяем авторизацию
echo "🔑 Проверка авторизации в Vercel..."
VERCEL_USER=$(vercel whoami 2>/dev/null)

if [ -z "$VERCEL_USER" ]; then
  echo "⚠️  Не авторизован в Vercel"
  echo "🔐 Запускаю процесс авторизации..."
  echo "ℹ️  Следуйте инструкциям на экране для авторизации"
  vercel login || {
    echo "❌ Ошибка авторизации. Попробуйте запустить 'vercel login' вручную"
    exit 1
  }
  VERCEL_USER=$(vercel whoami 2>/dev/null)
fi

echo "✅ Авторизован как: $VERCEL_USER"

# 3️⃣ Проверяем наличие .env.local и создаём если нужно
if [ ! -f ".env.local" ]; then
  echo "📝 Создаю .env.local..."
  
  DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"
  if [ -f "../contracts/.env" ]; then
    CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" ../contracts/.env | cut -d'=' -f2)
  fi
  
  if [ -z "$CONTRACT_ADDRESS" ]; then
    CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
  fi
  
  cat > .env.local <<EOF
NEXT_PUBLIC_BOT_USERNAME=tonixchain_lottery_bot
NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
EOF
  echo "✅ Создан .env.local (обновите TELEGRAM_BOT_TOKEN если нужно)"
else
  echo "✅ .env.local найден"
  # Проверяем наличие обязательных переменных
  if ! grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env.local 2>/dev/null; then
    DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"
    if [ -f "../contracts/.env" ]; then
      CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" ../contracts/.env | cut -d'=' -f2)
    fi
    if [ -z "$CONTRACT_ADDRESS" ]; then
      CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
    fi
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}" >> .env.local
    echo "✅ Добавлен NEXT_PUBLIC_CONTRACT_ADDRESS в .env.local"
  fi
fi

# 4️⃣ Устанавливаем зависимости и билдим проект
echo "📦 Установка зависимостей..."
npm install --legacy-peer-deps || {
  echo "⚠️  Некоторые зависимости могут быть уже установлены, продолжаю..."
}

echo "🔨 Сборка проекта..."
npm run build || {
  echo "❌ Ошибка сборки проекта. Проверьте ошибки выше"
  exit 1
}

echo "✅ Проект успешно собран"

# 5️⃣ Настраиваем Vercel проект (если не инициализирован)
if [ ! -f ".vercel/project.json" ]; then
  echo "⚙️ Инициализация проекта Vercel..."
  
  # Используем неинтерактивный режим если возможно
  PROJECT_NAME="tonix-chain"
  
  # Создаём директорию .vercel если её нет
  mkdir -p .vercel
  
  # Пытаемся найти существующий проект или создать новый
  echo "ℹ️  Для инициализации проекта может потребоваться интерактивный ввод"
  echo "ℹ️  Выберите существующий проект или создайте новый"
  
  vercel link --yes --name "$PROJECT_NAME" || {
    echo "⚠️  Автоматическая инициализация не удалась"
    echo "ℹ️  Запускаю интерактивную инициализацию..."
    vercel link
  }
  
  if [ -f ".vercel/project.json" ]; then
    echo "✅ Проект Vercel инициализирован"
  else
    echo "⚠️  Проект не был инициализирован автоматически. Продолжаю деплой..."
  fi
else
  echo "✅ Проект Vercel уже инициализирован"
fi

# 6️⃣ Читаем настройки проекта если они есть
PROJECT_NAME="tonix-chain"
if [ -f ".vercel/project.json" ]; then
  PROJECT_NAME=$(cat .vercel/project.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "tonix-chain")
  echo "📍 Используется проект: $PROJECT_NAME"
fi

# 7️⃣ Деплой в продакшен
echo "🌐 Выполняю деплой проекта в продакшен..."
echo "⏳ Это может занять несколько минут..."

# Деплоим с явным указанием продакшн окружения
DEPLOY_OUTPUT=$(vercel --prod --yes --confirm 2>&1)
DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
  echo "❌ Ошибка деплоя:"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi

# Извлекаем URL из вывода
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -E "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1 | sed 's/.*\(https:\/\/[a-zA-Z0-9-]*\.vercel\.app\).*/\1/')

if [ -z "$DEPLOY_URL" ]; then
  # Пытаемся получить URL через vercel inspect
  DEPLOY_URL=$(vercel inspect --prod 2>/dev/null | grep -E "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1 | sed 's/.*\(https:\/\/[a-zA-Z0-9-]*\.vercel\.app\).*/\1/')
fi

if [ -z "$DEPLOY_URL" ]; then
  # Используем дефолтный URL
  DEPLOY_URL="https://tonix-chain.vercel.app"
  echo "⚠️  Не удалось автоматически определить URL, используем: $DEPLOY_URL"
  echo "ℹ️  Проверьте URL в панели Vercel: https://vercel.com/dashboard"
else
  echo "✅ URL определён: $DEPLOY_URL"
fi

# 8️⃣ Обновляем манифест для TonConnect
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

echo "✅ Обновлён tonconnect-manifest.json"

# Коммитим обновлённый manifest (опционально)
if [ -d ".git" ]; then
  echo "📝 Обновляю manifest в git..."
  git add public/tonconnect-manifest.json
  git commit -m "Update tonconnect manifest with production URL" 2>/dev/null || true
fi

# 9️⃣ Выводим финальный отчёт
echo ""
echo "==================================================="
echo "✅ TONIX CHAIN успешно задеплоен!"
echo "==================================================="
echo "🌍 Production URL: $DEPLOY_URL"
echo "🔗 Главная страница: $DEPLOY_URL"
echo "📡 API Verify: $DEPLOY_URL/api/twa/verify"
echo ""
echo "🤖 Telegram Bot: @tonixchain_lottery_bot"
echo "📎 Mini App link: https://t.me/tonixchain_lottery_bot/app?startapp=lottery"
echo ""
echo "📊 Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "💡 Следующие шаги:"
echo "   1. Откройте @BotFather в Telegram"
echo "   2. Выполните: /setmenubutton"
echo "   3. Выберите бота: @tonixchain_lottery_bot"
echo "   4. Вставьте URL: $DEPLOY_URL"
echo "   5. Или используйте: /newapp для создания нового Mini App"
echo ""
echo "🔐 Не забудьте:"
echo "   - Добавить TELEGRAM_BOT_TOKEN в Vercel Environment Variables"
echo "   - Добавить переменные из .env.local в Vercel Dashboard"
echo "   - Проверить настройки Domain в Vercel (если используете кастомный домен)"
echo "==================================================="

