"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export default function GalaxyParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleCount, setParticleCount] = useState(50);
  const frameCountRef = useRef(0);
  const lastFPS = useRef(60);
  const fpsCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Проверка FPS и адаптация
    let lastTime = performance.now();
    fpsCheckInterval.current = setInterval(() => {
      const now = performance.now();
      const fps = 1000 / (now - lastTime);
      lastTime = now;
      lastFPS.current = fps;

      // Если FPS < 30, уменьшаем количество частиц
      if (fps < 30 && particleCount > 25) {
        setParticleCount((prev) => Math.max(25, Math.floor(prev / 2)));
      } else if (fps > 50 && particleCount < 50) {
        setParticleCount((prev) => Math.min(50, prev + 5));
      }
    }, 1000);

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    // Отключение при скрытии вкладки
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Пауза анимации
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let animationFrame: number;
    const animate = () => {
      if (document.hidden) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 255, 255, 0.1)";

      // Обновление и отрисовка частиц
      particles.forEach((p, i) => {
        if (i >= particleCount) return;
        
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${p.opacity})`;
        ctx.fill();

        // Линии между близкими частицами
        particles.slice(i + 1).forEach((p2) => {
          if (particles.indexOf(p2) >= particleCount) return;
          
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      frameCountRef.current++;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (fpsCheckInterval.current) clearInterval(fpsCheckInterval.current);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
      aria-hidden="true"
    />
  );
}
