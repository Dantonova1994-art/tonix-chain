#!/bin/bash

# === TONIX CHAIN 💎 ADMIN DASHBOARD UPGRADE (Participants + Stats) ===

cd "$(dirname "$0")" || exit

echo "👥 Добавляю секцию участников в админ-панель..."
echo "-----------------------------------------------------------"

# 1️⃣ Обновляем admin.tsx с добавлением секции участников
cat > src/pages/admin.tsx <<'EOFPAGE'
import React, { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
import axios from 'axios';
import Head from 'next/head';
import styles from '../styles/Admin.module.css';

// Opcodes from contract
const OP_BUY_TICKET = 3031985754;    // 0xb4b86e5a
const OP_DRAW_WINNER = 2838117625;   // 0xa92a3cf9
const OP_CLAIM_PRIZE = 2639554183;   // 0x9d546687
const OP_RESET_ROUND = 753035870;    // 0x2ce26a5e

// Amounts
const GAS_AMOUNT = "10000000";        // 0.01 TON

interface LogEntry {
  hash: string;
  time: string;
  action: string;
  color: string;
  link: string;
  value: string;
  from: string;
}

interface Participant {
  address: string;
  count: number;
}

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

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const TONCENTER_API = "https://toncenter.com/api/v2";
  const API_KEY = process.env.NEXT_PUBLIC_TONCENTER_API_KEY || "";
  const TONVIEWER_BASE = "https://tonviewer.com/transaction/";
  const TONVIEWER_ADDRESS = "https://tonviewer.com/";

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

  // Получение логов транзакций и участников
  const fetchLogsAndParticipants = async () => {
    if (!contract) return;
    
    try {
      setLoadingLogs(true);
      setLoadingParticipants(true);
      
      const res = await axios.get(`${TONCENTER_API}/getTransactions`, {
        params: {
          address: contract,
          limit: 100,
          ...(API_KEY && { api_key: API_KEY })
        }
      });

      if (res.data.ok && Array.isArray(res.data.result)) {
        const logEntries: LogEntry[] = [];
        const buysMap: Record<string, number> = {};
        
        // Находим последний ResetRound, чтобы считать участников только текущего раунда
        let lastResetIndex = -1;
        for (let i = 0; i < res.data.result.length; i++) {
          const tx = res.data.result[i];
          const inMsg = tx.in_msg;
          if (!inMsg || !inMsg.msg_data) continue;
          
          const bodyHex = inMsg.msg_data.text || '';
          if (bodyHex) {
            try {
              const opcode = parseInt(bodyHex.slice(0, 8), 16);
              if (opcode === OP_RESET_ROUND) {
                lastResetIndex = i;
                break;
              }
            } catch {
              // Пропускаем
            }
          }
        }
        
        // Обрабатываем транзакции (начиная с последнего ResetRound)
        const relevantTxs = lastResetIndex >= 0 
          ? res.data.result.slice(0, lastResetIndex)
          : res.data.result;
        
        for (const tx of relevantTxs) {
          try {
            const inMsg = tx.in_msg;
            if (!inMsg || !inMsg.msg_data) continue;
            
            // Извлекаем opcode
            let opcode: number | null = null;
            const bodyHex = inMsg.msg_data.text || '';
            
            if (bodyHex && bodyHex.length >= 8) {
              try {
                opcode = parseInt(bodyHex.slice(0, 8), 16);
              } catch {
                // Пропускаем
              }
            }
            
            if (!opcode) continue;
            
            // Определяем действие
            let action = 'Unknown';
            let color = '#888';
            
            if (opcode === OP_BUY_TICKET) {
              action = '🎟 BuyTicket';
              color = '#ffaa00';
              
              // Подсчитываем участников текущего раунда
              const fromAddr = inMsg.source;
              if (fromAddr) {
                buysMap[fromAddr] = (buysMap[fromAddr] || 0) + 1;
              }
            } else if (opcode === OP_DRAW_WINNER) {
              action = '🎰 DrawWinner';
              color = '#00bfff';
            } else if (opcode === OP_CLAIM_PRIZE) {
              action = '💰 ClaimPrize';
              color = '#00ff99';
            } else if (opcode === OP_RESET_ROUND) {
              action = '♻️ ResetRound';
              color = '#ff3366';
            } else {
              // Пропускаем неизвестные
              continue;
            }
            
            const fromAddr = inMsg.source || '—';
            const value = inMsg.value ? (parseInt(inMsg.value, 16) / 1e9).toFixed(3) : '0.000';
            
            logEntries.push({
              hash: tx.transaction_id.hash,
              time: new Date(parseInt(tx.utime) * 1000).toLocaleString('ru-RU'),
              action,
              color,
              link: `${TONVIEWER_BASE}${tx.transaction_id.hash}`,
              value: `${value} TON`,
              from: fromAddr.length > 16 ? fromAddr.slice(0, 8) + '...' + fromAddr.slice(-6) : fromAddr
            });
          } catch (err) {
            // Пропускаем транзакции с ошибками парсинга
            continue;
          }
        }
        
        // Формируем массив участников
        const participantsArray: Participant[] = Object.entries(buysMap)
          .map(([address, count]) => ({
            address,
            count
          }))
          .sort((a, b) => b.count - a.count); // Сортируем по количеству билетов
        
        setParticipants(participantsArray);
        setLogs(logEntries.slice(0, 30)); // Ограничиваем до 30 последних
      }
    } catch (err: any) {
      console.error('Error fetching logs and participants:', err);
      setLogs([]);
      setParticipants([]);
    } finally {
      setLoadingLogs(false);
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchContractData();
      fetchLogsAndParticipants();
      const interval = setInterval(() => {
        fetchContractData();
        fetchLogsAndParticipants();
      }, 15000);
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
      setTimeout(() => {
        fetchContractData();
        fetchLogsAndParticipants();
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
        <h1 className={styles.title}>👑 TONIX CHAIN — Admin Dashboard</h1>
        
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

        {isOwner && (
          <div className={styles.participantsSection}>
            <h2 className={styles.sectionTitle}>👥 Участники текущего раунда</h2>
            {loadingParticipants ? (
              <p className={styles.loadingText}>Загрузка участников...</p>
            ) : participants.length === 0 ? (
              <p className={styles.emptyText}>Нет активных участников в текущем раунде</p>
            ) : (
              <div className={styles.participantsTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Адрес</th>
                      <th>Билетов</th>
                      <th>Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, idx) => (
                      <tr key={p.address}>
                        <td>{idx + 1}</td>
                        <td className={styles.addressCell}>
                          <a 
                            href={`${TONVIEWER_ADDRESS}${p.address}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.addressLink}
                          >
                            {p.address.slice(0, 8)}...{p.address.slice(-6)}
                          </a>
                        </td>
                        <td className={styles.countCell}>{p.count}</td>
                        <td>
                          <a 
                            href={`${TONVIEWER_ADDRESS}${p.address}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.viewLink}
                          >
                            🔗 View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {isOwner && (
          <div className={styles.logsSection}>
            <h2 className={styles.sectionTitle}>📜 История активности</h2>
            <div className={styles.logsContainer}>
              {loadingLogs ? (
                <p className={styles.loadingText}>Загрузка транзакций...</p>
              ) : logs.length === 0 ? (
                <p className={styles.emptyText}>Нет транзакций для отображения</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={styles.logEntry}>
                    <div className={styles.logHeader}>
                      <span className={styles.logAction} style={{ color: log.color }}>
                        {log.action}
                      </span>
                      <span className={styles.logValue}>{log.value}</span>
                    </div>
                    <div className={styles.logDetails}>
                      <span className={styles.logTime}>{log.time}</span>
                      <span className={styles.logFrom}>от {log.from}</span>
                    </div>
                    <a 
                      href={log.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.logLink}
                    >
                      🔗 TonViewer
                    </a>
                  </div>
                ))
              )}
            </div>
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

echo "✅ Обновлён src/pages/admin.tsx с секцией участников"

# 2️⃣ Обновляем стили, добавляя стили для таблицы участников
cat >> src/styles/Admin.module.css <<'EOF'

.participantsSection {
  max-width: 900px;
  margin: 40px auto;
}

.participantsTable {
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.table thead {
  background: rgba(0, 255, 170, 0.1);
}

.table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid rgba(0, 255, 170, 0.3);
  color: #00ffaa;
}

.table td {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table tbody tr:hover {
  background: rgba(0, 255, 170, 0.05);
  border-radius: 4px;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.addressCell {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.addressLink {
  color: #00aaff;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.addressLink:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.countCell {
  text-align: center;
  font-weight: bold;
  color: #00ffaa;
  font-size: 1.1rem;
}

.viewLink {
  color: #00aaff;
  text-decoration: none;
  font-size: 0.9rem;
  transition: opacity 0.3s ease;
}

.viewLink:hover {
  opacity: 0.7;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .participantsTable {
    padding: 15px 10px;
  }
  
  .table {
    font-size: 0.85rem;
  }
  
  .table th,
  .table td {
    padding: 8px 4px;
  }
}
EOF

echo "✅ Обновлены стили src/styles/Admin.module.css"

# 3️⃣ Проверяем и перезапускаем dev сервер (опционально)
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
echo "✅ Секция участников добавлена в админ-панель!"
echo "🌍 Проверь: http://localhost:3000/admin"
echo ""
echo "👥 Функции секции участников:"
echo "   → Отображение всех участников текущего раунда"
echo "   → Подсчёт количества билетов для каждого участника"
echo "   → Сортировка по количеству билетов (по убыванию)"
echo "   → Ссылки на TonViewer для каждого адреса"
echo "   → Автообновление каждые 15 секунд"
echo ""
echo "📊 Логика:"
echo "   → Учитываются только транзакции BuyTicket"
echo "   → Подсчёт ведётся от последнего ResetRound"
echo "   → Если ResetRound не было, учитываются все транзакции"
echo "-----------------------------------------------------------"

