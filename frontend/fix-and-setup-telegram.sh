#!/bin/bash

# === TONIX CHAIN 💎 FULL FIX + TELEGRAM MINI APP SETUP ===

cd "$(dirname "$0")" || exit

echo "🧩 Проверка и восстановление фронтенда TONIX CHAIN..."
echo "-------------------------------------------------------"

# 1️⃣ Проверяем зависимости
if [ ! -f "package.json" ]; then
  echo "❌ package.json не найден, создаю новый проект..."
  echo "📦 Инициализация Next.js проекта..."
  
  npm init -y
  
  # Устанавливаем основные зависимости
  npm install next@latest react@latest react-dom@latest typescript@latest @types/react@latest @types/node@latest --legacy-peer-deps
  
  # Обновляем package.json скрипты
  npm pkg set scripts.dev="next dev"
  npm pkg set scripts.build="next build"
  npm pkg set scripts.start="next start"
  npm pkg set scripts.lint="next lint"
  
  # Создаём базовую структуру
  mkdir -p src/pages src/pages/api/twa src/styles public
  echo "✅ Проект создан"
else
  echo "✅ package.json найден"
fi

# 2️⃣ Устанавливаем/переустанавливаем нужные зависимости
echo "📦 Установка зависимостей..."
npm install next react react-dom typescript @types/react @types/node @tonconnect/ui@latest @tonconnect/sdk@latest @ton/core@latest axios@latest dotenv@latest --legacy-peer-deps || {
  echo "⚠️  Некоторые зависимости могут быть уже установлены"
}

# 3️⃣ Проверяем конфигурацию .env.local
if [ ! -f ".env.local" ]; then
  echo "📝 Создаю .env.local..."
  touch .env.local
fi

if ! grep -q "NEXT_PUBLIC_BOT_USERNAME" .env.local 2>/dev/null; then
  echo "NEXT_PUBLIC_BOT_USERNAME=tonixchain_lottery_bot" >> .env.local
  echo "✅ Добавлен NEXT_PUBLIC_BOT_USERNAME в .env.local"
fi

# Добавляем контракт если его нет
DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"
if [ -f "../contracts/.env" ]; then
  CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" ../contracts/.env | cut -d'=' -f2)
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
  CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
fi

if ! grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env.local 2>/dev/null; then
  echo "NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}" >> .env.local
  echo "✅ Добавлен NEXT_PUBLIC_CONTRACT_ADDRESS в .env.local"
fi

# Добавляем TELEGRAM_BOT_TOKEN если его нет (для будущего использования)
if ! grep -q "TELEGRAM_BOT_TOKEN" .env.local 2>/dev/null; then
  echo "# TELEGRAM_BOT_TOKEN=your_bot_token_here" >> .env.local
  echo "ℹ️  Добавлен placeholder для TELEGRAM_BOT_TOKEN"
fi

# 4️⃣ Проверяем pages/api
mkdir -p src/pages/api/twa

# Создаём verify API для Telegram WebApp
cat > src/pages/api/twa/verify.ts <<'EOF'
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { initData } = req.query;
  
  if (!initData) {
    return res.status(400).json({ ok: false, error: 'initData required' });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    
    if (!botToken) {
      // В режиме разработки пропускаем проверку
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({ ok: true, dev: true });
      }
      return res.status(500).json({ ok: false, error: 'Bot token not configured' });
    }

    const parsed = Object.fromEntries(new URLSearchParams(initData as string));
    const checkHash = parsed.hash;
    
    if (!checkHash) {
      return res.status(400).json({ ok: false, error: 'Hash not found in initData' });
    }
    
    delete parsed.hash;
    
    const dataCheckString = Object.keys(parsed)
      .sort()
      .map((k) => `${k}=${parsed[k]}`)
      .join('\n');
    
    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
    
    if (hash !== checkHash) {
      return res.status(403).json({ ok: false, error: 'Invalid initData hash' });
    }
    
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Verify error:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Internal error' });
  }
}
EOF

echo "✅ Создан API endpoint /api/twa/verify"

# 5️⃣ Проверяем и создаём tonconnect-manifest.json
mkdir -p public

cat > public/tonconnect-manifest.json <<'EOF'
{
  "url": "https://tonixchain.vercel.app",
  "name": "TONIX CHAIN",
  "iconUrl": "https://ton.org/favicon.ico",
  "termsOfUseUrl": "https://tonixchain.vercel.app/terms",
  "privacyPolicyUrl": "https://tonixchain.vercel.app/privacy"
}
EOF

echo "✅ Обновлён tonconnect-manifest.json"

# 6️⃣ Проверяем и создаём базовые файлы проекта
mkdir -p src/pages src/styles public

# Создаём _app.tsx если его нет
if [ ! -f "src/pages/_app.tsx" ]; then
  cat > src/pages/_app.tsx <<'EOF'
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
EOF
  echo "✅ Создан src/pages/_app.tsx"
fi

# Создаём globals.css если его нет
if [ ! -f "src/styles/globals.css" ]; then
  cat > src/styles/globals.css <<'EOF'
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: white;
  background: #000;
}
EOF
  echo "✅ Создан src/styles/globals.css"
fi

# Создаём next.config.js если его нет
if [ ! -f "next.config.js" ]; then
  cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

module.exports = nextConfig;
EOF
  echo "✅ Создан next.config.js"
fi

# Создаём tsconfig.json если его нет
if [ ! -f "tsconfig.json" ]; then
  cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
  echo "✅ Создан tsconfig.json"
fi

# Создаём базовый index.tsx только если его нет
if [ ! -f "src/pages/index.tsx" ]; then
  echo "⚠️  index.tsx не найден, создаю базовый файл..."
  cat > src/pages/index.tsx <<'EOFPAGE'
import { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
import axios from 'axios';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT';

export default function Home() {
  const [connector, setConnector] = useState<TonConnectUI | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [pool, setPool] = useState<string>('—');
  const [players, setPlayers] = useState<number>(0);
  const [winner, setWinner] = useState<string>('—');

  useEffect(() => {
    const tonConnectUI = new TonConnectUI({ 
      manifestUrl: typeof window !== 'undefined' ? `${window.location.origin}/tonconnect-manifest.json` : '/tonconnect-manifest.json'
    });
    setConnector(tonConnectUI);
    tonConnectUI.onStatusChange((walletInfo) => {
      setWallet(walletInfo?.account.address || null);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://toncenter.com/api/v2/getAddressBalance', {
          params: { address: CONTRACT_ADDRESS }
        });
        if (res.data.ok) {
          setPool((parseInt(res.data.result) / 1e9).toFixed(2));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, []);

  const sendTx = async (opcode: number, label: string, amount: string) => {
    if (!connector) return alert('Кошелёк не подключен');
    try {
      const payload = beginCell().storeUint(opcode, 32).endCell().toBoc().toString('base64');
      await connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: CONTRACT_ADDRESS, amount, payload }]
      });
      setStatus('✅ ' + label + ' выполнено');
    } catch (err) {
      console.error(err);
      setStatus('❌ Ошибка при ' + label);
    }
  };

  return (
    <main style={{ textAlign: 'center', padding: '40px', color: 'white', background: '#000010', minHeight: '100vh' }}>
      <h1>TONIX CHAIN 💎</h1>
      <p>Лотерея будущего на TON</p>
      {wallet ? (
        <>
          <p>👛 {wallet}</p>
          <button onClick={() => sendTx(3031985754, 'Покупка билета', '1000000000')}>🎟 Купить билет (1 TON)</button>
          <button onClick={() => sendTx(2838117625, 'Розыгрыш', '10000000')}>🎰 Розыгрыш</button>
          <button onClick={() => sendTx(2639554183, 'Получить приз', '10000000')}>💰 Получить приз</button>
          <p>💰 Пул: {pool} TON</p>
          <p>👥 Участников: {players}</p>
          <p>🏆 Победитель: {winner}</p>
          <p>{status}</p>
        </>
      ) : (
        <button onClick={() => connector?.connectWallet()}>🔗 Подключить кошелёк</button>
      )}
    </main>
  );
}
EOFPAGE
  echo "✅ Создан базовый src/pages/index.tsx"
else
  echo "✅ src/pages/index.tsx уже существует"
fi

# 7️⃣ Убиваем процесс на порту 3000 если он занят
echo "🔍 Проверка порта 3000..."
if command -v lsof > /dev/null 2>&1; then
  LSOF_PID=$(lsof -ti:3000 2>/dev/null)
  if [ ! -z "$LSOF_PID" ]; then
    echo "⚠️  Найден процесс на порту 3000 (PID: $LSOF_PID), завершаю..."
    kill $LSOF_PID 2>/dev/null || true
    sleep 1
  fi
elif command -v kill-port > /dev/null 2>&1; then
  npx kill-port 3000 2>/dev/null || true
else
  echo "ℹ️  kill-port не найден, пропускаю проверку порта"
fi

echo "-------------------------------------------------------"
echo "✅ TONIX CHAIN фронтенд восстановлен и готов"
echo "🌐 http://localhost:3000"
echo "🤖 Telegram Mini App username: tonixchain_lottery_bot"
echo "📎 Mini App link: https://t.me/tonixchain_lottery_bot/app?startapp=lottery"
echo "📡 API route: /api/twa/verify"
echo ""
echo "🚀 Запуск:"
echo "   npm run dev   →  Запустить dev сервер"
echo ""
echo "💡 Настройка Telegram Bot:"
echo "   1. Добавьте TELEGRAM_BOT_TOKEN в .env.local"
echo "   2. Настройте бота через @BotFather"
echo "   3. Установите Web App через /setmenubutton или /newapp"
echo "-------------------------------------------------------"

# Опционально запускаем dev сервер
read -p "Запустить dev сервер сейчас? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Запуск dev сервера на http://localhost:3000..."
  npm run dev
fi

