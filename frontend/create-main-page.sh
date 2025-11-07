#!/bin/bash

# === CREATE MAIN PAGE FOR TONIX CHAIN FRONTEND ===

cd "$(dirname "$0")" || exit

echo "📄 Создание главной страницы TONIX CHAIN..."
echo "-------------------------------------------"

# 1️⃣ Создаём директорию если её нет
mkdir -p src/pages

# 2️⃣ Сохраняем бэкап существующей страницы
if [ -f "src/pages/index.tsx" ]; then
  echo "💾 Сохраняю бэкап существующей страницы..."
  cp src/pages/index.tsx src/pages/index.tsx.backup
  echo "✅ Бэкап сохранён: src/pages/index.tsx.backup"
fi

# 3️⃣ Создаём новую главную страницу
cat > src/pages/index.tsx <<'EOF'
import React from 'react';
import Head from 'next/head';
import { TonConnectButton } from '@tonconnect/ui-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>TONIX CHAIN — Lottery on TON</title>
        <meta name="description" content="Лотерея будущего на TON 💎" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <main style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #00ffff 0%, #000055 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '20px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #00ffff, #0088ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          💎 TONIX CHAIN
        </h1>
        <p style={{ 
          marginBottom: '2rem',
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          Лотерея будущего на TON
        </p>
        <div style={{
          marginTop: '20px'
        }}>
          <TonConnectButton />
        </div>
      </main>
    </>
  );
}
EOF

echo "✅ Главная страница создана: src/pages/index.tsx"

# 4️⃣ Проверяем что файл создан
if [ -f "src/pages/index.tsx" ]; then
  echo "✅ Файл успешно создан"
  ls -lh src/pages/index.tsx
else
  echo "❌ Ошибка создания файла"
  exit 1
fi

echo ""
echo "-------------------------------------------"
echo "🔨 Следующий шаг: сборка проекта"
echo "-------------------------------------------"
echo ""
read -p "Пересобрать проект сейчас? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🔨 Запуск сборки..."
  npm run build || {
    echo "❌ Ошибка сборки. Проверьте ошибки выше."
    exit 1
  }
  
  echo ""
  echo "✅ Сборка завершена успешно!"
  echo ""
  read -p "Деплоить в Vercel production? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Запуск деплоя в Vercel..."
    vercel --prod || {
      echo "❌ Ошибка деплоя. Проверьте логи выше."
      exit 1
    }
    echo "✅ Деплой завершён!"
  else
    echo "ℹ️ Деплой пропущен. Запустите вручную: vercel --prod"
  fi
else
  echo "ℹ️ Сборка пропущена. Запустите вручную: npm run build"
fi

echo ""
echo "-------------------------------------------"
echo "✅ Главная страница создана"
echo "📄 Файл: src/pages/index.tsx"
if [ -f "src/pages/index.tsx.backup" ]; then
  echo "💾 Бэкап: src/pages/index.tsx.backup"
fi
echo "-------------------------------------------"

