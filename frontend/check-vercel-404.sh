#!/bin/bash

# Скрипт для проверки и исправления 404 на Vercel для Next.js проекта

cd "$(dirname "$0")" || exit

echo "🔍 ПРОВЕРКА И ИСПРАВЛЕНИЕ 404 НА VERCEL"
echo "=========================================="
echo ""

# 1. Проверка структуры проекта
echo "📁 [1/8] Проверка структуры проекта:"
echo "   Текущая директория: $(pwd)"
echo ""

if [ -f "next.config.js" ]; then
    echo "   ✅ Next.js проект обнаружен"
    PROJECT_TYPE="nextjs"
elif [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
    echo "   ✅ Vite проект обнаружен"
    PROJECT_TYPE="vite"
elif [ -f "package.json" ]; then
    echo "   ⚠️  Проект найден, проверяю тип..."
    BUILD_CMD=$(cat package.json | grep -A 5 '"scripts"' | grep '"build"' | cut -d'"' -f4)
    if echo "$BUILD_CMD" | grep -q "next"; then
        PROJECT_TYPE="nextjs"
        echo "   ✅ Next.js проект (по build скрипту)"
    elif echo "$BUILD_CMD" | grep -q "vite"; then
        PROJECT_TYPE="vite"
        echo "   ✅ Vite проект (по build скрипту)"
    else
        echo "   ❌ Неизвестный тип проекта"
        exit 1
    fi
else
    echo "   ❌ package.json не найден"
    exit 1
fi

echo ""

# 2. Проверка package.json
echo "📦 [2/8] Проверка package.json:"
if [ -f "package.json" ]; then
    BUILD_SCRIPT=$(cat package.json | grep -A 5 '"scripts"' | grep '"build"' | cut -d'"' -f4)
    echo "   Build команда: $BUILD_SCRIPT"
    
    if [ "$PROJECT_TYPE" = "nextjs" ]; then
        if echo "$BUILD_SCRIPT" | grep -q "next build"; then
            echo "   ✅ Next.js build скрипт корректен"
        else
            echo "   ⚠️  Build скрипт не соответствует Next.js"
        fi
    elif [ "$PROJECT_TYPE" = "vite" ]; then
        if echo "$BUILD_SCRIPT" | grep -q "vite build"; then
            echo "   ✅ Vite build скрипт корректен"
        else
            echo "   ⚠️  Build скрипт не соответствует Vite"
        fi
    fi
else
    echo "   ❌ package.json не найден"
    exit 1
fi

echo ""

# 3. Проверка конфигурации
echo "⚙️  [3/8] Проверка конфигурации:"
if [ "$PROJECT_TYPE" = "nextjs" ]; then
    if [ -f "next.config.js" ]; then
        echo "   ✅ next.config.js найден"
        cat next.config.js | head -10
    else
        echo "   ⚠️  next.config.js не найден (используются настройки по умолчанию)"
    fi
elif [ "$PROJECT_TYPE" = "vite" ]; then
    if [ -f "vite.config.ts" ]; then
        echo "   ✅ vite.config.ts найден"
        if grep -q "base: './'" vite.config.ts; then
            echo "   ✅ base: './' настроен"
        else
            echo "   ⚠️  base: './' не найден (может быть причиной 404)"
        fi
    elif [ -f "vite.config.js" ]; then
        echo "   ✅ vite.config.js найден"
        if grep -q "base: './'" vite.config.js; then
            echo "   ✅ base: './' настроен"
        else
            echo "   ⚠️  base: './' не найден (может быть причиной 404)"
        fi
    else
        echo "   ❌ vite.config не найден"
    fi
fi

echo ""

# 4. Проверка entry point
echo "📄 [4/8] Проверка entry point:"
if [ "$PROJECT_TYPE" = "nextjs" ]; then
    if [ -f "src/pages/index.tsx" ] || [ -f "pages/index.tsx" ]; then
        echo "   ✅ index.tsx найден (Next.js Pages Router)"
    elif [ -f "src/app/page.tsx" ] || [ -f "app/page.tsx" ]; then
        echo "   ✅ page.tsx найден (Next.js App Router)"
    else
        echo "   ❌ Главная страница не найдена"
    fi
elif [ "$PROJECT_TYPE" = "vite" ]; then
    if [ -f "index.html" ]; then
        echo "   ✅ index.html найден"
    else
        echo "   ❌ index.html не найден"
    fi
fi

echo ""

# 5. Проверка Vercel проекта
echo "🔗 [5/8] Проверка Vercel проекта:"
if [ -f ".vercel/project.json" ]; then
    PROJECT_NAME=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Проект Vercel связан: $PROJECT_NAME"
    echo "   📋 Настройки в Vercel Dashboard:"
    echo "      - Root Directory: должен быть 'frontend' (если проект в подпапке)"
    echo "      - Framework Preset: $PROJECT_TYPE"
    echo "      - Build Command: $BUILD_SCRIPT"
    echo "      - Output Directory: .next (для Next.js) или dist (для Vite)"
else
    echo "   ⚠️  Проект Vercel не связан"
    echo "   💡 Запустите: vercel link"
fi

echo ""

# 6. Проверка зависимостей
echo "📦 [6/8] Проверка зависимостей:"
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules существует"
else
    echo "   ⚠️  node_modules не найден"
    echo "   💡 Запустите: npm install"
fi

echo ""

# 7. Тестовая сборка
echo "🔨 [7/8] Тестовая сборка:"
read -p "   Запустить тестовую сборку? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -d "node_modules" ]; then
        echo "   Запуск сборки..."
        npm run build
        if [ $? -eq 0 ]; then
            echo "   ✅ Сборка успешна"
            if [ "$PROJECT_TYPE" = "nextjs" ]; then
                if [ -d ".next" ]; then
                    echo "   ✅ Папка .next создана"
                fi
            elif [ "$PROJECT_TYPE" = "vite" ]; then
                if [ -d "dist" ]; then
                    echo "   ✅ Папка dist создана"
                fi
            fi
        else
            echo "   ❌ Ошибка сборки"
        fi
    else
        echo "   ⚠️  Сначала установите зависимости: npm install"
    fi
else
    echo "   Пропущено"
fi

echo ""

# 8. Рекомендации
echo "💡 [8/8] Рекомендации для исправления 404:"
echo ""
echo "Для $PROJECT_TYPE проекта:"
echo ""

if [ "$PROJECT_TYPE" = "nextjs" ]; then
    echo "1. ✅ Убедитесь, что в Vercel Dashboard:"
    echo "   - Framework Preset: Next.js"
    echo "   - Root Directory: frontend (если проект в подпапке)"
    echo "   - Build Command: npm run build (или next build)"
    echo "   - Output Directory: (оставьте пустым, Next.js сам знает)"
    echo ""
    echo "2. ✅ Проверьте next.config.js:"
    echo "   - output: 'standalone' может требовать дополнительной настройки"
    echo "   - Но для Vercel обычно не нужен"
    echo ""
    echo "3. ✅ Убедитесь, что src/pages/index.tsx существует"
    echo ""
    echo "4. ✅ После изменений: vercel --prod"
elif [ "$PROJECT_TYPE" = "vite" ]; then
    echo "1. ✅ Убедитесь, что в vite.config.ts есть:"
    echo "   base: './'"
    echo ""
    echo "2. ✅ В Vercel Dashboard:"
    echo "   - Framework Preset: Vite"
    echo "   - Root Directory: frontend (если проект в подпапке)"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: dist"
    echo ""
    echo "3. ✅ Убедитесь, что index.html существует"
    echo ""
    echo "4. ✅ После изменений: vercel --prod"
fi

echo ""
echo "=========================================="
echo "✅ Проверка завершена"
echo ""

