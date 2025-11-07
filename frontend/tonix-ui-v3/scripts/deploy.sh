#!/bin/bash

set -e

# Версия: v4.6 "Mobile Ready"
VERSION="v4.6"
PROJECT_DIR="$HOME/tonix-chain/frontend/tonix-ui-v3"
SITE_URL="https://tonix-lottery-ui.vercel.app"
BOT_TOKEN="PASTE_YOUR_BOT_TOKEN_HERE"
CHAT_ID="PASTE_YOUR_TELEGRAM_ID_HERE"

# Проверяем авторизацию в Vercel
if ! vercel whoami >/dev/null 2>&1; then
  echo "🔑 Авторизация в Vercel отсутствует. Введите данные:"
  vercel login
fi

# Переходим в проект
cd "$PROJECT_DIR" || { echo "❌ Не удалось открыть проект Tonix UI."; exit 1; }

echo "🚀 Деплой Tonix UI $VERSION..."
DEPLOY_OUTPUT=$(vercel --prod --confirm --yes 2>&1)

# Извлекаем URL (если отличается от основного)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://[^ ]+\.vercel\.app' | head -1)
if [ -z "$DEPLOY_URL" ]; then
  DEPLOY_URL=$SITE_URL
fi

echo "✅ Деплой завершён: $DEPLOY_URL"

# Отправляем уведомление в Telegram
MESSAGE="🚀 Tonix UI обновлён до ${VERSION}!\n🌐 Новая версия доступна: ${DEPLOY_URL}"
curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d chat_id="${CHAT_ID}" \
  -d text="${MESSAGE}" \
  -d parse_mode="HTML" >/dev/null

# Открываем сайт в браузере
if command -v open >/dev/null; then
  open "$DEPLOY_URL"
else
  echo "🌐 Открой вручную: $DEPLOY_URL"
fi

echo "🎉 Tonix UI $VERSION задеплоен успешно!"
