#!/usr/bin/env python3
"""
Генератор визуальных элементов бренда Tonix Chain
Создаёт OG изображение, Telegram обложку и другие промо-материалы
"""

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
    import numpy as np
except ImportError:
    print("❌ Pillow не установлен. Устанавливаю...")
    os.system(f"{sys.executable} -m pip install Pillow numpy --quiet")
    from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
    import numpy as np

# Цветовая палитра бренда
COLORS = {
    'cyan': '#00ffff',
    'blue': '#0088ff',
    'dark_blue': '#000055',
    'purple': '#5500ff',
    'dark_bg': '#000011',
    'white': '#ffffff',
    'neon_cyan': '#00ffff',
    'neon_blue': '#0088ff',
}

def hex_to_rgb(hex_color):
    """Конвертирует hex в RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_starfield(width, height, num_stars=200):
    """Создаёт звёздное поле"""
    img = Image.new('RGB', (width, height), hex_to_rgb(COLORS['dark_bg']))
    draw = ImageDraw.Draw(img)
    
    import random
    for _ in range(num_stars):
        x = random.randint(0, width)
        y = random.randint(0, height)
        brightness = random.randint(100, 255)
        size = random.randint(1, 2)
        draw.ellipse([x-size, y-size, x+size, y+size], fill=(brightness, brightness, brightness))
    
    return img

def create_gradient_background(width, height, start_color, end_color):
    """Создаёт радиальный градиент"""
    img = Image.new('RGB', (width, height), hex_to_rgb(COLORS['dark_bg']))
    pixels = np.array(img)
    
    center_x, center_y = width // 2, height // 3
    start_rgb = np.array(hex_to_rgb(start_color))
    end_rgb = np.array(hex_to_rgb(end_color))
    
    for y in range(height):
        for x in range(width):
            dist = np.sqrt((x - center_x)**2 + (y - center_y)**2)
            max_dist = np.sqrt(width**2 + height**2)
            ratio = min(dist / max_dist, 1.0)
            
            # Радиальный градиент
            color = start_rgb * (1 - ratio * 0.3) + end_rgb * (ratio * 0.3)
            pixels[y, x] = color.astype(int)
    
    return Image.fromarray(pixels.astype('uint8'))

def draw_hexagon_logo(draw, center_x, center_y, size, color):
    """Рисует шестиугольник с буквой T"""
    import math
    
    # Рисуем шестиугольник
    points = []
    for i in range(6):
        angle = math.pi / 3 * i
        x = center_x + size * math.cos(angle)
        y = center_y + size * math.sin(angle)
        points.append((x, y))
    
    # Внешний шестиугольник (свечение)
    for glow_size in [size + 8, size + 4, size]:
        glow_points = []
        for i in range(6):
            angle = math.pi / 3 * i
            x = center_x + glow_size * math.cos(angle)
            y = center_y + glow_size * math.sin(angle)
            glow_points.append((x, y))
        if glow_size == size:
            draw.polygon(glow_points, fill=color, outline=color)
        else:
            alpha = int(50 * (1 - (glow_size - size) / 8))
            glow_img = Image.new('RGBA', (1000, 1000), (0, 0, 0, 0))
            glow_draw = ImageDraw.Draw(glow_img)
            glow_draw.polygon(glow_points, fill=(*hex_to_rgb(color), alpha))
    
    # Буква T
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(size * 0.8))
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", int(size * 0.8))
        except:
            font = ImageFont.load_default()
    
    text = "T"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text((center_x - text_width/2, center_y - text_height/2), text, 
              fill=COLORS['white'], font=font)

def create_og_image():
    """Создаёт OG изображение 1200×630"""
    width, height = 1200, 630
    
    # Создаём фон
    bg = create_gradient_background(width, height, COLORS['cyan'], COLORS['dark_blue'])
    stars = create_starfield(width, height, 150)
    bg = Image.blend(bg, stars, 0.3)
    
    # Добавляем свечение
    glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([width//2 - 200, height//3 - 100, width//2 + 200, height//3 + 100], 
                     fill=(0, 255, 255, 30))
    bg = Image.alpha_composite(bg.convert('RGBA'), glow).convert('RGB')
    
    draw = ImageDraw.Draw(bg)
    
    # Логотип (шестиугольник с T)
    logo_size = 80
    draw_hexagon_logo(draw, width//2, height//2 - 80, logo_size, COLORS['cyan'])
    
    # Надпись "TONIX CHAIN"
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
    except:
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 64)
        except:
            title_font = ImageFont.load_default()
    
    title = "TONIX CHAIN"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = bbox[2] - bbox[0]
    title_x = (width - title_width) // 2
    
    # Градиентный текст (имитация)
    draw.text((title_x, height//2 + 20), title, fill=COLORS['cyan'], font=title_font)
    
    # Слоган
    try:
        slogan_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    except:
        slogan_font = ImageFont.load_default()
    
    slogan = "ЛОТЕРЕЯ БУДУЩЕГО НА TON 💎"
    bbox = draw.textbbox((0, 0), slogan, font=slogan_font)
    slogan_width = bbox[2] - bbox[0]
    slogan_x = (width - slogan_width) // 2
    draw.text((slogan_x, height//2 + 100), slogan, fill=COLORS['white'], font=slogan_font)
    
    # Кнопка "НАЧАТЬ ИГРУ"
    button_width, button_height = 300, 80
    button_x = (width - button_width) // 2
    button_y = height//2 + 180
    
    # Градиент кнопки (имитация)
    button_bg = Image.new('RGB', (button_width, button_height), hex_to_rgb(COLORS['cyan']))
    button_draw = ImageDraw.Draw(button_bg)
    button_draw.rounded_rectangle([0, 0, button_width, button_height], 
                                  radius=40, fill=COLORS['cyan'])
    
    # Текст кнопки
    try:
        button_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
    except:
        button_font = ImageFont.load_default()
    
    button_text = "НАЧАТЬ ИГРУ 💎"
    bbox = button_draw.textbbox((0, 0), button_text, font=button_font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    button_draw.text(((button_width - text_width) // 2, (button_height - text_height) // 2),
                     button_text, fill=COLORS['dark_bg'], font=button_font)
    
    bg.paste(button_bg, (button_x, button_y))
    
    return bg

def create_telegram_cover():
    """Создаёт Telegram обложку 1280×720"""
    width, height = 1280, 720
    
    # Создаём фон с градиентом от фиолетового к синему
    bg = create_gradient_background(width, height, COLORS['purple'], COLORS['blue'])
    stars = create_starfield(width, height, 300)
    bg = Image.blend(bg, stars, 0.4)
    
    # Усиленное свечение
    glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([width//4 - 150, height//2 - 150, width//4 + 150, height//2 + 150], 
                     fill=(85, 0, 255, 40))
    bg = Image.alpha_composite(bg.convert('RGBA'), glow).convert('RGB')
    
    draw = ImageDraw.Draw(bg)
    
    # Логотип слева (крупный)
    logo_size = 150
    logo_x = width//4
    draw_hexagon_logo(draw, logo_x, height//2, logo_size, COLORS['cyan'])
    
    # Надпись "TONIX CHAIN" справа от логотипа
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 96)
    except:
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 96)
        except:
            title_font = ImageFont.load_default()
    
    title = "TONIX CHAIN"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = bbox[2] - bbox[0]
    title_x = width//4 + logo_size + 60
    title_y = height//2 - 120
    
    draw.text((title_x, title_y), title, fill=COLORS['cyan'], font=title_font)
    
    # Слоган под названием
    try:
        slogan_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
    except:
        slogan_font = ImageFont.load_default()
    
    slogan = "ЛОТЕРЕЯ БУДУЩЕГО НА TON 💎"
    bbox = draw.textbbox((0, 0), slogan, font=slogan_font)
    slogan_width = bbox[2] - bbox[0]
    slogan_x = title_x
    slogan_y = title_y + 120
    draw.text((slogan_x, slogan_y), slogan, fill=COLORS['white'], font=slogan_font)
    
    return bg

def main():
    """Главная функция"""
    print("🎨 Генерация визуальных элементов бренда Tonix Chain...")
    print("=" * 60)
    
    # Создаём папку public если её нет
    os.makedirs('public', exist_ok=True)
    
    # 1. OG изображение
    print("\n📸 [1/2] Создание OG изображения (1200×630)...")
    og_image = create_og_image()
    og_path = 'public/og-image.png'
    og_image.save(og_path, 'PNG', quality=95)
    print(f"   ✅ Сохранено: {og_path}")
    
    # 2. Telegram обложка
    print("\n📸 [2/2] Создание Telegram обложки (1280×720)...")
    cover_image = create_telegram_cover()
    cover_path = 'public/telegram-cover.png'
    cover_image.save(cover_path, 'PNG', quality=95)
    print(f"   ✅ Сохранено: {cover_path}")
    
    print("\n" + "=" * 60)
    print("✅ Все изображения успешно созданы!")
    print("\n📁 Файлы:")
    print(f"   - {og_path}")
    print(f"   - {cover_path}")
    print("\n💡 Следующий шаг: обновите мета-теги в index.tsx")

if __name__ == '__main__':
    main()

