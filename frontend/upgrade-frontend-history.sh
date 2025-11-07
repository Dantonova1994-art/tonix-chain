#!/bin/bash

# === TONIX CHAIN 💎 FRONTEND UPGRADE: HISTORY SECTION ===

cd "$(dirname "$0")" || exit

echo "📜 Добавляем секцию History (История розыгрышей)..."
echo "---------------------------------------------------"

# 1️⃣ Проверяем наличие контракта
DEFAULT_CONTRACT="EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT"

if [ -f "../contracts/.env" ]; then
  CONTRACT_ADDRESS=$(grep "^PROD_CONTRACT=" ../contracts/.env | cut -d'=' -f2)
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
  CONTRACT_ADDRESS="$DEFAULT_CONTRACT"
  echo "⚠️ PROD_CONTRACT не найден, используется дефолтный адрес: $CONTRACT_ADDRESS"
else
  echo "✅ Найден контракт: $CONTRACT_ADDRESS"
fi

# 2️⃣ Установка axios (если не установлен)
npm install axios --legacy-peer-deps || npm install axios

# 3️⃣ Обновляем index.tsx с сохранением существующего функционала и добавлением истории
cat > src/pages/index.tsx <<'EOFPAGE'
import { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
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
const TICKET_PRICE = "1000000000";
const GAS_AMOUNT = "10000000";

interface HistoryItem {
  hash: string;
  time: string;
  winner: string;
  prize: string;
  txUrl: string;
}

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
  
  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

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
      
      const [poolRes, playersRes, winnerRes, roundRes] = await Promise.all([
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: CONTRACT_ADDRESS,
            method: 'pool',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        }),
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: CONTRACT_ADDRESS,
            method: 'participantCount',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        }),
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: CONTRACT_ADDRESS,
            method: 'winner',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        }),
        axios.get(`${TONCENTER_API}/runGetMethod`, {
          params: {
            address: CONTRACT_ADDRESS,
            method: 'roundActive',
            stack: [],
            ...(API_KEY && { api_key: API_KEY })
          }
        })
      ]);

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
    } finally {
      setLoadingData(false);
    }
  };

  // История розыгрышей
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      
      // Получаем транзакции контракта
      const res = await axios.get(`${TONCENTER_API}/getTransactions`, {
        params: {
          address: CONTRACT_ADDRESS,
          limit: 50,
          ...(API_KEY && { api_key: API_KEY })
        }
      });

      if (res.data.ok && Array.isArray(res.data.result)) {
        const historyItems: HistoryItem[] = [];
        
        // Ищем транзакции с DrawWinner (opcode 2838117625 = 0xa92a3cf9)
        // Также ищем транзакции ClaimPrize, которые следуют после DrawWinner
        const transactions = res.data.result;
        
        for (let i = 0; i < transactions.length && historyItems.length < 10; i++) {
          const tx = transactions[i];
          
          // Проверяем, является ли это транзакцией DrawWinner
          // Проверяем body сообщения на наличие opcode DrawWinner
          try {
            const inMsg = tx.in_msg;
            if (inMsg && inMsg.msg_data) {
              // DrawWinner opcode в hex: 0xa92a3cf9
              // Проверяем body или ищем в hex данных
              const body = inMsg.msg_data.body || '';
              const bodyHex = inMsg.msg_data.text || '';
              
              // Проверяем наличие opcode DrawWinner (может быть в разных форматах)
              const hasDrawWinner = bodyHex.includes('a92a3cf9') || 
                                   bodyHex.toLowerCase().includes('a92a3cf9') ||
                                   (typeof body === 'string' && body.includes('DrawWinner'));
              
              if (hasDrawWinner) {
                // Находим соответствующую транзакцию ClaimPrize для этого розыгрыша
                let prizeAmount = '—';
                for (let j = i + 1; j < Math.min(i + 10, transactions.length); j++) {
                  const nextTx = transactions[j];
                  const nextBody = nextTx.in_msg?.msg_data?.body || '';
                  const nextBodyHex = nextTx.in_msg?.msg_data?.text || '';
                  
                  // ClaimPrize opcode: 0x9d546687
                  if (nextBodyHex.includes('9d546687') || 
                      nextBodyHex.toLowerCase().includes('9d546687') ||
                      (typeof nextBody === 'string' && nextBody.includes('ClaimPrize'))) {
                    // Находим out_msg с призом
                    if (nextTx.out_msgs && nextTx.out_msgs.length > 0) {
                      const outMsg = nextTx.out_msgs[0];
                      if (outMsg.value) {
                        prizeAmount = (parseInt(outMsg.value, 16) / 1e9).toFixed(2) + ' TON';
                      }
                    }
                    break;
                  }
                }
                
                const winnerAddr = inMsg.source || '—';
                historyItems.push({
                  hash: tx.transaction_id.hash,
                  time: new Date(parseInt(tx.utime) * 1000).toLocaleString('ru-RU'),
                  winner: winnerAddr.length > 16 ? winnerAddr.slice(0, 8) + '...' + winnerAddr.slice(-8) : winnerAddr,
                  prize: prizeAmount,
                  txUrl: `https://tonviewer.com/transaction/${tx.transaction_id.hash}`
                });
              }
            }
          } catch (err) {
            // Пропускаем транзакции с ошибками парсинга
            continue;
          }
        }
        
        setHistory(historyItems);
      }
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Обновляем данные каждые 15 секунд
  useEffect(() => {
    fetchContractData();
    fetchHistory();
    const interval = setInterval(() => {
      fetchContractData();
      fetchHistory();
    }, 15000);
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
      setTimeout(() => {
        fetchContractData();
        fetchHistory();
      }, 5000);
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

      <div className={styles.history}>
        <h2 className={styles.historyTitle}>📜 История розыгрышей</h2>
        {loadingHistory ? (
          <p className={styles.loading}>Загрузка истории...</p>
        ) : history.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата и время</th>
                  <th>Победитель</th>
                  <th>Приз</th>
                  <th>Транзакция</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.time}</td>
                    <td className={styles.addressCell}>{item.winner}</td>
                    <td>{item.prize}</td>
                    <td>
                      <a 
                        href={item.txUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        🔗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.emptyHistory}>Нет данных о розыгрышах</p>
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

# 4️⃣ Добавляем стили для истории
cat >> src/styles/Home.module.css <<'EOF'

.history {
  margin-top: 40px;
  width: 90%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.historyTitle {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #00ffff, #0077ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading, .emptyHistory {
  text-align: center;
  padding: 40px 20px;
  opacity: 0.7;
  font-size: 1rem;
}

.tableWrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-top: 10px;
}

.table thead {
  background: rgba(0, 255, 255, 0.1);
}

.table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
}

.table td {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
}

.table tbody tr:hover {
  background: rgba(0, 255, 255, 0.05);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.addressCell {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.table .link {
  color: #00ffff;
  text-decoration: none;
  font-size: 1.2rem;
  transition: opacity 0.3s ease;
}

.table .link:hover {
  opacity: 0.7;
  text-decoration: none;
}

@media (max-width: 768px) {
  .table {
    font-size: 0.8rem;
  }
  
  .table th,
  .table td {
    padding: 8px 4px;
  }
  
  .history {
    padding: 20px 15px;
  }
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

echo "---------------------------------------------------"
echo "✅ TONIX CHAIN FRONTEND обновлён: добавлена секция HISTORY"
echo "🌐 Контракт: ${CONTRACT_ADDRESS}"
echo "📜 Отображает последние 10 розыгрышей через Toncenter API"
echo "🔄 Автообновление каждые 15 секунд"
echo ""
echo "🚀 Запуск:"
echo "   npm run dev   →  http://localhost:3000"
echo "   npm run build →  Сборка для продакшена"
echo "---------------------------------------------------"

