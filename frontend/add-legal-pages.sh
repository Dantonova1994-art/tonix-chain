#!/bin/bash

# === TONIX CHAIN 💎 LEGAL PAGES (TERMS & PRIVACY) + MANIFEST UPDATE ===

cd "$(dirname "$0")" || exit

echo "📄 Добавляю страницы Terms и Privacy + обновляю manifest..."
echo "-----------------------------------------------------------"

# 1️⃣ Создаём директорию для страниц
mkdir -p src/pages

# 2️⃣ Создаём Terms of Use страницу
cat > src/pages/terms.tsx <<'EOF'
import React from 'react';
import Head from 'next/head';
import styles from '../styles/Legal.module.css';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Use — TONIX CHAIN</title>
        <meta name="description" content="Terms of Use for TONIX CHAIN lottery platform" />
      </Head>
      <main className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>📜 Terms of Use</h1>
          
          <section className={styles.section}>
            <h2>1. Introduction</h2>
            <p>Welcome to TONIX CHAIN — a decentralized lottery platform built on The Open Network (TON) blockchain. By accessing and using this application, you agree to be bound by these Terms of Use.</p>
          </section>

          <section className={styles.section}>
            <h2>2. Blockchain Transactions</h2>
            <p>All transactions occur directly on the TON blockchain. Once executed, transactions <strong>cannot be reversed or refunded</strong>. Please ensure you understand the implications of blockchain transactions before participating.</p>
          </section>

          <section className={styles.section}>
            <h2>3. User Responsibility</h2>
            <p>You are solely responsible for:</p>
            <ul>
              <li>Securing your wallet and private keys</li>
              <li>All actions performed through your wallet</li>
              <li>Verifying transaction details before confirming</li>
              <li>Understanding the rules and mechanics of the lottery</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Smart Contract Operation</h2>
            <p>TONIX CHAIN operates entirely on-chain through smart contracts. We do not:</p>
            <ul>
              <li>Store user data or personal information</li>
              <li>Hold custody of user assets</li>
              <li>Have the ability to modify or reverse transactions</li>
              <li>Control the outcome of lottery draws</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Participation</h2>
            <p>Participation in the lottery is <strong>entirely voluntary</strong>. By purchasing tickets and interacting with the smart contract, you acknowledge that you have read, understood, and accept these Terms of Use in full.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Risk Disclaimer</h2>
            <p>Cryptocurrency and blockchain activities carry inherent risks. You participate at your own risk. The developers of TONIX CHAIN are not liable for any losses incurred.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Changes to Terms</h2>
            <p>These terms may be updated from time to time. Continued use of the platform constitutes acceptance of any changes.</p>
          </section>

          <div className={styles.footer}>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <a href="/" className={styles.link}>← Back to Home</a>
          </div>
        </div>
      </main>
    </>
  );
}
EOF

echo "✅ Создана страница src/pages/terms.tsx"

# 3️⃣ Создаём Privacy Policy страницу
cat > src/pages/privacy.tsx <<'EOF'
import React from 'react';
import Head from 'next/head';
import styles from '../styles/Legal.module.css';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — TONIX CHAIN</title>
        <meta name="description" content="Privacy Policy for TONIX CHAIN lottery platform" />
      </Head>
      <main className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>🔒 Privacy Policy</h1>
          
          <section className={styles.section}>
            <h2>1. Overview</h2>
            <p>TONIX CHAIN respects your privacy. This application operates as a decentralized application (dApp) and does not collect, store, or process any personal data or user information.</p>
          </section>

          <section className={styles.section}>
            <h2>2. No Data Collection</h2>
            <p>We do not collect or store:</p>
            <ul>
              <li>Personal information or identification data</li>
              <li>Wallet addresses (except as visible on-chain)</li>
              <li>Transaction history (beyond public blockchain records)</li>
              <li>Cookies or tracking identifiers</li>
              <li>Usage analytics or behavioral data</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Wallet Connection</h2>
            <p>When you connect your wallet using TonConnect or similar services:</p>
            <ul>
              <li>The connection is handled directly between your wallet and the blockchain</li>
              <li>No wallet information is transmitted to our servers</li>
              <li>Transaction signing occurs locally in your wallet</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Public Blockchain Data</h2>
            <p>The interface displays information that is publicly available on the TON blockchain, including:</p>
            <ul>
              <li>Contract balance (pool size)</li>
              <li>Number of participants</li>
              <li>Winner addresses (from completed draws)</li>
              <li>Transaction history</li>
            </ul>
            <p>This data is read directly from the blockchain and is not stored by our application.</p>
          </section>

          <section className={styles.section}>
            <h2>5. No Tracking</h2>
            <p>TONIX CHAIN does not use:</p>
            <ul>
              <li>Cookies or local storage for tracking</li>
              <li>Third-party analytics services</li>
              <li>Advertising networks</li>
              <li>User behavior tracking tools</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Blockchain Transparency</h2>
            <p>By using TONIX CHAIN, you acknowledge that:</p>
            <ul>
              <li>All blockchain transactions are publicly visible</li>
              <li>Wallet addresses are pseudonymous but traceable</li>
              <li>Transaction history is permanently recorded on-chain</li>
              <li>This transparency is inherent to blockchain technology</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>TonConnect</strong>: For wallet connections (privacy policy governed by their terms)</li>
              <li><strong>Toncenter API</strong>: For reading blockchain data (public API, no authentication required)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>8. Contact</h2>
            <p>If you have questions about this Privacy Policy, please refer to the TONIX CHAIN contract on the TON blockchain or check our Terms of Use page.</p>
          </section>

          <div className={styles.footer}>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <a href="/" className={styles.link}>← Back to Home</a>
          </div>
        </div>
      </main>
    </>
  );
}
EOF

echo "✅ Создана страница src/pages/privacy.tsx"

# 4️⃣ Создаём стили для страниц
mkdir -p src/styles

cat > src/styles/Legal.module.css <<'EOF'
.container {
  background: radial-gradient(circle at top, #00ffff33, #000011);
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  padding: 40px 20px;
  line-height: 1.6;
}

.content {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(90deg, #00ffff, #0077ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section {
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section:last-of-type {
  border-bottom: none;
}

.section h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #00ffff;
}

.section p {
  margin-bottom: 15px;
  font-size: 1rem;
  opacity: 0.9;
}

.section ul {
  margin-left: 20px;
  margin-top: 10px;
  margin-bottom: 15px;
}

.section li {
  margin-bottom: 8px;
  opacity: 0.85;
}

.section strong {
  color: #00ffff;
  font-weight: 600;
}

.footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.footer p {
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.link {
  display: inline-block;
  color: #00ffff;
  text-decoration: none;
  font-size: 1rem;
  padding: 10px 20px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.link:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
}

@media (max-width: 768px) {
  .content {
    padding: 25px 20px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .section h2 {
    font-size: 1.3rem;
  }
}
EOF

echo "✅ Созданы стили src/styles/Legal.module.css"

# 5️⃣ Определяем DEPLOY_URL (пробуем несколько способов)
DEPLOY_URL="https://tonixchain.vercel.app"

# Пробуем получить из .vercel/project.json если он есть
if [ -f ".vercel/project.json" ]; then
  VERCEL_PROJECT=$(cat .vercel/project.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
  if [ ! -z "$VERCEL_PROJECT" ]; then
    DEPLOY_URL="https://${VERCEL_PROJECT}.vercel.app"
    echo "📍 Найден проект Vercel: $DEPLOY_URL"
  fi
fi

# Пробуем получить актуальный URL через vercel (если авторизован)
if command -v vercel &> /dev/null; then
  VERCEL_INSPECT=$(vercel inspect --prod 2>/dev/null | grep -E "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1)
  if [ ! -z "$VERCEL_INSPECT" ]; then
    DEPLOY_URL=$(echo "$VERCEL_INSPECT" | grep -oE "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1)
    echo "📍 Получен актуальный URL из Vercel: $DEPLOY_URL"
  fi
fi

# 6️⃣ Обновляем TonConnect манифест
cat > public/tonconnect-manifest.json <<EOF
{
  "url": "${DEPLOY_URL}",
  "name": "TONIX CHAIN",
  "iconUrl": "https://ton.org/favicon.ico",
  "termsOfUseUrl": "${DEPLOY_URL}/terms",
  "privacyPolicyUrl": "${DEPLOY_URL}/privacy"
}
EOF

echo "✅ Обновлён public/tonconnect-manifest.json"
echo "   URL: $DEPLOY_URL"

# 7️⃣ Проверяем запущен ли dev сервер и перезапускаем если нужно
echo ""
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "🔄 Перезапускаю dev сервер..."
  lsof -ti:3000 | xargs kill 2>/dev/null || true
  sleep 1
  npm run dev > /dev/null 2>&1 &
  sleep 3
  echo "✅ Dev сервер перезапущен"
else
  echo "ℹ️  Dev сервер не запущен. Запустите вручную: npm run dev"
fi

echo ""
echo "-----------------------------------------------------------"
echo "✅ Страницы /terms и /privacy добавлены"
echo "🌍 Manifest обновлён: $DEPLOY_URL"
echo ""
echo "🧩 Проверь страницы:"
echo "   → http://localhost:3000/terms"
echo "   → http://localhost:3000/privacy"
echo ""
echo "📎 Telegram и TonConnect теперь принимают dApp без ошибок!"
echo "💡 Не забудьте обновить manifest после деплоя в Vercel"
echo "-----------------------------------------------------------"

