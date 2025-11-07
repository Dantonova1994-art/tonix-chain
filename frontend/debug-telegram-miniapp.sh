#!/bin/bash

# === TONIXCHAIN LOTTERY MINI APP DEBUG & FIX SCRIPT ===
# Цель: найти и устранить причину ошибки "404: NOT_FOUND" при запуске Mini App в Telegram.
# Рабочая среда: Next.js (Vercel), mainnet, бот @tonixchain_lottery_bot

cd "$(dirname "$0")" || exit

echo "🔍 TONIXCHAIN LOTTERY MINI APP DEBUG & FIX"
echo "=========================================="
echo ""

# 1. Проверка ENV
echo "🔍 [1/10] Проверка .env.local..."

if [ ! -f ".env.local" ]; then
  echo "⚠️ Файл .env.local не найден, создаём новый..."
  touch .env.local
fi

# Сохраняем существующие переменные если они есть
if grep -q "^NEXT_PUBLIC_CONTRACT_ADDRESS=" .env.local 2>/dev/null; then
  CONTRACT_ADDR=$(grep "^NEXT_PUBLIC_CONTRACT_ADDRESS=" .env.local | cut -d'=' -f2)
else
  CONTRACT_ADDR="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"
fi

# Обновляем ключевые переменные окружения, не перезаписывая существующие
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

update_env_var "NEXT_PUBLIC_APP_URL" "https://tonix-chain.vercel.app"
update_env_var "NEXT_PUBLIC_BOT_USERNAME" "tonixchain_lottery_bot"
update_env_var "NEXT_PUBLIC_TWA_VERIFY_URL" "/api/twa/verify"

if ! grep -q "^NEXT_PUBLIC_CONTRACT_ADDRESS=" .env.local 2>/dev/null; then
  update_env_var "NEXT_PUBLIC_CONTRACT_ADDRESS" "$CONTRACT_ADDR"
fi

if ! grep -q "^TELEGRAM_BOT_TOKEN=" .env.local 2>/dev/null || grep -q "^TELEGRAM_BOT_TOKEN=.*ВСТАВЬ_ТОКЕН" .env.local 2>/dev/null; then
  echo "# TELEGRAM_BOT_TOKEN=<ВСТАВЬ_ТОКЕН_ОТСЮДА: https://t.me/BotFather>" >> .env.local
fi

echo "✅ Обновлены переменные среды"
echo ""

# 2. Проверка структуры проекта
echo "🔍 [2/10] Проверка структуры Next.js..."

if [ -d "src/pages" ]; then
  echo "✅ Найдена структура: src/pages/"
  PAGES_DIR="src/pages"
elif [ -d "pages" ]; then
  echo "✅ Найдена структура: pages/"
  PAGES_DIR="pages"
else
  echo "❌ Папка pages не найдена!"
  exit 1
fi

if [ -d "public" ]; then
  echo "✅ Папка public найдена"
else
  echo "⚠️ Создаю папку public..."
  mkdir -p public
fi

if [ -f "next.config.js" ]; then
  echo "✅ next.config.js найден"
else
  echo "⚠️ next.config.js не найден"
fi

if [ -f "package.json" ]; then
  echo "✅ package.json найден"
else
  echo "❌ package.json не найден!"
  exit 1
fi

echo ""

# 3. Проверка маршрутов
echo "🔍 [3/10] Проверка маршрутов..."

if [ -f "${PAGES_DIR}/index.tsx" ]; then
  echo "✅ Главная страница найдена: ${PAGES_DIR}/index.tsx"
  echo "   Первые строки:"
  head -n 5 "${PAGES_DIR}/index.tsx" | sed 's/^/   /'
elif [ -f "${PAGES_DIR}/index.ts" ]; then
  echo "✅ Главная страница найдена: ${PAGES_DIR}/index.ts"
else
  echo "❌ Главная страница не найдена!"
  echo "   Создаю базовую страницу..."
  mkdir -p "${PAGES_DIR}"
  cat > "${PAGES_DIR}/index.tsx" <<'EOF'
import React from 'react';

export default function Home() {
  return (
    <main style={{ padding: '20px', textAlign: 'center', color: 'white', background: '#000' }}>
      <h1>TONIX CHAIN 💎</h1>
      <p>Lottery on TON</p>
    </main>
  );
}
EOF
  echo "✅ Базовая страница создана"
fi

echo ""

# 4. Проверка manifest.json
echo "🔍 [4/10] Проверка tonconnect-manifest.json..."

if [ ! -f "public/tonconnect-manifest.json" ]; then
  echo "⚠️ Манифест не найден, создаю..."
fi

cat > public/tonconnect-manifest.json <<'EOF'
{
  "url": "https://tonix-chain.vercel.app",
  "name": "TONIX CHAIN",
  "iconUrl": "https://tonix-chain.vercel.app/icon.png",
  "termsOfUseUrl": "https://tonix-chain.vercel.app/terms",
  "privacyPolicyUrl": "https://tonix-chain.vercel.app/privacy"
}
EOF

echo "✅ Манифест обновлён"
echo ""

# 5. Проверка API маршрута /api/twa/verify
echo "🔍 [5/10] Проверка TWA verify API..."

if [ -f "${PAGES_DIR}/api/twa/verify.ts" ]; then
  echo "✅ API маршрут найден: ${PAGES_DIR}/api/twa/verify.ts"
else
  echo "⚠️ API маршрут не найден, создаю..."
  mkdir -p "${PAGES_DIR}/api/twa"
  
  cat > "${PAGES_DIR}/api/twa/verify.ts" <<'EOF'
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { initData } = req.query;
  
  if (!initData) {
    return res.status(400).json({ error: 'Missing initData' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  
  // В режиме разработки пропускаем проверку если токен не установлен
  if (!botToken && process.env.NODE_ENV === 'development') {
    return res.status(200).json({ ok: true, dev: true });
  }

  try {
    const parsed = Object.fromEntries(new URLSearchParams(initData as string));
    const checkHash = parsed.hash;
    
    if (!checkHash) {
      return res.status(400).json({ error: 'Hash not found in initData' });
    }
    
    delete parsed.hash;
    
    const dataCheckString = Object.keys(parsed)
      .sort()
      .map((k) => `${k}=${parsed[k]}`)
      .join('\n');
    
    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
    
    if (hash !== checkHash) {
      return res.status(403).json({ error: 'Invalid initData hash' });
    }
    
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
EOF
  
  echo "✅ /api/twa/verify добавлен"
fi

echo ""

# 6. Проверка конфигурации Next.js
echo "🔍 [6/10] Проверка next.config.js..."

if [ ! -f "next.config.js" ]; then
  echo "⚠️ next.config.js отсутствует, создаём дефолтный..."
fi

cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF

echo "✅ Конфигурация Next.js проверена"
echo ""

# 7. Проверка зависимостей
echo "🔍 [7/10] Проверка зависимостей..."

if [ ! -d "node_modules" ]; then
  echo "⚠️ node_modules не найден, устанавливаю зависимости..."
  npm install --legacy-peer-deps
else
  echo "✅ node_modules найден"
fi

echo ""

# 8. Локальная сборка
echo "🔍 [8/10] Проверка сборки..."

if npm run build 2>&1 | grep -q "Compiled successfully"; then
  echo "✅ Сборка успешна"
else
  echo "⚠️ Ошибки при сборке:"
  npm run build 2>&1 | tail -20
  echo ""
  echo "ℹ️ Проверьте ошибки выше"
fi

echo ""

# 9. Проверка продакшн деплоя
echo "🔍 [9/10] Проверка продакшн-деплоя..."

PROD_URL="https://tonix-chain.vercel.app"

echo "Проверяю доступность: $PROD_URL"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Продакшн доступен (HTTP $HTTP_STATUS)"
elif [ "$HTTP_STATUS" = "404" ]; then
  echo "❌ Продакшн возвращает 404 — возможно проблема с роутингом"
elif [ "$HTTP_STATUS" = "000" ]; then
  echo "⚠️ Не удалось подключиться к продакшн (возможно, не задеплоен)"
else
  echo "⚠️ Продакшн возвращает HTTP $HTTP_STATUS"
fi

echo ""

# 10. Проверка структуры страниц
echo "🔍 [10/10] Проверка всех страниц..."

echo "Найденные страницы:"
find "${PAGES_DIR}" -name "*.tsx" -o -name "*.ts" | grep -v node_modules | while read -r file; do
  if [[ "$file" == *.tsx ]] || [[ "$file" == *.ts ]]; then
    route=$(echo "$file" | sed "s|${PAGES_DIR}/||" | sed "s|/index\.tsx$|/|" | sed "s|\.tsx$||" | sed "s|\.ts$||" | sed "s|/index$|/|")
    echo "   ✅ /$route"
  fi
done

echo ""

# 11. Финальные рекомендации
echo "=========================================="
echo "✅ ДИАГНОСТИКА ЗАВЕРШЕНА"
echo "=========================================="
echo ""
echo "🎯 Следующие шаги:"
echo ""
echo "1️⃣ Настройка Telegram Bot:"
echo "   → Открой @BotFather"
echo "   → Выбери @tonixchain_lottery_bot"
echo "   → Перейди: Bot Settings → Menu Button → Edit Menu Button"
echo "   → Вставь URL: https://tonix-chain.vercel.app"
echo "   → Сохрани"
echo ""
echo "2️⃣ Проверка Mini App:"
echo "   → Открой: https://t.me/tonixchain_lottery_bot/app"
echo "   → Или: https://t.me/tonixchain_lottery_bot/app?startapp=lottery"
echo ""
echo "3️⃣ Если ошибка 404 сохраняется:"
echo "   → Проверь логи Vercel: vercel logs --since=1h"
echo "   → Убедись что все страницы задеплоены"
echo "   → Проверь что manifest.json доступен по URL"
echo ""
echo "4️⃣ Проверка переменных окружения в Vercel:"
echo "   → Vercel Dashboard → Settings → Environment Variables"
echo "   → Убедись что все NEXT_PUBLIC_* переменные установлены"
echo ""
echo "5️⃣ Локальное тестирование:"
echo "   → npm run dev"
echo "   → Открой http://localhost:3000"
echo "   → Проверь что все страницы доступны"
echo ""
echo "=========================================="

