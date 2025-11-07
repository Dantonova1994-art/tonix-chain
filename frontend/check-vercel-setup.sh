#!/bin/bash

# === TONIX CHAIN — VERCEL PROJECT SETUP CHECK ===

cd "$(dirname "$0")" || exit

echo "🔍 Проверка настроек Vercel проекта..."
echo "=========================================="
echo ""

# 1. Проверка текущего проекта
echo "📋 [1/5] Текущий проект:"
if [ -f ".vercel/project.json" ]; then
  PROJECT_NAME=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
  PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
  echo "   Название: $PROJECT_NAME"
  echo "   ID: $PROJECT_ID"
else
  echo "   ⚠️ Проект не инициализирован"
fi

echo ""

# 2. Проверка текущего URL
echo "📋 [2/5] Проверка текущего деплоя:"
if command -v vercel &> /dev/null; then
  CURRENT_URL=$(vercel ls 2>/dev/null | grep -E "https://" | head -1 | awk '{print $2}')
  if [ ! -z "$CURRENT_URL" ]; then
    echo "   Текущий URL: $CURRENT_URL"
  else
    echo "   ⚠️ Не удалось определить текущий URL"
  fi
else
  echo "   ⚠️ Vercel CLI не установлен"
fi

echo ""

# 3. Проверка vercel.json
echo "📋 [3/5] Проверка vercel.json:"
if [ -f "vercel.json" ]; then
  echo "   ✅ vercel.json найден"
  cat vercel.json | head -20
else
  echo "   ⚠️ vercel.json не найден"
fi

echo ""

# 4. Проверка доступности домена
echo "📋 [4/5] Проверка доступности доменов:"

check_domain() {
  local domain=$1
  local status=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    echo "   ✅ $domain — доступен (HTTP $status)"
    return 0
  elif [ "$status" = "404" ]; then
    echo "   ❌ $domain — возвращает 404"
    return 1
  else
    echo "   ⚠️  $domain — HTTP $status или недоступен"
    return 1
  fi
}

check_domain "tonix-lottery-ui.vercel.app"
check_domain "tonix-chain.vercel.app"
check_domain "frontend.vercel.app"

echo ""

# 5. Рекомендации
echo "📋 [5/5] Рекомендации:"
echo ""
echo "🎯 Для использования домена: https://tonix-lottery-ui.vercel.app/"
echo ""
echo "Вариант 1: Переименование проекта (рекомендуется)"
echo "   1. vercel link --project=tonix-lottery-ui"
echo "   2. Или через Vercel Dashboard: Settings → General → Project Name"
echo ""
echo "Вариант 2: Создание нового проекта"
echo "   1. Удалить .vercel/project.json"
echo "   2. vercel link --project=tonix-lottery-ui"
echo "   3. vercel --prod"
echo ""
echo "Вариант 3: Настройка кастомного домена"
echo "   1. Vercel Dashboard → Settings → Domains"
echo "   2. Добавить домен: tonix-lottery-ui.vercel.app"
echo ""
echo "=========================================="

