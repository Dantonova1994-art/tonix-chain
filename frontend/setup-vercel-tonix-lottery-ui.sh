#!/bin/bash

# === TONIX CHAIN — VERCEL PROJECT SETUP FOR tonix-lottery-ui ===

cd "$(dirname "$0")" || exit

echo "🔧 Настройка Vercel проекта для tonix-lottery-ui.vercel.app"
echo "============================================================"
echo ""

# 1. Проверка текущего проекта
echo "📋 Текущий проект:"
if [ -f ".vercel/project.json" ]; then
  CURRENT_NAME=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
  echo "   Название: $CURRENT_NAME"
  
  if [ "$CURRENT_NAME" = "tonix-lottery-ui" ]; then
    echo "   ✅ Проект уже называется tonix-lottery-ui"
    echo "   ✅ Домен должен быть: https://tonix-lottery-ui.vercel.app/"
  else
    echo "   ⚠️  Проект называется '$CURRENT_NAME', нужно переименовать"
  fi
else
  echo "   ⚠️ Проект не инициализирован"
fi

echo ""

# 2. Проверка доступности домена
echo "🔍 Проверка домена:"
TARGET_URL="https://tonix-lottery-ui.vercel.app"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "   ✅ $TARGET_URL — доступен (HTTP $HTTP_STATUS)"
  echo "   ✅ Домен уже работает!"
else
  echo "   ⚠️  $TARGET_URL — HTTP $HTTP_STATUS или недоступен"
fi

echo ""

# 3. Переименование проекта
if [ -f ".vercel/project.json" ]; then
  CURRENT_NAME=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
  
  if [ "$CURRENT_NAME" != "tonix-lottery-ui" ]; then
    echo "🔄 Переименование проекта..."
    echo ""
    echo "Вариант 1: Через Vercel CLI (рекомендуется)"
    echo "   vercel link --project=tonix-lottery-ui --yes"
    echo ""
    echo "Вариант 2: Через Vercel Dashboard"
    echo "   1. Откройте: https://vercel.com/dashboard"
    echo "   2. Выберите проект '$CURRENT_NAME'"
    echo "   3. Settings → General → Project Name"
    echo "   4. Измените на: tonix-lottery-ui"
    echo "   5. Сохраните"
    echo ""
    
    read -p "Переименовать проект через CLI сейчас? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      vercel link --project=tonix-lottery-ui --yes || {
        echo "⚠️ Автоматическое переименование не удалось"
        echo "ℹ️ Используйте Vercel Dashboard для переименования"
      }
    fi
  fi
fi

echo ""

# 4. Проверка после переименования
if [ -f ".vercel/project.json" ]; then
  NEW_NAME=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
  if [ "$NEW_NAME" = "tonix-lottery-ui" ]; then
    echo "✅ Проект успешно переименован в: tonix-lottery-ui"
  fi
fi

echo ""

# 5. Деплой для обновления
echo "🚀 Деплой проекта..."
read -p "Задеплоить проект сейчас? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  vercel --prod || {
    echo "❌ Ошибка деплоя"
    exit 1
  }
  echo "✅ Деплой завершён"
else
  echo "ℹ️ Деплой пропущен. Запустите: vercel --prod"
fi

echo ""

# 6. Финальная проверка
echo "🔍 Финальная проверка..."
FINAL_URL="https://tonix-lottery-ui.vercel.app"
FINAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FINAL_URL" 2>/dev/null || echo "000")

echo ""
echo "============================================================"
echo "📊 ИТОГОВЫЙ РЕЗУЛЬТАТ"
echo "============================================================"
echo ""
echo "🎯 Production URL для BotFather:"
echo "   $FINAL_URL"
echo ""

if [ "$FINAL_STATUS" = "200" ]; then
  echo "✅ Статус: ДОСТУПЕН (HTTP $FINAL_STATUS)"
  echo ""
  echo "📋 Настройка в BotFather:"
  echo "   1. Откройте @BotFather"
  echo "   2. Выберите @tonixchain_lottery_bot"
  echo "   3. Bot Settings → Menu Button → Edit Menu Button"
  echo "   4. Вставьте URL: $FINAL_URL"
  echo "   5. Сохраните"
  echo ""
  echo "🔗 После настройки Mini App будет доступен по:"
  echo "   https://t.me/tonixchain_lottery_bot/app"
else
  echo "⚠️  Статус: НЕДОСТУПЕН (HTTP $FINAL_STATUS)"
  echo ""
  echo "💡 Действия:"
  echo "   1. Убедитесь что проект переименован в 'tonix-lottery-ui'"
  echo "   2. Задеплойте проект: vercel --prod"
  echo "   3. Проверьте логи: vercel logs --since=1h"
  echo "   4. Проверьте настройки в Vercel Dashboard"
fi

echo ""
echo "============================================================"

