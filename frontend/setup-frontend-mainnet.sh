#!/bin/bash

# === TONIX CHAIN 💎 MAINNET MINI APP UI SETUP ===

cd "$(dirname "$0")" || exit

echo "💎 Настройка боевого фронтенда TONIX CHAIN (MAINNET)..."
echo "-------------------------------------------------------"

# 1️⃣ Проверяем структуру
if [ ! -f "../contracts/.env" ]; then
  echo "❌ Не найден .env в contracts! Сначала деплой контракт через ./deploy-mainnet.sh"
  exit 1
fi

# 2️⃣ Копируем PROD_CONTRACT из .env контракта
DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"

if [ -f "../contracts/.env" ]; then
  CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" ../contracts/.env | cut -d'=' -f2)
fi

# Используем дефолтный адрес, если PROD_CONTRACT пустой или не найден
if [ -z "$CONTRACT_ADDRESS" ]; then
  CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
  echo "⚠️  PROD_CONTRACT не найден в .env, используется дефолтный контракт"
else
  echo "✅ Найден контракт из .env"
fi

echo "📍 Адрес контракта: $CONTRACT_ADDRESS"

# 3️⃣ Инициализация Next.js проекта если его нет
if [ ! -f "package.json" ]; then
  echo "📦 Инициализация Next.js проекта..."
  # Пытаемся использовать create-next-app только если папка действительно пуста
  if [ -z "$(ls -A . 2>/dev/null)" ]; then
    # Используем pages router вместо app router
    npx create-next-app@latest . --typescript --tailwind --no-app --src-dir --import-alias "@/*" --yes 2>/dev/null || {
      echo "⚠️  create-next-app не сработал, используем ручную инициализацию..."
      npm init -y
      npm install next@latest react@latest react-dom@latest typescript@latest @types/react@latest @types/node@latest
      mkdir -p src/pages src/styles public
    }
  else
    echo "⚠️  Папка не пуста, используем ручную инициализацию..."
    npm init -y
    npm install next@latest react@latest react-dom@latest typescript@latest @types/react@latest @types/node@latest
    mkdir -p src/pages src/styles public
  fi
else
  echo "✅ Next.js проект уже инициализирован"
fi

# 4️⃣ Установка зависимостей фронтенда
echo "📦 Установка зависимостей..."
if [ ! -f "package.json" ] || ! grep -q "\"next\"" package.json; then
  npm install next@latest react@latest react-dom@latest typescript@latest @types/react@latest @types/node@latest
fi

npm install @tonconnect/ui@latest @tonconnect/sdk@latest @ton/core@latest dotenv@latest --legacy-peer-deps || {
  npm install @tonconnect/ui@latest @tonconnect/sdk@latest @ton/core@latest dotenv@latest
}

# 5️⃣ Создаём структуру директорий
mkdir -p public src/pages src/styles

# 6️⃣ Создаём файл tonconnect-manifest.json
cat > public/tonconnect-manifest.json <<EOF
{
  "url": "https://tonix-chain.vercel.app",
  "name": "TONIX CHAIN",
  "iconUrl": "https://tonix-chain.vercel.app/icon.png",
  "termsOfUseUrl": "https://tonix-chain.vercel.app/terms",
  "privacyPolicyUrl": "https://tonix-chain.vercel.app/privacy"
}
EOF
echo "✅ Создан tonconnect-manifest.json"

# 7️⃣ Обновляем index.tsx (используем pages router)
cat > src/pages/index.tsx <<'EOFPAGE'
import { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
import styles from '../styles/Home.module.css';

// BuyTicket opcode: 0xb4b86e5a = 3031985754
function createBuyTicketPayload(): string {
  // Для TonConnect нужно сериализовать сообщение BuyTicket
  // Используем beginCell().storeUint(3031985754, 32).endCell()
  // Конвертируем в base64boc для TonConnect
  const cell = beginCell()
    .storeUint(3031985754, 32) // BuyTicket opcode
    .endCell();
  return cell.toBoc().toString('base64');
}

export default function Home() {
  const [connector, setConnector] = useState<TonConnectUI | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Получаем адрес контракта из переменных окружения или используем дефолтный
  const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "${CONTRACT_ADDRESS}";
  const ticketPrice = "1000000000"; // 1 TON в nanotons

  useEffect(() => {
    const tonConnectUI = new TonConnectUI({
      manifestUrl: typeof window !== 'undefined' ? `${window.location.origin}/tonconnect-manifest.json` : '/tonconnect-manifest.json'
    });
    setConnector(tonConnectUI);
    
    // Проверяем существующее подключение
    tonConnectUI.connectionRestored.then(() => {
      if (tonConnectUI.wallet) {
        setWallet(tonConnectUI.wallet.account.address);
      }
    });
    
    tonConnectUI.onStatusChange((walletInfo) => {
      if (walletInfo) {
        setWallet(walletInfo.account.address);
      } else {
        setWallet(null);
      }
    });
  }, []);

  const handleBuy = async () => {
    if (!connector || !wallet) {
      alert('Сначала подключите кошелёк');
      return;
    }

    setLoading(true);
    try {
      const payload = createBuyTicketPayload();
      
      await connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 минут
        messages: [{
          address: contract,
          amount: ticketPrice,
          payload: payload
        }]
      });
      
      alert('✅ Транзакция отправлена! Проверьте статус в кошельке.');
    } catch (err: any) {
      console.error('Transaction error:', err);
      if (err.message && err.message.includes('User rejected')) {
        alert('Транзакция отменена пользователем');
      } else {
        alert('Ошибка транзакции: ' + (err.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (connector) {
      await connector.disconnect();
      setWallet(null);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>TONIX CHAIN 💎</h1>
      <p className={styles.subtitle}>Лотерея будущего на TON (Mainnet)</p>
      
      <div className={styles.card}>
        {wallet ? (
          <>
            <p className={styles.walletInfo}>✅ Подключён:</p>
            <p className={styles.address}>{wallet.slice(0, 6)}...{wallet.slice(-6)}</p>
            <button 
              onClick={handleBuy} 
              className={styles.button}
              disabled={loading}
            >
              {loading ? '⏳ Отправка...' : '🎟 Купить билет (1 TON)'}
            </button>
            <button 
              onClick={handleDisconnect} 
              className={styles.buttonSecondary}
            >
              Отключить кошелёк
            </button>
          </>
        ) : (
          <button 
            onClick={() => connector?.connectWallet()} 
            className={styles.button}
          >
            🔗 Подключить кошелёк
          </button>
        )}
      </div>
      
      <div className={styles.info}>
        <p>📍 Контракт: {contract.slice(0, 8)}...{contract.slice(-8)}</p>
        <a 
          href={`https://tonviewer.com/${contract}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.link}
        >
          🔍 Посмотреть на TonViewer
        </a>
      </div>
    </main>
  );
}
EOFPAGE

# Заменяем переменную CONTRACT_ADDRESS в файле
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|\${CONTRACT_ADDRESS}|${CONTRACT_ADDRESS}|g" src/pages/index.tsx
else
  sed -i "s|\${CONTRACT_ADDRESS}|${CONTRACT_ADDRESS}|g" src/pages/index.tsx
fi

echo "✅ Создан src/pages/index.tsx"

# Создаём _app.tsx для pages router
cat > src/pages/_app.tsx <<'EOF'
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
EOF

echo "✅ Создан src/pages/_app.tsx"

# 8️⃣ Добавляем базовые стили
cat > src/styles/Home.module.css <<'EOF'
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at top, #00ffff, #000055);
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 20px;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ffff, #0088ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  text-align: center;
}

.subtitle {
  opacity: 0.9;
  margin-bottom: 30px;
  font-size: 1.1rem;
  text-align: center;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px 40px;
  backdrop-filter: blur(10px);
  text-align: center;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.walletInfo {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.address {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  word-break: break-all;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.button {
  margin-top: 15px;
  background: linear-gradient(90deg, #00ffff, #0088ff);
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.5);
  opacity: 0.95;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buttonSecondary {
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.buttonSecondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.info {
  margin-top: 30px;
  text-align: center;
  opacity: 0.8;
  font-size: 0.9rem;
}

.link {
  display: inline-block;
  margin-top: 10px;
  color: #00ffff;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.link:hover {
  opacity: 0.7;
  text-decoration: underline;
}
EOF

echo "✅ Создан src/styles/Home.module.css"

# Создаём globals.css
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

# 9️⃣ Создаём/обновляем next.config.js
cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.PROD_CONTRACT
  }
};

module.exports = nextConfig;
EOF

echo "✅ Создан next.config.js"

# 🔟 Создаём tsconfig.json если его нет
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
    "plugins": [
      {
        "name": "next"
      }
    ],
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

# 1️⃣1️⃣ Создаём .env.local для фронтенда
cat > .env.local <<EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
EOF
echo "✅ Создан .env.local с адресом контракта"

# 1️⃣2️⃣ Обновляем package.json scripts если нужно
if [ -f "package.json" ]; then
  # Проверяем есть ли уже скрипты
  if ! grep -q "\"dev\"" package.json; then
    # Добавляем скрипты если их нет
    npm pkg set scripts.dev="next dev"
    npm pkg set scripts.build="next build"
    npm pkg set scripts.start="next start"
    npm pkg set scripts.lint="next lint"
    echo "✅ Обновлены скрипты в package.json"
  fi
fi

# Создаём next-env.d.ts если его нет
if [ ! -f "next-env.d.ts" ]; then
  cat > next-env.d.ts <<'EOF'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
EOF
  echo "✅ Создан next-env.d.ts"
fi

echo "-------------------------------------------------------"
echo "✅ TONIX CHAIN FRONTEND НАСТРОЕН (MAINNET)"
echo "🌐 Контракт: ${CONTRACT_ADDRESS}"
echo "🔗 Проверка: https://tonviewer.com/${CONTRACT_ADDRESS}"
echo ""
echo "🚀 Запуск:"
echo "   npm run dev     # Режим разработки (http://localhost:3000)"
echo "   npm run build   # Сборка для продакшена"
echo "   npm run start   # Запуск продакшен версии"
echo "-------------------------------------------------------"

# 1️⃣3️⃣ Сборка и запуск фронтенда (опционально)
read -p "Хотите запустить dev сервер сейчас? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Запуск TONIX CHAIN frontend (Mainnet)..."
  npm run dev
fi

