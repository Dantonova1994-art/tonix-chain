#!/bin/bash

# Скрипт для проверки настройки OG изображения

cd "$(dirname "$0")" || exit

echo "🔍 Проверка настройки OG изображения для Next.js/Vercel"
echo "=========================================================="
echo ""

# 1. Проверка наличия файла
echo "📁 [1/5] Проверка файла:"
if [ -f "public/og-image.png" ]; then
    FILE_SIZE=$(ls -lh public/og-image.png | awk '{print $5}')
    echo "   ✅ Файл найден: public/og-image.png ($FILE_SIZE)"
else
    echo "   ❌ Файл не найден: public/og-image.png"
    exit 1
fi

echo ""

# 2. Проверка размера изображения
echo "📏 [2/5] Проверка размера изображения:"
if command -v python3 &> /dev/null; then
    DIMENSIONS=$(python3 -c "from PIL import Image; img = Image.open('public/og-image.png'); print(f'{img.size[0]}×{img.size[1]}')" 2>/dev/null)
    if [ ! -z "$DIMENSIONS" ]; then
        echo "   ✅ Размер: $DIMENSIONS пикселей"
        if [ "$DIMENSIONS" = "1200×630" ]; then
            echo "   ✅ Размер соответствует стандарту OG (1200×630)"
        else
            echo "   ⚠️  Размер не соответствует стандарту OG (1200×630)"
        fi
    fi
fi

echo ""

# 3. Проверка мета-тегов в index.tsx
echo "📝 [3/5] Проверка мета-тегов в index.tsx:"
if grep -q "og:image" src/pages/index.tsx; then
    OG_IMAGE_PATH=$(grep -o 'og-image\.png' src/pages/index.tsx | head -1)
    if [ ! -z "$OG_IMAGE_PATH" ]; then
        echo "   ✅ Мета-тег og:image найден"
        SITE_URL=$(grep -o "const SITE_URL = '[^']*'" src/pages/index.tsx | cut -d"'" -f2)
        echo "   ✅ SITE_URL: $SITE_URL"
        echo "   ✅ Полный URL изображения: ${SITE_URL}/og-image.png"
    else
        echo "   ❌ Мета-тег og:image не найден"
    fi
else
    echo "   ❌ Мета-теги Open Graph не найдены"
fi

echo ""

# 4. Проверка next.config.js
echo "⚙️  [4/5] Проверка next.config.js:"
if [ -f "next.config.js" ]; then
    echo "   ✅ next.config.js найден"
    if grep -q "output.*standalone" next.config.js; then
        echo "   ⚠️  Режим 'standalone' может требовать дополнительной настройки"
        echo "   ℹ️  Но статические файлы из public/ должны работать корректно"
    fi
else
    echo "   ⚠️  next.config.js не найден (используются настройки по умолчанию)"
fi

echo ""

# 5. Проверка доступности (локальный тест)
echo "🌐 [5/5] Проверка структуры для деплоя:"
if [ -d "public" ]; then
    echo "   ✅ Папка public/ существует"
    echo "   ✅ В Next.js файлы из public/ доступны по пути /filename"
    echo "   ✅ Пример: https://tonix-lottery-ui.vercel.app/og-image.png"
else
    echo "   ❌ Папка public/ не найдена"
fi

echo ""
echo "=========================================================="
echo "📋 ИТОГОВАЯ ПРОВЕРКА"
echo "=========================================================="
echo ""
echo "✅ Для корректной работы OG изображения:"
echo ""
echo "1. Файл должен быть в: public/og-image.png"
echo "2. В мета-тегах указан путь: ${SITE_URL}/og-image.png"
echo "3. После деплоя файл будет доступен по:"
echo "   https://tonix-lottery-ui.vercel.app/og-image.png"
echo ""
echo "🔗 Проверка после деплоя:"
echo "   curl -I https://tonix-lottery-ui.vercel.app/og-image.png"
echo ""
echo "📱 Для Telegram:"
echo "   Telegram автоматически подхватит og:image из мета-тегов"
echo "   при шаринге ссылки или можно вставить прямой URL:"
echo "   https://tonix-lottery-ui.vercel.app/og-image.png"
echo ""
echo "=========================================================="

