#!/bin/bash

# === TONIX CHAIN 💎 ADMIN PANEL CREATION ===

cd "$(dirname "$0")" || exit

echo "👑 Создаю админ-панель для TONIX CHAIN..."
echo "-----------------------------------------------------------"

# 1️⃣ Проверяем наличие .env.local и добавляем OWNER_ADDRESS
if [ ! -f ".env.local" ]; then
  echo "⚙️ Создаю .env.local..."
  touch .env.local
fi

# Получаем адрес контракта
DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"
if [ -f "../contracts/.env" ]; then
  CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" ../contracts/.env | cut -d'=' -f2)
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
  CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
fi

# Проверяем наличие переменных и добавляем если их нет
if ! grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env.local 2>/dev/null; then
  echo "NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}" >> .env.local
  echo "✅ Добавлен NEXT_PUBLIC_CONTRACT_ADDRESS"
fi

if ! grep -q "NEXT_PUBLIC_OWNER_ADDRESS" .env.local 2>/dev/null; then
  # Пытаемся получить owner из контракта или используем placeholder
  echo "NEXT_PUBLIC_OWNER_ADDRESS=EQDcO4--VLDOUxQnbB7l8ya3GbzEVpU6j7yh0rPegYE4ZFa_" >> .env.local
  echo "⚠️  Добавлен NEXT_PUBLIC_OWNER_ADDRESS (обновите на реальный адрес owner!)"
fi

if ! grep -q "NEXT_PUBLIC_BOT_USERNAME" .env.local 2>/dev/null; then
  echo "NEXT_PUBLIC_BOT_USERNAME=tonixchain_lottery_bot" >> .env.local
fi

# 2️⃣ Устанавливаем @tonconnect/ui-react если его нет
echo "📦 Проверка зависимостей..."
if ! npm list @tonconnect/ui-react > /dev/null 2>&1; then
  echo "⚙️ Устанавливаю @tonconnect/ui-react..."
  npm install @tonconnect/ui-react@latest --legacy-peer-deps
fi

# 3️⃣ Создаём admin страницу
mkdir -p src/pages

cat > src/pages/admin.tsx <<'EOFPAGE'
import React, { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
import axios from 'axios';
import Head from 'next/head';
import styles from '../styles/Admin.module.css';

// Opcodes from contract
const OP_DRAW_WINNER = 2838117625;   // 0xa92a3cf9
const OP_CLAIM_PRIZE = 2639554183;    // 0x9d546687
const OP_RESET_ROUND = 753035870;     // 0x2ce26a5e

// Amounts
const GAS_AMOUNT = "10000000";        // 0.01 TON

export default function AdminPage() {
  const [connector, setConnector] = useState<TonConnectUI | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Подключите кошелёк');
  const [loading, setLoading] = useState<string | null>(null);
  
  // Contract state
  const [pool, setPool] = useState<string>('0.000');
  const [players, setPlayers] = useState<number>(0);
  const [winner, setWinner] = useState<string>('—');
  const [roundActive, setRoundActive] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState(true);

  const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const TONCENTER_API = "https://toncenter.com/api/v2";
  const API_KEY = process.env.NEXT_PUBLIC_TONCENTER_API_KEY || "";

  // Инициализация
  useEffect(() => {
    const ownerAddr = process.env.NEXT_PUBLIC_OWNER_ADDRESS || null;
    setOwner(ownerAddr);
    
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
        setIsOwner(false);
        setStatus('Подключите кошелёк');
      }
    });
  }, []);

  // Проверка прав доступа
  useEffect(() => {
    if (wallet && owner) {
      const hasAccess = wallet.toLowerCase() === owner.toLowerCase();
      setIsOwner(hasAccess);
      setStatus(hasAccess ? '✅ Доступ разрешён (Owner)' : '❌ Доступ запрещён (только для owner)');
    } else if (wallet && !owner) {
      setStatus('⚠️ NEXT_PUBLIC_OWNER_ADDRESS не настроен');
    }
  }, [wallet, owner]);

  // Получение данных контракта
  const fetchContractData = async () => {
    if (!contract) return;
    
    try {
      setLoadingData(true);
      
      const [poolRes, playersRes, winnerRes, roundRes, ownerRes] = await Promise.all([
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: contract,
            method: 'pool',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        }),
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: contract,
            method: 'participantCount',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        }),
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: contract,
            method: 'winner',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        }),
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: contract,
            method: 'roundActive',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        }),
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: contract,
            method: 'owner',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        })
      ]);

      if (poolRes.data.ok && poolRes.data.result.exit_code === 0) {
        const poolValue = BigInt(poolRes.data.result.stack[0][1]);
        setPool((Number(poolValue) / 1e9).toFixed(3));
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
            const winnerData = winnerStack[1] || winnerStack;
            const winnerAddr = typeof winnerData === 'string' ? winnerData : JSON.stringify(winnerData);
            if (winnerAddr && winnerAddr !== 'null') {
              setWinner(winnerAddr.slice(0, 8) + '...' + winnerAddr.slice(-6));
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

      if (ownerRes.data.ok && ownerRes.data.result.exit_code === 0) {
        const ownerStack = ownerRes.data.result.stack[0];
        const ownerAddr = ownerStack[1] || ownerStack;
        if (ownerAddr && typeof ownerAddr === 'string') {
          setOwner(ownerAddr);
          // Обновляем проверку доступа
          if (wallet) {
            const hasAccess = wallet.toLowerCase() === ownerAddr.toLowerCase();
            setIsOwner(hasAccess);
            setStatus(hasAccess ? '✅ Доступ разрешён (Owner)' : '❌ Доступ запрещён');
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching contract data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchContractData();
      const interval = setInterval(fetchContractData, 15000);
      return () => clearInterval(interval);
    }
  }, [contract]);

  const sendTx = async (opcode: number, amount: string, label: string) => {
    if (!connector || !wallet) {
      setStatus('❌ Сначала подключите кошелёк');
      return;
    }

    if (!isOwner) {
      setStatus('❌ Доступ запрещён (только для owner)');
      alert('Только owner контракта может выполнять эту операцию');
      return;
    }

    setLoading(label);
    setStatus(`⏳ Отправка транзакции: ${label}...`);
    
    try {
      const cell = beginCell()
        .storeUint(opcode, 32)
        .endCell();
      const payload = cell.toBoc().toString('base64');
      
      await connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: contract,
          amount: amount,
          payload: payload
        }]
      });
      
      setStatus(`✅ ${label} успешно отправлено!`);
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

  const handleDraw = () => sendTx(OP_DRAW_WINNER, GAS_AMOUNT, 'Розыгрыш');
  const handleClaim = () => sendTx(OP_CLAIM_PRIZE, GAS_AMOUNT, 'Получение приза');
  const handleReset = () => {
    if (confirm('Вы уверены, что хотите сбросить раунд? Это остановит текущий раунд и очистит участников.')) {
      sendTx(OP_RESET_ROUND, GAS_AMOUNT, 'Сброс раунда');
    }
  };

  return (
    <>
      <Head>
        <title>Admin Panel — TONIX CHAIN</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>👑 TONIX CHAIN — Admin Panel</h1>
        
        <div className={styles.connectSection}>
          {wallet ? (
            <div className={styles.walletInfo}>
              <p className={styles.walletAddress}>👛 {wallet.slice(0, 6)}...{wallet.slice(-6)}</p>
              <button 
                onClick={() => connector?.disconnect()} 
                className={styles.disconnectButton}
              >
                Отключить
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connector?.connectWallet()} 
              className={styles.connectButton}
            >
              🔗 Подключить кошелёк
            </button>
          )}
        </div>

        <div className={styles.status}>
          <p className={isOwner ? styles.statusGranted : styles.statusDenied}>{status}</p>
          {owner && (
            <p className={styles.ownerInfo}>Owner: {owner.slice(0, 8)}...{owner.slice(-6)}</p>
          )}
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>💰 Пул</span>
            <span className={styles.statValue}>{loadingData ? '...' : `${pool} TON`}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>👥 Участников</span>
            <span className={styles.statValue}>{loadingData ? '...' : players}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>🎰 Раунд</span>
            <span className={styles.statValue}>
              {loadingData ? '...' : (roundActive ? '✅ Активен' : '⏸ Остановлен')}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>🏆 Победитель</span>
            <span className={styles.statValue}>{loadingData ? '...' : winner}</span>
          </div>
        </div>

        {isOwner && (
          <div className={styles.actions}>
            <h2 className={styles.sectionTitle}>🔧 Административные действия</h2>
            
            <button
              onClick={handleDraw}
              disabled={loading !== null}
              className={`${styles.actionButton} ${styles.drawButton}`}
            >
              {loading === 'Розыгрыш' ? '⏳ Отправка...' : '🎰 Провести розыгрыш'}
            </button>

            <button
              onClick={handleClaim}
              disabled={loading !== null}
              className={`${styles.actionButton} ${styles.claimButton}`}
            >
              {loading === 'Получение приза' ? '⏳ Отправка...' : '💰 Отправить приз (ClaimPrize)'}
            </button>

            <button
              onClick={handleReset}
              disabled={loading !== null}
              className={`${styles.actionButton} ${styles.resetButton}`}
            >
              {loading === 'Сброс раунда' ? '⏳ Отправка...' : '🔄 Сбросить раунд'}
            </button>

            {status && status.includes('✅') && (
              <p className={styles.successStatus}>{status}</p>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <a href="/" className={styles.backLink}>← Назад на главную</a>
        </div>
      </main>
    </>
  );
}
EOFPAGE

echo "✅ Создана страница src/pages/admin.tsx"

# 4️⃣ Создаём стили для админ-панели
mkdir -p src/styles

cat > src/styles/Admin.module.css <<'EOF'
.container {
  background: radial-gradient(circle at top, #000010, #020024);
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  padding: 40px 20px;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(90deg, #ffd700, #ffaa00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.connectSection {
  max-width: 600px;
  margin: 0 auto 30px;
  text-align: center;
}

.connectButton {
  padding: 14px 28px;
  background: linear-gradient(90deg, #0088ff, #0055ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 136, 255, 0.3);
}

.connectButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 136, 255, 0.5);
}

.walletInfo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.walletAddress {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 8px;
}

.disconnectButton {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.disconnectButton:hover {
  background: rgba(255, 255, 255, 0.2);
}

.status {
  max-width: 600px;
  margin: 0 auto 30px;
  text-align: center;
}

.statusGranted {
  color: #00ff88;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.statusDenied {
  color: #ff4444;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.ownerInfo {
  font-size: 0.9rem;
  opacity: 0.7;
  font-family: 'Courier New', monospace;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto 40px;
}

.statCard {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.statLabel {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 10px;
}

.statValue {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ffff;
}

.actions {
  max-width: 600px;
  margin: 0 auto 40px;
}

.sectionTitle {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
  color: #ffd700;
}

.actionButton {
  width: 100%;
  padding: 16px 28px;
  margin-bottom: 15px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.drawButton {
  background: linear-gradient(90deg, #0088ff, #0055ff);
  box-shadow: 0 4px 15px rgba(0, 136, 255, 0.3);
}

.drawButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 136, 255, 0.5);
}

.claimButton {
  background: linear-gradient(90deg, #00ff88, #00cc66);
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  color: #000;
}

.claimButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 136, 0.5);
}

.resetButton {
  background: linear-gradient(90deg, #ff8800, #ff5500);
  box-shadow: 0 4px 15px rgba(255, 136, 0, 0.3);
}

.resetButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 136, 0, 0.5);
}

.actionButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.successStatus {
  margin-top: 15px;
  padding: 12px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #00ff88;
  text-align: center;
}

.footer {
  max-width: 600px;
  margin: 40px auto 0;
  text-align: center;
}

.backLink {
  color: #00ffff;
  text-decoration: none;
  font-size: 1rem;
  padding: 10px 20px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  display: inline-block;
  transition: all 0.3s ease;
}

.backLink:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
EOF

echo "✅ Созданы стили src/styles/Admin.module.css"

# 5️⃣ Проверяем и перезапускаем dev сервер (опционально)
echo ""
read -p "Перезапустить dev сервер сейчас? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🔄 Перезапускаю dev сервер..."
  if command -v lsof > /dev/null 2>&1; then
    lsof -ti:3000 | xargs kill 2>/dev/null || true
    sleep 1
  fi
  npm run dev > /dev/null 2>&1 &
  sleep 3
  echo "✅ Dev сервер запущен на http://localhost:3000"
else
  echo "ℹ️  Dev сервер не перезапущен. Запустите вручную: npm run dev"
fi

echo ""
echo "-----------------------------------------------------------"
echo "✅ Админ-панель создана!"
echo "🌍 Открой: http://localhost:3000/admin"
echo ""
echo "🔒 Доступ только для владельца контракта"
echo "   Установи NEXT_PUBLIC_OWNER_ADDRESS в .env.local"
echo ""
echo "🎯 Функции админ-панели:"
echo "   → 🎰 Провести розыгрыш (DrawWinner)"
echo "   → 💰 Отправить приз (ClaimPrize)"
echo "   → 🔄 Сбросить раунд (ResetRound)"
echo ""
echo "📊 Показывает:"
echo "   → Пул контракта"
echo "   → Количество участников"
echo "   → Статус раунда"
echo "   → Победитель"
echo "   → Owner адрес (автоматически из контракта)"
echo "-----------------------------------------------------------"

