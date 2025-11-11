#!/bin/bash

# === TONIX CHAIN — COSMIC GLASS UI v3.1 (SHINE EDITION) ===
# Оформление: тёмный космос, пульсирующий логотип, стеклянные карточки, анимированная сетка
# Разворачивается в основной папке tonix-chain

# === 1. frontend/pages/index.tsx ===
mkdir -p frontend/pages

cat > frontend/pages/index.tsx << 'EOF'
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTonConnectUI } from "@tonconnect/ui-react";

declare global {
  interface Window {
    Telegram?: any;
  }
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tonConnectUI] = useTonConnectUI();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    const count = 60;
    const connectDist = 130;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,255,255,0.6)";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = "rgba(0,255,255,0.15)";
      particles.forEach((p1, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            ctx.globalAlpha = 1 - dist / connectDist;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(render);
    };

    render();
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      setUser(window.Telegram.WebApp.initDataUnsafe?.user);
    }
    const timer = setTimeout(() => setConnected(true), 1000);
    const handleMove = (e: any) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  const handleConnect = () => tonConnectUI.openModal();

  return (
    <main className="app">
      <canvas ref={canvasRef} className="network-bg" />

      <motion.div
        className="glow"
        animate={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,255,0.08), transparent 80%)`,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      />

      <motion.div
        className="hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="logo-glow"></div>
        <h1 className="title">TONIX CHAIN</h1>
        <p className="subtitle">Лотерея будущего на TON</p>
        <p className="desc">Децентрализованная. Прозрачная. Мгновенная.</p>
      </motion.div>

      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2>🎮 Начни игру</h2>
        {user ? (
          <p className="welcome">Привет, {user.first_name}! 👋</p>
        ) : (
          <p className="welcome">Подключи Telegram и кошелёк TON</p>
        )}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(0,255,255,0.6)" }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          onClick={handleConnect}
        >
          🚀 Подключить кошелёк
        </motion.button>
      </motion.div>

      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h2>🎁 Реферальная система</h2>
        <p className="ref-link">https://t.me/tonixchain_lottery_bot</p>
        <p className="note">
          За каждого приглашённого друга ты получаешь <b>+25 XP</b>
        </p>
      </motion.div>

      <motion.footer
        className="footer"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="status">
          {connected ? "💎 TON Network активна" : "🔄 Подключение..."}
        </p>
        <p className="copyright">TONIX CHAIN © 2025</p>
      </motion.footer>
    </main>
  );
}
EOF

# === 2. frontend/styles/globals.css ===
mkdir -p frontend/styles

cat > frontend/styles/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background: radial-gradient(circle at 50% -20%, #0f1424, #06080d 70%);
  color: white;
  min-height: 100vh;
  overflow-x: hidden;
}

.app {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px 80px;
  overflow: hidden;
}

.network-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  transition: background 0.3s ease;
}

.hero {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 3;
}

.logo-glow {
  width: 80px;
  height: 80px;
  margin: 0 auto 14px;
  background: radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(123,63,251,0.4) 60%, transparent 100%);
  border-radius: 50%;
  filter: blur(6px);
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

.title {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(90deg, #00fff6, #7b3ffb);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  text-shadow: 0 0 25px rgba(0,255,255,0.4);
}

.subtitle {
  font-size: 18px;
  font-weight: 600;
  color: #7be0ff;
  margin: 6px 0;
  text-shadow: 0 0 15px rgba(0,255,255,0.2);
}

.desc {
  font-size: 14px;
  opacity: 0.8;
}

.glass-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  backdrop-filter: blur(14px);
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.07);
  animation: cardFade 1.2s ease both;
}

@keyframes cardFade {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.glass-card h2 {
  font-size: 18px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #00eaff, #7b3ffb);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome {
  opacity: 0.9;
  margin-bottom: 14px;
}

.ref-link {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
  text-align: center;
  word-break: break-all;
}

.note {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 10px;
}

.btn-primary {
  background: linear-gradient(90deg, #00bcd4, #3f51b5);
  border: none;
  border-radius: 10px;
  padding: 14px 28px;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 0 15px rgba(0, 188, 212, 0.3);
  transition: all 0.25s ease;
  margin-top: 8px;
  width: 100%;
}

.btn-primary:hover {
  box-shadow: 0 0 35px rgba(0, 255, 255, 0.6);
  transform: translateY(-2px);
}

.footer {
  margin-top: 30px;
  text-align: center;
  opacity: 0.7;
  font-size: 13px;
  position: relative;
  z-index: 2;
}

.status {
  margin-bottom: 6px;
  color: #7be0ff;
}

.copyright {
  margin: 0;
}
EOF

# === 3. Установка зависимостей и билд ===
echo "📦 Устанавливаем зависимости и билдим проект..."

cd frontend

npm install framer-motion @tonconnect/ui-react

npm run build

echo ""
echo "✅ TONIX CHAIN v3.1 SHINE EDITION готов."
echo "Для деплоя используй:"
echo "vercel --prod --force"
echo ""
echo "После деплоя открой Mini App:"
echo "https://t.me/tonixchain_lottery_bot/app?startapp=lottery&v=9"

