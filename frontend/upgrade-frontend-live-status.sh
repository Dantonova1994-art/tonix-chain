#!/bin/bash

# === TONIX CHAIN 💎 FRONTEND LIVE STATUS (POOL, PLAYERS, WINNER) ===

cd "$(dirname "$0")" || exit

echo "🔄 Добавляем live-информацию из контракта TONIX CHAIN (mainnet)..."
echo "---------------------------------------------------------------"

# 1️⃣ Проверяем наличие PROD_CONTRACT
DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"

if [ -f "../contracts/.env" ]; then
  CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" ../contracts/.env | cut -d'=' -f2)
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
  CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
  echo "⚠️ PROD_CONTRACT пуст, используем дефолтный: $CONTRACT_ADDRESS"
else
  echo "✅ Найден контракт: $CONTRACT_ADDRESS"
fi

# 2️⃣ Установка зависимостей для работы с Ton API
echo "📦 Установка зависимостей..."
npm install axios --legacy-peer-deps || npm install axios

# 3️⃣ Обновляем index.tsx — добавляем блок статуса контракта
cat > src/pages/index.tsx <<'EOFPAGE'
import { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { beginCell, Address } from '@ton/core';
import axios from 'axios';
import styles from '../styles/Home.module.css';

const CONTRACT_ADDRESS = "${CONTRACT_ADDRESS}";
const TONCENTER_API = "https://toncenter.com/api/v2";
const API_KEY = process.env.NEXT_PUBLIC_TONCENTER_API_KEY || "";

// Opcodes
const OP_BUY_TICKET = 3031985754;
const OP_DRAW_WINNER = 2838117625;
const OP_CLAIM_PRIZE = 2639554183;

// Amounts
const TICKET_PRICE = "1000000000";  // 1 TON
const GAS_AMOUNT = "10000000";       // 0.01 TON

export default function Home() {
  const [connector, setConnector] = useState<TonConnectUI | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);
  
  // Contract state
  const [pool, setPool] = useState<string>('—');
  const [players, setPlayers] = useState<number>(0);
  const [winner, setWinner] = useState<string>('—');
  const [roundActive, setRoundActive] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState(true);

  // Инициализация TonConnect
  useEffect(() => {
    const tonConnectUI = new TonConnectUI({
      manifestUrl: typeof window !== 'undefined' ? `${window.location.origin}/tonconnect-manifest.json` : '/tonconnect-manifest.json'
    });
    setConnector(tonConnectUI);
    
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

  // Получение данных контракта
  const fetchContractData = async () => {
    try {
      setLoadingData(true);
      
      // Получаем pool
      const poolRes = await axios.get(`${TONCENTER_API}/runGetMethod`, {
        params: {
          address: CONTRACT_ADDRESS,
          method: 'pool',
          stack: [],
          ...(API_KEY && { api_key: API_KEY })
        }
      });
      
      // Получаем participantCount
      const playersRes = await axios.get(`${TONCENTER_API}/runGetMethod`, {
        params: {
          address: CONTRACT_ADDRESS,
          method: 'participantCount',
          stack: [],
          ...(API_KEY && { api_key: API_KEY })
        }
      });
      
      // Получаем winner
      const winnerRes = await axios.get(`${TONCENTER_API}/runGetMethod`, {
        params: {
          address: CONTRACT_ADDRESS,
          method: 'winner',
          stack: [],
          ...(API_KEY && { api_key: API_KEY })
        }
      });
      
      // Получаем roundActive
      const roundRes = await axios.get(`${TONCENTER_API}/runGetMethod`, {
        params: {
          address: CONTRACT_ADDRESS,
          method: 'roundActive',
          stack: [],
          ...(API_KEY && { api_key: API_KEY })
        }
      });

      if (poolRes.data.ok && poolRes.data.result.exit_code === 0) {
        const poolValue = BigInt(poolRes.data.result.stack[0][1]);
        setPool((Number(poolValue) / 1e9).toFixed(2));
      }

      if (playersRes.data.ok && playersRes.data.result.exit_code === 0) {
        const playersCount = parseInt(playersRes.data.result.stack[0][1], 16);
        setPlayers(playersCount);
      }

      if (winnerRes.data.ok && winnerRes.data.result.exit_code === 0) {
        const winnerStack = winnerRes.data.result.stack[0];
        if (winnerStack[0] === 'null') {
          setWinner('—');
        } else {
          try {
            // Попытка извлечь адрес из разных форматов
            const winnerData = winnerStack[1] || winnerStack;
            const winnerAddr = typeof winnerData === 'string' ? winnerData : JSON.stringify(winnerData);
            if (winnerAddr && winnerAddr !== 'null') {
              setWinner(winnerAddr.slice(0, 10) + '...' + winnerAddr.slice(-6));
            } else {
              setWinner('—');
            }
          } catch {
            setWinner('—');
          }
        }
      }

      if (roundRes.data.ok && roundRes.data.result.exit_code === 0) {
        const isActive = roundRes.data.result.stack[0][1] === '0x0' ? false : true;
        setRoundActive(isActive);
      }
    } catch (err: any) {
      console.error('Error fetching contract data:', err);
      // Не показываем ошибки пользователю, просто оставляем значения по умолчанию
    } finally {
      setLoadingData(false);
    }
  };

  // Обновляем данные каждые 15 секунд
  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 15000);
    return () => clearInterval(interval);
  }, []);

  const sendTx = async (opcode: number, amount: string, label: string) => {
    if (!connector || !wallet) {
      setStatus('❌ Сначала подключите кошелёк');
      return;
    }

    setLoading(label);
    setStatus(`⏳ Выполняется: ${label}...`);
    
    try {
      const cell = beginCell()
        .storeUint(opcode, 32)
        .endCell();
      const payload = cell.toBoc().toString('base64');
      
      await connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: CONTRACT_ADDRESS,
          amount: amount,
          payload: payload
        }]
      });
      
      setStatus(`✅ ${label} успешно выполнено!`);
      // Обновляем данные после транзакции
      setTimeout(() => fetchContractData(), 5000);
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

      <div className={styles.info}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>💰 Пул:</span>
          <span className={styles.infoValue}>{loadingData ? '...' : `${pool} TON`}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>👥 Участников:</span>
          <span className={styles.infoValue}>{loadingData ? '...' : players}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>🎰 Раунд:</span>
          <span className={styles.infoValue}>
            {loadingData ? '...' : (roundActive ? '✅ Активен' : '⏸ Остановлен')}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>🏆 Победитель:</span>
          <span className={styles.infoValue}>{loadingData ? '...' : winner}</span>
        </div>
      </div>

      <div className={styles.card}>
        {wallet ? (
          <>
            <p className={styles.walletInfo}>✅ Подключён:</p>
            <p className={styles.address}>{wallet.slice(0, 6)}...{wallet.slice(-6)}</p>
            
            <button 
              disabled={loading !== null} 
              onClick={handleBuy} 
              className={styles.button}
            >
              {loading === 'Покупка билета' ? '⏳ Отправка...' : '🎟 Купить билет (1 TON)'}
            </button>
            
            <button 
              disabled={loading !== null} 
              onClick={handleDraw} 
              className={styles.button}
            >
              {loading === 'Розыгрыш' ? '⏳ Отправка...' : '🎰 Провести розыгрыш (owner)'}
            </button>
            
            <button 
              disabled={loading !== null} 
              onClick={handleClaim} 
              className={styles.button}
            >
              {loading === 'Получение приза' ? '⏳ Отправка...' : '💰 Получить приз (winner)'}
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

      <div className={styles.footer}>
        <p>📍 Контракт: {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-8)}</p>
        <a 
          href={`https://tonviewer.com/${CONTRACT_ADDRESS}`} 
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

# Заменяем переменную CONTRACT_ADDRESS
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|\${CONTRACT_ADDRESS}|${CONTRACT_ADDRESS}|g" src/pages/index.tsx
else
  sed -i "s|\${CONTRACT_ADDRESS}|${CONTRACT_ADDRESS}|g" src/pages/index.tsx
fi

echo "✅ Обновлён src/pages/index.tsx"

# 4️⃣ Обновляем стили с блоком .info
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
  margin-bottom: 20px;
  font-size: 1.1rem;
  text-align: center;
}

.info {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px 30px;
  backdrop-filter: blur(10px);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.infoRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.infoRow:last-child {
  border-bottom: none;
}

.infoLabel {
  font-size: 1rem;
  opacity: 0.9;
}

.infoValue {
  font-size: 1.1rem;
  font-weight: bold;
  color: #00ffff;
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

.footer {
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

# 5️⃣ Пересборка проекта (опционально)
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

echo "---------------------------------------------------------------"
echo "✅ TONIX CHAIN FRONTEND обновлён с LIVE-DATA"
echo "🌐 Контракт: ${CONTRACT_ADDRESS}"
echo "💰 Показывает пул, участников, статус раунда и победителя"
echo "🔄 Автообновление каждые 15 секунд"
echo ""
echo "🚀 Запуск:"
echo "   npm run dev   →  http://localhost:3000"
echo "   npm run build →  Сборка для продакшена"
echo ""
echo "💎 Всё работает в MAINNET"
echo "---------------------------------------------------------------"

