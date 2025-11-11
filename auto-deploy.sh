#!/bin/bash

# 🧩 TONIX CHAIN — Auto-Fix CI/CD & Deploy Diagnostic
# Проверка и автоматический деплой последней версии в Vercel

echo "🚀 TONIX CHAIN — STARTING FULL DEPLOY CHECK..."

# 1️⃣ Переходим в папку проекта
cd /Users/danaraantonova/tonix-chain || { echo "❌ Проект tonix-chain не найден"; exit 1; }

# 2️⃣ Проверяем git-состояние
echo "📦 Проверяю git status..."
git fetch origin main 2>/dev/null || true
git status

# 3️⃣ Проверяем, что workflow существует
if [ ! -f ".github/workflows/deploy.yml" ]; then
  echo "⚙️  Workflow отсутствует — создаю заново..."
  mkdir -p .github/workflows
  
  cat > .github/workflows/deploy.yml <<'EOF'
name: 🚀 TONIX CHAIN Auto Deploy

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: cd frontend && npm install --legacy-peer-deps

      - name: Build TONIX CHAIN
        run: cd frontend && npm run build

      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: cd frontend && npx vercel --prod --force --yes
EOF

  git add .github/workflows/deploy.yml
  git commit -m "ci: restore GitHub Actions deploy workflow" || echo "⚠️  Нет изменений для коммита"
fi

# 4️⃣ Проверяем подключение к GitHub
if [ "$(git remote get-url origin 2>/dev/null)" = "" ]; then
  echo "⚠️  Репозиторий не привязан к GitHub. Настраиваю..."
  if command -v gh &> /dev/null; then
    gh repo create Dantonova1994-art/tonix-chain --private --source=. --remote=origin 2>/dev/null || echo "⚠️  Репозиторий уже существует или нет доступа"
    git push -u origin main 2>/dev/null || echo "⚠️  Push не удался, проверь настройки"
  else
    echo "⚠️  GitHub CLI не установлен. Установи: brew install gh"
  fi
else
  echo "✅ GitHub repo: $(git remote get-url origin)"
fi

# 5️⃣ Проверяем подключение к Vercel
if ! command -v vercel &> /dev/null; then
  echo "⚙️  Устанавливаю Vercel CLI..."
  npm install -g vercel
fi

echo "🔗 Проверяю подключение к Vercel..."
cd frontend
vercel link --yes --confirm 2>/dev/null || echo "⚠️  Проверь подключение вручную в dashboard.vercel.com"

# 6️⃣ Делаем коммит и пуш, чтобы запустить CI
echo "📤 Коммичу и пушу изменения..."
cd ..
git add . 2>/dev/null || true
git commit -m "fix: trigger redeploy from local" || echo "⚠️  Нет изменений для коммита"
git push origin main 2>/dev/null || echo "⚠️  Push не удался, проверь настройки"

# 7️⃣ Принудительно запускаем деплой
echo "🚀 Запускаю деплой на Vercel..."
cd frontend
npx vercel --prod --force --yes 2>/dev/null || echo "⚠️  Деплой не удался, проверь настройки Vercel"

# 8️⃣ Проверяем результат
echo ""
echo "✅ Проверка завершена!"
echo "🌐 Открой Mini App: https://t.me/tonixchain_lottery_bot/app?startapp=lottery"
echo "💎 Проверь деплой: https://vercel.com/dashboard"
echo ""
echo "📋 Следующие шаги:"
echo "1. Проверь GitHub Actions: https://github.com/Dantonova1994-art/tonix-chain/actions"
echo "2. Настрой secrets в GitHub: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
echo "3. Проверь статус деплоя в Vercel Dashboard"

