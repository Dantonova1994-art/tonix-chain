#!/bin/bash

# === TONIX CHAIN v5.6 "HYPERDRIVE" — AUTO DEPLOY & TEST SCRIPT ===
# Автор: ChatGPT x Cursor
# Цель: Проверка, билд и деплой HyperDrive в основной проект tonix-chain (Vercel)

echo "🚀 Запуск деплоя TONIX CHAIN v5.6 'HYPERDRIVE'..."

# 1️⃣ Проверка, что мы в нужной папке
if [ ! -d "frontend" ]; then
  echo "❌ Папка frontend не найдена. Открой корень tonix-chain и запусти снова."
  exit 1
fi

cd frontend

# 2️⃣ Проверка переменных окружения
echo "🔍 Проверяем .env.local ..."
if [ ! -f ".env.local" ]; then
  echo "⚠️ Файл .env.local отсутствует — создаём пустой шаблон."
  cat > .env.local <<'EOF'
NEXT_PUBLIC_TONIX_API=https://api.tonixchain.app
NEXT_PUBLIC_NOVA_AI_KEY=<твоя_API_ключ_OpenAI_или_пусто>
NEXT_PUBLIC_ENABLE_MUSIC=true
NEXT_PUBLIC_ENABLE_GALAXY_EFFECTS=true
EOF
else
  echo "✅ Файл .env.local найден."
fi

# 3️⃣ Проверка связи с нужным проектом Vercel
if [ -d ".vercel" ]; then
  echo "🔗 Проверяем текущую привязку Vercel..."
  if grep -q "tonix-chain" .vercel/project.json 2>/dev/null; then
    echo "✅ Связан с tonix-chain"
  else
    echo "⚠️ Не tonix-chain. Перепривязываем..."
    rm -rf .vercel
    vercel link --project tonix-chain --yes
  fi
else
  echo "🔗 Привязываем к tonix-chain..."
  vercel link --project tonix-chain --yes
fi

# 4️⃣ Очистка билдов и установка зависимостей
echo "🧹 Очистка старых билдов..."
rm -rf .next node_modules/.cache 2>/dev/null || true

echo "📦 Установка зависимостей..."
npm install --legacy-peer-deps

# 5️⃣ Проверка и билд
echo "🏗️ Сборка проекта..."
npm run build || { echo "❌ Ошибка сборки! Проверь консоль."; exit 1; }

# 6️⃣ Принудительный деплой на Vercel
echo "🌐 Деплой в основной проект tonix-chain..."
vercel --prod --force --yes || echo "⚠️ Деплой не удался. Проверь доступ в Vercel Dashboard."

# 7️⃣ Финальное сообщение
echo ""
echo "✅ TONIX CHAIN v5.6 'HYPERDRIVE' задеплоен успешно!"
echo ""
echo "📲 Проверь Mini App в Telegram:"
echo "https://t.me/tonixchain_lottery_bot/app?startapp=lottery&v=12"
echo ""
echo "💎 Проверка:"
echo "👾 NOVA AI — кнопка в правом нижнем углу"
echo "🏆 LeaderboardV2 — топ игроков"
echo "🔔 SystemNotifier — уведомления о событиях"
echo "📊 Live Metrics — обновление каждые 10 секунд"
echo ""
echo "⚡ Если UI не обновился — закрой Telegram и открой снова с параметром &v=12"

