#!/bin/bash

# === TONIX CHAIN 💎 FRONTEND UPGRADE: DRAW & CLAIM ===

cd "$(dirname "$0")" || exit

echo "🎯 Добавляем функционал Draw & Claim в фронтенд..."
echo "---------------------------------------------------"

# 1️⃣ Проверяем наличие контракта
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

# 2️⃣ Проверяем что Next.js проект настроен
if [ ! -f "package.json" ] || [ ! -d "src/pages" ]; then
  echo "❌ Next.js проект не настроен! Сначала запустите ./setup-frontend-mainnet.sh"
  exit 1
fi

# 3️⃣ Обновляем index.tsx
cat > src/pages/index.tsx <<'EOFPAGE'
import { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [connector, setConnector] = useState<TonConnectUI | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  
  // Получаем адрес контракта из переменных окружения
  const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "${CONTRACT_ADDRESS}";
  
  // Opcodes из контракта
  const OP_BUY_TICKET = 3031985754;    // BuyTicket
  const OP_DRAW_WINNER = 2838117625;   // DrawWinner
  const OP_CLAIM_PRIZE = 2639554183;   // ClaimPrize
  
  // Суммы для транзакций
  const TICKET_PRICE = "1000000000";    // 1 TON в nanotons
  const GAS_AMOUNT = "10000000";        // 0.01 TON для газа (DrawWinner, ClaimPrize)

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
        setStatus('');
      }
    });
  }, []);

  const sendTx = async (opcode: number, amount: string, label: string) => {
    if (!connector || !wallet) {
      setStatus('❌ Сначала подключите кошелёк');
      return;
    }

    setLoading(label);
    setStatus(`⏳ Выполняется: ${label}...`);
    
    try {
      // Создаём payload с opcode
      const cell = beginCell()
        .storeUint(opcode, 32)
        .endCell();
      const payload = cell.toBoc().toString('base64');
      
      await connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 минут
        messages: [{
          address: contract,
          amount: amount,
          payload: payload
        }]
      });
      
      setStatus(`✅ ${label} успешно выполнено!`);
    } catch (err: any) {
      console.error('Transaction error:', err);
      if (err.message && err.message.includes('User rejected')) {
        setStatus('❌ Транзакция отменена пользователем');
      } else {
        setStatus(`❌ Ошибка при выполнении ${label}: ${err.message || String(err)}`);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleBuy = () => sendTx(OP_BUY_TICKET, TICKET_PRICE, 'Покупка билета');
  const handleDraw = () => sendTx(OP_DRAW_WINNER, GAS_AMOUNT, 'Розыгрыш');
  const handleClaim = () => sendTx(OP_CLAIM_PRIZE, GAS_AMOUNT, 'Получение приза');

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
              disabled={loading !== null}
            >
              {loading === 'Покупка билета' ? '⏳ Отправка...' : '🎟 Купить билет (1 TON)'}
            </button>
            
            <button 
              onClick={handleDraw} 
              className={styles.button}
              disabled={loading !== null}
            >
              {loading === 'Розыгрыш' ? '⏳ Отправка...' : '🎰 Провести розыгрыш (только owner)'}
            </button>
            
            <button 
              onClick={handleClaim} 
              className={styles.button}
              disabled={loading !== null}
            >
              {loading === 'Получение приза' ? '⏳ Отправка...' : '💰 Получить приз (только winner)'}
            </button>
            
            {status && (
              <p className={styles.status}>{status}</p>
            )}
            
            <button 
              onClick={() => connector?.disconnect()} 
              className={styles.buttonSecondary}
            >
              Отключить кошелёк
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => connector?.connectWallet()} 
              className={styles.button}
            >
              🔗 Подключить кошелёк
            </button>
            {status && (
              <p className={styles.status}>{status}</p>
            )}
          </>
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

echo "✅ Обновлён src/pages/index.tsx"

# 4️⃣ Обновляем стили
cat > src/styles/Home.module.css <<'EOF'
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at top, #00ffff33, #000011);
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 20px;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ffff, #0077ff);
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
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 30px 40px;
  backdrop-filter: blur(10px);
  text-align: center;
  min-width: 300px;
  max-width: 500px;
  width: 90%;
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
  background: linear-gradient(90deg, #00ffff, #0055ff);
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

.status {
  margin-top: 20px;
  font-size: 1rem;
  opacity: 0.9;
  min-height: 24px;
  word-break: break-word;
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

echo "✅ Обновлён src/styles/Home.module.css"

# 5️⃣ Пересобираем проект (опционально)
echo ""
read -p "Пересобрать проект сейчас? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Запуск сборки..."
  npm run build || {
    echo "⚠️  Ошибка сборки, но файлы обновлены. Можно запустить npm run dev для разработки."
    exit 0
  }
  echo "✅ Сборка завершена!"
else
  echo "ℹ️  Пропущена сборка. Запустите 'npm run build' или 'npm run dev' вручную."
fi

echo "---------------------------------------------------"
echo "✅ TONIX CHAIN FRONTEND обновлён (MAINNET)"
echo "🎟 Добавлены функции Buy, Draw, Claim"
echo "🌐 Контракт: ${CONTRACT_ADDRESS}"
echo ""
echo "🚀 Запуск:"
echo "   npm run dev   →  http://localhost:3000"
echo "   npm run build →  Сборка для продакшена"
echo ""
echo "💎 Все действия проходят в боевой сети TON!"
echo "⚠️  DrawWinner доступен только для owner"
echo "⚠️  ClaimPrize доступен только для winner"
echo "---------------------------------------------------"

